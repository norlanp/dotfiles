/**
 * Outside-cwd Gate
 *
 * Prompts before write/edit targets a path outside the current working directory,
 * and before bash/powershell commands that reference paths outside it.
 *
 * Detection for shell commands is a best-effort static scan, not a shell parser.
 * It is a confirmation gate, not a security boundary.
 *
 * Scope:
 *   - Gated:   write, edit, bash, powershell
 *   - Not gated: read, grep, find, ls, MCP tools
 *
 * No UI (print/JSON/RPC): outside calls are blocked.
 *
 * Controls:
 *   --no-outside-cwd-gate   disable the gate for this run
 *   /outside-cwd            show status and toggle the gate for this session
 */

import { existsSync, realpathSync, statSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const CONFIG = {
	enabled: true,
	/** Paths outside cwd that never prompt (temp files). */
	allowedOutsideRoots: [tmpdir(), "/tmp"],
	/** Treat an existing executable file as a program invocation, not a data access. */
	exemptExecutables: true,
};

const DEV_RE = /^\/dev\/(null|stdout|stderr|tty|fd\/\d+)$/;
const URL_RE = /:\/\//;
const PROTOCOL_RELATIVE_RE = /^\/\/[^/\s]+\.[^/\s]+/;
const ASSIGN_RE = /^[A-Za-z_][A-Za-z0-9_]*=/;

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

/** Resolve symlinks by realpath-ing the nearest existing ancestor. */
function canonicalize(p: string): string {
	const abs = resolve(p);
	let cur = abs;
	const missing: string[] = [];
	while (!existsSync(cur)) {
		const parent = dirname(cur);
		if (parent === cur) return abs; // reached the root
		missing.unshift(basename(cur));
		cur = parent;
	}
	let real = abs;
	try {
		real = realpathSync(cur);
	} catch {
		return abs;
	}
	return missing.length > 0 ? join(real, ...missing) : real;
}

/** `target` is cwd itself or a descendant of it. */
function isInside(cwdReal: string, target: string): boolean {
	const rel = relative(cwdReal, target);
	return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function isExempt(target: string): boolean {
	if (DEV_RE.test(target)) return true;
	for (const root of CONFIG.allowedOutsideRoots) {
		if (isInside(canonicalize(root), target)) return true;
	}
	return false;
}

function isExecutableFile(target: string): boolean {
	try {
		const st = statSync(target);
		return st.isFile() && (st.mode & 0o111) !== 0;
	} catch {
		return false;
	}
}

/** Whether the path itself or any ancestor (short of the filesystem root) exists. */
function existsSelfOrAncestor(p: string): boolean {
	let cur = p;
	while (true) {
		if (existsSync(cur)) return true;
		const parent = dirname(cur);
		if (parent === cur || parent === "/") return false;
		cur = parent;
	}
}

function expandToken(tok: string): string {
	if (tok === "~") return homedir();
	if (tok.startsWith("~/")) return join(homedir(), tok.slice(2));
	if (tok === "$HOME" || tok === "${HOME}") return homedir();
	if (tok.startsWith("$HOME/")) return join(homedir(), tok.slice(6));
	if (tok.startsWith("${HOME}/")) return join(homedir(), tok.slice(8));
	return tok;
}

/** A shell word (quotes removed) or an operator such as `>` or `|`. */
interface Token {
	value: string;
	operator?: string;
}

/**
 * Split a command into shell-like words and operators, honoring single/double quotes, backslash
 * escapes, and `#` comments. Quoted text stays one word so a path inside a quoted string is not
 * chopped into fragments that look absolute.
 */
function tokenizeShell(command: string): Token[] {
	const tokens: Token[] = [];
	let value = "";
	let hasValue = false;
	const flush = () => {
		if (hasValue) tokens.push({ value });
		value = "";
		hasValue = false;
	};

	let i = 0;
	while (i < command.length) {
		const ch = command[i];

		if (ch === "'" || ch === '"') {
			hasValue = true;
			const quote = ch;
			i++;
			while (i < command.length && command[i] !== quote) {
				if (quote === '"' && command[i] === "\\" && i + 1 < command.length) i++;
				value += command[i];
				i++;
			}
			i++; // closing quote, or end of input
			continue;
		}

		if (ch === "\\" && i + 1 < command.length) {
			value += command[i + 1];
			hasValue = true;
			i += 2;
			continue;
		}

		// `#` only starts a comment at the start of an unquoted word.
		if (ch === "#" && !hasValue) {
			while (i < command.length && command[i] !== "\n") i++;
			continue;
		}

		if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
			flush();
			i++;
			continue;
		}

		if (";&|<>()".includes(ch)) {
			flush();
			let op = ch;
			if (command[i + 1] === ch) {
				op += ch;
				i++;
			}
			tokens.push({ value: op, operator: op });
			i++;
			continue;
		}

		value += ch;
		hasValue = true;
		i++;
	}
	flush();
	return tokens;
}

/**
 * Blank out heredoc bodies (`cat <<EOF ... EOF`) so their text is not scanned as arguments. The
 * operator is found via the quote-aware tokenizer, so `<<` inside quotes is not mistaken for one.
 */
function stripHeredocs(command: string): string {
	const out: string[] = [];
	let pending: { delim: string; stripTabs: boolean } | undefined;
	for (const line of command.split("\n")) {
		if (pending !== undefined) {
			const candidate = pending.stripTabs ? line.replace(/^\t+/, "") : line;
			if (candidate === pending.delim) {
				out.push(line);
				pending = undefined;
			} else {
				out.push("");
			}
			continue;
		}
		out.push(line);
		const found = findHeredoc(line);
		if (found !== undefined) pending = found;
	}
	return out.join("\n");
}

/** Heredoc operator and delimiter opened on a line, if any. */
function findHeredoc(line: string): { delim: string; stripTabs: boolean } | undefined {
	const tokens = tokenizeShell(line);
	for (let i = 0; i < tokens.length - 1; i++) {
		if (tokens[i].operator !== "<<") continue;
		const next = tokens[i + 1];
		if (next.operator !== undefined) continue;
		const stripTabs = next.value.startsWith("-");
		const delim = stripTabs ? next.value.slice(1) : next.value;
		if (delim) return { delim, stripTabs };
	}
	return undefined;
}

/**
 * Sed/grep/awk expressions like `/^dependencies:/,/^dev_dependencies:/p` start with a slash but are
 * not paths. A regex-only leading character or a slash-delimited address range is the tell.
 */
function looksLikePattern(tok: string): boolean {
	if (!tok.startsWith("/")) return false;
	if (tok.includes("$HOME") || tok.includes("${HOME}")) return false;
	// Only characters that can open a valid regex; a glob such as `/*` stays a path candidate.
	const second = tok[1];
	if (second !== undefined && "^$[\\%".includes(second)) return true;
	const range = /^\/([^/]+)\/,\/([^/]+)\/[a-zA-Z]*$/.exec(tok);
	if (range === null) return false;
	const metach = /[\^$.*\[\]\\]/;
	return metach.test(range[1]) || metach.test(range[2]);
}

// ---------------------------------------------------------------------------
// Shell candidate extraction
// ---------------------------------------------------------------------------

interface Candidate {
	raw: string;
	isRedirection: boolean;
}

function extractCandidates(command: string): Candidate[] {
	const tokens = tokenizeShell(stripHeredocs(command));
	const out: Candidate[] = [];
	const seen = new Set<string>();
	const push = (value: string, isRedirection: boolean) => {
		if (!value) return;
		const key = `${isRedirection ? "R" : "T"}\u0000${value}`;
		if (seen.has(key)) return;
		seen.add(key);
		out.push({ raw: value, isRedirection });
	};

	/** Push a word when it references a path (absolute, home-relative, or containing a slash). */
	const pushIfPath = (tok: string) => {
		const isAbs = tok.startsWith("/");
		const isHome =
			tok === "~" ||
			tok.startsWith("~/") ||
			tok === "$HOME" ||
			tok.startsWith("$HOME/") ||
			tok === "${HOME}" ||
			tok.startsWith("${HOME}/");
		const isTraversal = /(^|\/)\.\.($|\/)/.test(tok);
		const hasSlash = tok.includes("/");
		if (!isAbs && !isHome && !isTraversal && !hasSlash) return;
		if (looksLikePattern(tok)) return;
		push(tok, false);
	};

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];

		if (token.operator !== undefined) {
			// The next word is a redirection target, except for heredoc delimiters and fd duplications.
			if (token.operator === ">" || token.operator === ">>" || token.operator === "<") {
				const next = tokens[i + 1];
				if (next !== undefined && next.operator === undefined) {
					push(next.value, true);
					i++;
				}
			}
			continue;
		}

		const tok = token.value;
		if (!tok || URL_RE.test(tok)) continue;
		if (tok === "-") continue;

		// `KEY=value` is an assignment whose value is used via `$KEY`, not a path operand.
		if (ASSIGN_RE.test(tok)) continue;
		if (tok.startsWith("-")) {
			// `--opt=value`: the value can still be a path operand.
			const eq = tok.indexOf("=");
			if (eq > 0) {
				const value = tok.slice(eq + 1);
				if (value && !value.includes(":") && !value.startsWith("-")) pushIfPath(value);
			}
			continue;
		};

		pushIfPath(tok);
	}

	return out;
}

interface FlaggedPath {
	/** Canonical target used for gating. */
	target: string;
	/** Absolute path as requested, before symlink resolution. */
	requested: string;
}

/** Return resolved outside-cwd paths referenced by a command (empty = allowed). */
function findOutsidePaths(command: string, cwd: string): FlaggedPath[] {
	const cwdReal = canonicalize(cwd);
	const flagged: FlaggedPath[] = [];
	for (const { raw, isRedirection } of extractCandidates(command)) {
		const requested = resolve(cwd, expandToken(raw));
		// `//host.tld/...` is a protocol-relative URL unless that path or an ancestor exists.
		// Redirection targets are always file writes, so they never get the URL escape.
		if (!isRedirection && PROTOCOL_RELATIVE_RE.test(raw) && !existsSelfOrAncestor(requested)) {
			continue;
		}
		const target = canonicalize(requested);
		if (isInside(cwdReal, target)) continue;
		if (isExempt(target)) continue;
		if (!isRedirection && CONFIG.exemptExecutables && isExecutableFile(target)) continue;
		if (!flagged.some((f) => f.target === target)) flagged.push({ target, requested });
	}
	return flagged;
}

/** Return outside-cwd paths for a single write/edit target. */
function pathOutside(p: string, cwd: string): FlaggedPath[] {
	const cwdReal = canonicalize(cwd);
	const requested = resolve(cwd, p);
	const target = canonicalize(requested);
	if (isInside(cwdReal, target) || isExempt(target)) return [];
	return [{ target, requested }];
}

/**
 * Session allowlist root for a requested path: existing directories are allowed directly, existing
 * files allow their containing directory, and not-yet-created paths allow the path itself. Symlinks
 * are resolved only on the chosen directory, which keeps symlinked siblings in the same folder
 * covered rather than resolving the file to a different tree.
 */
function allowRootFor(requested: string): string {
	let dir = requested;
	try {
		if (!statSync(requested).isDirectory()) dir = dirname(requested);
	} catch {
		// Not created yet; keep the requested path as the root.
	}
	return canonicalize(dir);
}

// ---------------------------------------------------------------------------
// Extension
// ---------------------------------------------------------------------------

export default function (pi: ExtensionAPI) {
	const sessionAllowedDirs = new Set<string>();
	let confirmChain: Promise<unknown> = Promise.resolve();
	let gateEnabled = CONFIG.enabled;

	/** A target is allowed when it is a session-allowed directory or a descendant of one. */
	function isSessionAllowed(target: string): boolean {
		for (const root of sessionAllowedDirs) {
			if (isInside(root, target)) return true;
		}
		return false;
	}

	pi.registerFlag("no-outside-cwd-gate", {
		description: "Disable the outside-cwd confirmation gate for this run",
		type: "boolean",
		default: false,
	});

	pi.on("session_start", async (_event, ctx) => {
		sessionAllowedDirs.clear();
		gateEnabled = CONFIG.enabled && !(pi.getFlag("no-outside-cwd-gate") as boolean);
		if (!gateEnabled) ctx.ui.notify("Outside-cwd gate disabled", "warning");
	});

	pi.on("session_shutdown", async () => {
		sessionAllowedDirs.clear();
	});

	pi.registerCommand("outside-cwd", {
		description: "Show status of the outside-cwd gate and toggle it for this session",
		handler: async (_args, ctx) => {
			gateEnabled = !gateEnabled;
			const allowed = [...sessionAllowedDirs];
			ctx.ui.notify(
				[
					`Outside-cwd gate: ${gateEnabled ? "enabled" : "disabled"}`,
					`Allowed outside roots: ${CONFIG.allowedOutsideRoots.join(", ")}`,
					`Session-allowed directories: ${allowed.length > 0 ? allowed.join(", ") : "(none)"}`,
				].join("\n"),
				"info",
			);
		},
	});

	function confirmOutside(
		ctx: { hasUI: boolean; ui: { select(title: string, options: string[]): Promise<string | undefined> } },
		toolName: string,
		detail: string,
		paths: FlaggedPath[],
	): Promise<{ block: boolean; reason: string } | undefined> {
		// Serialize prompts: pi supports one active select dialog, and parallel tool calls
		// from one assistant message would otherwise stack dialogs and lose earlier answers.
		const answer = confirmChain.then(() => promptOutside(ctx, toolName, detail, paths));
		confirmChain = answer.then(
			() => undefined,
			() => undefined,
		);
		return answer;
	}

	async function promptOutside(
		ctx: { hasUI: boolean; ui: { select(title: string, options: string[]): Promise<string | undefined> } },
		toolName: string,
		detail: string,
		paths: FlaggedPath[],
	): Promise<{ block: boolean; reason: string } | undefined> {
		const toAsk = paths.filter((f) => !isSessionAllowed(f.target));
		if (toAsk.length === 0) return undefined;

		if (!ctx.hasUI) {
			return { block: true, reason: `Blocked by outside-cwd gate (no UI): ${toAsk.map((f) => f.target).join(", ")}` };
		}

		const choice = await ctx.ui.select(
			`⚠️ Outside working directory\nTool: ${toolName}\n${detail}`,
			["Allow once", "Allow this directory for this session", "Block"],
		);

		if (choice === "Allow once") return undefined;
		if (choice === "Allow this directory for this session") {
			for (const f of toAsk) sessionAllowedDirs.add(allowRootFor(f.requested));
			return undefined;
		}
		return { block: true, reason: `Blocked by outside-cwd gate: ${toAsk.map((f) => f.target).join(", ")}` };
	}

	pi.on("tool_call", async (event, ctx) => {
		if (!gateEnabled) return undefined;

		if (event.toolName === "write" || event.toolName === "edit") {
			const p = event.input.path;
			if (typeof p !== "string" || p.length === 0) return undefined;
			const paths = pathOutside(p, ctx.cwd);
			if (paths.length === 0) return undefined;
			return confirmOutside(ctx, event.toolName, `Path: ${paths[0].target}`, paths);
		}

		if (event.toolName === "bash" || event.toolName === "powershell") {
			const command = event.input.command;
			if (typeof command !== "string" || command.length === 0) return undefined;
			const paths = findOutsidePaths(command, ctx.cwd);
			if (paths.length === 0) return undefined;
			const shown = command.length > 300 ? `${command.slice(0, 300)}…` : command;
			return confirmOutside(ctx, event.toolName, `Command: ${shown}\nPaths: ${paths.map((f) => f.target).join(", ")}`, paths);
		}

		return undefined;
	});
}

/**
 * Outside-cwd Gate
 *
 * Prompts before write/edit target a path outside the current working directory, and before
 * bash/powershell commands that reference paths outside it.
 *
 * Model (mirrors OpenCode's permission system):
 *   - Every request is described by glob patterns. An outside target produces a `<dir>/*` glob:
 *     the target itself for directories and not-yet-created paths, the containing directory for
 *     existing files. The filesystem root is never granted wholesale.
 *   - "Allow once" permits the current call only. "Allow always" records the request globs for the
 *     session; OpenCode-style wildcard matching (`*` crosses directory separators) then covers
 *     later requests, including ones already queued behind the prompt.
 *   - "Reject" blocks the call and reports the paths.
 *   - Arguments of the commands in PATH_COMMANDS are resolved through the filesystem the way
 *     OpenCode's bash tool does, so a symlinked argument is caught. Other commands are scanned for
 *     path-like operands and redirection targets.
 *
 * Detection for shell commands is a best-effort static scan, not a shell parser. It is a
 * confirmation gate, not a security boundary.
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

/** Commands whose arguments OpenCode resolves through the filesystem before gating. */
const PATH_COMMANDS = new Set(["cd", "rm", "cp", "mv", "mkdir", "touch", "chmod", "chown", "cat"]);

const COMMAND_SEPARATORS = new Set([";", "&&", "||", "|", "&", "\n", "(", ")"]);
const REDIRECTIONS = new Set([">", ">>", "<"]);

const DEV_RE = /^\/dev\/(null|stdout|stderr|tty|fd\/\d+)$/;
const URL_RE = /:\/\//;
const PROTOCOL_RELATIVE_RE = /^\/\/[^/\s]+\.[^/\s]+/;
const ASSIGN_RE = /^[A-Za-z_][A-Za-z0-9_]*=/;

// ---------------------------------------------------------------------------
// Permission patterns
// ---------------------------------------------------------------------------

/**
 * Match a value against an OpenCode permission glob. `*` matches any characters including
 * separators, `?` matches one, and a trailing `" *"` also matches the bare prefix.
 */
export function globMatch(value: string, pattern: string): boolean {
	let escaped = pattern
		.replace(/[.+^${}()|[\]\\]/g, "\\$&")
		.replace(/\*/g, ".*")
		.replace(/\?/g, ".");
	if (escaped.endsWith(" .*")) escaped = `${escaped.slice(0, -3)}( .*)?`;
	return new RegExp(`^${escaped}$`, "s").test(value);
}

/** Whether every request pattern is already covered by an approved pattern. */
function covered(patterns: string[], approved: string[]): boolean {
	return patterns.every((p) => approved.some((a) => globMatch(p, a)));
}

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

function isDirectory(target: string): boolean {
	try {
		return statSync(target).isDirectory();
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

// ---------------------------------------------------------------------------
// Shell tokenizing
// ---------------------------------------------------------------------------

/** A shell word (quotes removed) or an operator such as `>` or `|`. */
interface Token {
	value: string;
	operator?: string;
}

/**
 * Split a command into shell-like words and operators, honoring single/double quotes, backslash
 * escapes, and `#` comments. Quoted text stays one word so a path inside a quoted string is not
 * chopped into fragments that look absolute. Newlines are emitted as separators.
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

		if (ch === "\n") {
			flush();
			tokens.push({ value: "\n", operator: "\n" });
			i++;
			continue;
		}

		if (ch === " " || ch === "\t" || ch === "\r") {
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

/** Group tokens into simple commands, splitting on separators such as `;`, `&&`, `|`, newlines. */
function splitCommands(tokens: Token[]): Token[][] {
	const commands: Token[][] = [];
	let current: Token[] = [];
	for (const token of tokens) {
		if (token.operator !== undefined && COMMAND_SEPARATORS.has(token.operator)) {
			if (current.length > 0) commands.push(current);
			current = [];
			continue;
		}
		current.push(token);
	}
	if (current.length > 0) commands.push(current);
	return commands;
}

/** Command name (without a directory prefix) and its word arguments, skipping redirection targets. */
function commandNameAndArgs(tokens: Token[]): { name?: string; args: string[] } {
	let name: string | undefined;
	const args: string[] = [];
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.operator !== undefined) {
			if (REDIRECTIONS.has(token.operator)) i++; // skip the target word
			continue;
		}
		if (name === undefined) {
			if (ASSIGN_RE.test(token.value)) continue;
			name = token.value.split("/").pop() ?? token.value;
			continue;
		}
		args.push(token.value);
	}
	return { name, args };
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

function isPathLike(tok: string): boolean {
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
	if (!isAbs && !isHome && !isTraversal && !hasSlash) return false;
	return !looksLikePattern(tok);
}

// ---------------------------------------------------------------------------
// Outside-path extraction
// ---------------------------------------------------------------------------

/** An outside target together with the session pattern that would approve it. */
export interface FlaggedPath {
	/** Canonical target used for gating. */
	target: string;
	/** Absolute path as requested, before symlink resolution. */
	requested: string;
	/** OpenCode-style directory glob: `<target dir>/*`. */
	glob: string;
}

function toFlagged(requested: string): FlaggedPath {
	const target = canonicalize(requested);
	// Directories grant their contents; existing files grant their containing directory;
	// not-yet-created paths grant only their own subtree. Clamp the root so one approval of a
	// root-level target cannot record `/*` and silently cover the whole filesystem.
	let dir = target;
	if (!isDirectory(requested) && existsSync(requested)) dir = dirname(target);
	if (dir === "/") dir = target;
	return { target, requested, glob: join(dir, "*") };
}

interface Candidate {
	raw: string;
	isRedirection: boolean;
}

export function extractCandidates(command: string): Candidate[] {
	const out: Candidate[] = [];
	const seen = new Set<string>();
	const push = (raw: string, isRedirection: boolean) => {
		if (!raw) return;
		const key = `${isRedirection ? "R" : "T"}\u0000${raw}`;
		if (seen.has(key)) return;
		seen.add(key);
		out.push({ raw, isRedirection });
	};

	for (const segment of splitCommands(tokenizeShell(stripHeredocs(command)))) {
		// Redirection targets are always file writes.
		for (let i = 0; i < segment.length; i++) {
			const token = segment[i];
			if (token.operator !== undefined && REDIRECTIONS.has(token.operator)) {
				const next = segment[i + 1];
				if (next !== undefined && next.operator === undefined) {
					push(next.value, true);
					i++;
				}
			}
		}

		// Broad scan: path-like operands of any command.
		for (const token of segment) {
			if (token.operator !== undefined) continue;
			const raw = token.value;
			if (!raw || URL_RE.test(raw) || raw === "-" || ASSIGN_RE.test(raw)) continue;
			if (raw.startsWith("-")) {
				// `--opt=value`: the value can still be a path operand.
				const eq = raw.indexOf("=");
				if (eq > 0) {
					const value = raw.slice(eq + 1);
					if (value && !value.includes(":") && !value.startsWith("-") && isPathLike(value)) push(value, false);
				}
				continue;
			}
			if (isPathLike(raw)) push(raw, false);
		}

		// OpenCode-style: resolve every non-flag argument of known path commands.
		const { name, args } = commandNameAndArgs(segment);
		if (name === undefined || !PATH_COMMANDS.has(name)) continue;
		for (const arg of args) {
			if (arg.startsWith("-")) continue;
			if (name === "chmod" && arg.startsWith("+")) continue;
			push(arg, false);
		}
	}

	return out;
}

/** Return resolved outside-cwd paths referenced by a command (empty = allowed). */
export function findOutsidePaths(command: string, cwd: string): FlaggedPath[] {
	const cwdReal = canonicalize(cwd);
	const flagged: FlaggedPath[] = [];
	const seen = new Set<string>();
	for (const { raw, isRedirection } of extractCandidates(command)) {
		const requested = resolve(cwd, expandToken(raw));
		// `//host.tld/...` is a protocol-relative URL unless that path or an ancestor exists.
		// Redirection targets are always file writes, so they never get the URL escape.
		if (!isRedirection && PROTOCOL_RELATIVE_RE.test(raw) && !existsSelfOrAncestor(requested)) {
			continue;
		}
		const target = canonicalize(requested);
		if (isInside(cwdReal, target) || isExempt(target)) continue;
		if (!isRedirection && CONFIG.exemptExecutables && isExecutableFile(target)) continue;
		if (seen.has(target)) continue;
		seen.add(target);
		flagged.push(toFlagged(requested));
	}
	return flagged;
}

/** Return outside-cwd paths for a single write/edit target. */
export function pathOutside(p: string, cwd: string): FlaggedPath[] {
	const cwdReal = canonicalize(cwd);
	const requested = resolve(cwd, p);
	const target = canonicalize(requested);
	if (isInside(cwdReal, target) || isExempt(target)) return [];
	return [toFlagged(requested)];
}

// ---------------------------------------------------------------------------
// Extension
// ---------------------------------------------------------------------------

interface GateContext {
	cwd: string;
	hasUI: boolean;
	ui: { select(title: string, options: string[]): Promise<string | undefined> };
}

interface GateResult {
	block: true;
	reason: string;
}

const OPTION_ONCE = "Allow once";
const OPTION_ALWAYS = "Allow always for this session";
const OPTION_REJECT = "Reject";

export default function (pi: ExtensionAPI) {
	const approvedPatterns: string[] = [];
	let confirmChain: Promise<unknown> = Promise.resolve();
	let gateEnabled = CONFIG.enabled;

	pi.registerFlag("no-outside-cwd-gate", {
		description: "Disable the outside-cwd confirmation gate for this run",
		type: "boolean",
		default: false,
	});

	pi.on("session_start", async (_event, ctx) => {
		approvedPatterns.length = 0;
		gateEnabled = CONFIG.enabled && !(pi.getFlag("no-outside-cwd-gate") as boolean);
		if (!gateEnabled) ctx.ui.notify("Outside-cwd gate disabled", "warning");
	});

	pi.on("session_shutdown", async () => {
		approvedPatterns.length = 0;
	});

	pi.registerCommand("outside-cwd", {
		description: "Show status of the outside-cwd gate and toggle it for this session",
		handler: async (_args, ctx) => {
			gateEnabled = !gateEnabled;
			ctx.ui.notify(
				[
					`Outside-cwd gate: ${gateEnabled ? "enabled" : "disabled"}`,
					`Allowed outside roots: ${CONFIG.allowedOutsideRoots.join(", ")}`,
					`Session-approved patterns: ${approvedPatterns.length > 0 ? approvedPatterns.join(", ") : "(none)"}`,
				].join("\n"),
				"info",
			);
		},
	});

	function describe(toolName: string, detail: string, paths: FlaggedPath[]): string {
		const globs = [...new Set(paths.map((f) => f.glob))];
		return `⚠️ Outside working directory\nTool: ${toolName}\n${detail}\nApproving covers: ${globs.join(", ")}`;
	}

	async function prompt(
		ctx: GateContext,
		toolName: string,
		detail: string,
		paths: FlaggedPath[],
	): Promise<GateResult | undefined> {
		if (!ctx.hasUI) {
			return { block: true, reason: `Blocked by outside-cwd gate (no UI): ${paths.map((f) => f.target).join(", ")}` };
		}
		const choice = await ctx.ui.select(describe(toolName, detail, paths), [OPTION_ONCE, OPTION_ALWAYS, OPTION_REJECT]);
		if (choice === OPTION_ONCE) return undefined;
		if (choice === OPTION_ALWAYS) {
			for (const glob of new Set(paths.map((f) => f.glob))) approvedPatterns.push(glob);
			return undefined;
		}
		return { block: true, reason: `Blocked by outside-cwd gate: ${paths.map((f) => f.target).join(", ")}` };
	}

	/**
	 * Serialize prompts: pi supports one active select dialog, and parallel tool calls from one
	 * assistant message would otherwise stack dialogs. Re-checking approvals inside the serialized
	 * section lets an "always" answer resolve the requests queued behind it, as OpenCode does.
	 */
	function gate(
		ctx: GateContext,
		toolName: string,
		detail: (paths: FlaggedPath[]) => string,
		paths: FlaggedPath[],
	): Promise<GateResult | undefined> {
		const run = confirmChain.then(() => {
			const pending = paths.filter((f) => !covered([f.glob], approvedPatterns));
			if (pending.length === 0) return undefined;
			return prompt(ctx, toolName, detail(pending), pending);
		});
		confirmChain = run.then(
			() => undefined,
			() => undefined,
		);
		return run;
	}

	pi.on("tool_call", async (event, ctx) => {
		if (!gateEnabled) return undefined;

		if (event.toolName === "write" || event.toolName === "edit") {
			const p = event.input.path;
			if (typeof p !== "string" || p.length === 0) return undefined;
			const paths = pathOutside(p, ctx.cwd);
			if (paths.length === 0) return undefined;
			return gate(ctx, event.toolName, (pending) => `Path: ${pending[0].target}`, paths);
		}

		if (event.toolName === "bash" || event.toolName === "powershell") {
			const command = event.input.command;
			if (typeof command !== "string" || command.length === 0) return undefined;
			const paths = findOutsidePaths(command, ctx.cwd);
			if (paths.length === 0) return undefined;
			const shown = command.length > 300 ? `${command.slice(0, 300)}…` : command;
			return gate(ctx, event.toolName, (pending) => `Command: ${shown}\nPaths: ${pending.map((f) => f.target).join(", ")}`, paths);
		}

		return undefined;
	});
}

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

function expandToken(tok: string): string {
	if (tok === "~") return homedir();
	if (tok.startsWith("~/")) return join(homedir(), tok.slice(2));
	if (tok === "$HOME" || tok === "${HOME}") return homedir();
	if (tok.startsWith("$HOME/")) return join(homedir(), tok.slice(6));
	if (tok.startsWith("${HOME}/")) return join(homedir(), tok.slice(8));
	return tok;
}

function stripQuotes(tok: string): string {
	if (tok.length >= 2 && ((tok.startsWith('"') && tok.endsWith('"')) || (tok.startsWith("'") && tok.endsWith("'")))) {
		return tok.slice(1, -1);
	}
	return tok;
}

// ---------------------------------------------------------------------------
// Shell candidate extraction
// ---------------------------------------------------------------------------

interface Candidate {
	raw: string;
	isRedirection: boolean;
}

function extractCandidates(command: string): Candidate[] {
	const out: Candidate[] = [];
	const seen = new Set<string>();
	const push = (raw: string, isRedirection: boolean) => {
		const value = stripQuotes(raw);
		if (!value) return;
		const key = `${isRedirection ? "R" : "T"}\u0000${value}`;
		if (seen.has(key)) return;
		seen.add(key);
		out.push({ raw: value, isRedirection });
	};

	// Redirection targets are always treated as writes.
	const redir = /(?:>>?|<<?)\s*("[^"]*"|'[^']*'|[^\s;&|<>()]+)/g;
	let m: RegExpExecArray | null;
	while ((m = redir.exec(command)) !== null) push(m[1], true);

	// Best-effort token scan.
	for (const token of command.split(/[\s;&|<>()]+/)) {
		let tok = stripQuotes(token);
		if (!tok || URL_RE.test(tok)) continue;

		if (tok === "-") continue;
		const eq = tok.indexOf("=");
		if (eq > 0 && (tok.startsWith("-") || ASSIGN_RE.test(tok))) {
			tok = tok.slice(eq + 1);
			if (!tok) continue;
		} else if (tok.startsWith("-")) {
			continue;
		}

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

		if (isAbs || isHome || isTraversal || hasSlash) push(tok, false);
	}

	return out;
}

/** Return resolved outside-cwd paths referenced by a command (empty = allowed). */
function findOutsidePaths(command: string, cwd: string): string[] {
	const cwdReal = canonicalize(cwd);
	const flagged: string[] = [];
	for (const { raw, isRedirection } of extractCandidates(command)) {
		const expanded = expandToken(raw);
		const target = canonicalize(resolve(cwd, expanded));
		if (isInside(cwdReal, target)) continue;
		if (isExempt(target)) continue;
		if (!isRedirection && CONFIG.exemptExecutables && isExecutableFile(target)) continue;
		if (!flagged.includes(target)) flagged.push(target);
	}
	return flagged;
}

/** Return outside-cwd paths for a single write/edit target. */
function pathOutside(p: string, cwd: string): string[] {
	const cwdReal = canonicalize(cwd);
	const target = canonicalize(resolve(cwd, p));
	if (isInside(cwdReal, target) || isExempt(target)) return [];
	return [target];
}

// ---------------------------------------------------------------------------
// Extension
// ---------------------------------------------------------------------------

export default function (pi: ExtensionAPI) {
	const sessionAllowed = new Set<string>();
	let gateEnabled = CONFIG.enabled;

	pi.registerFlag("no-outside-cwd-gate", {
		description: "Disable the outside-cwd confirmation gate for this run",
		type: "boolean",
		default: false,
	});

	pi.on("session_start", async (_event, ctx) => {
		sessionAllowed.clear();
		gateEnabled = CONFIG.enabled && !(pi.getFlag("no-outside-cwd-gate") as boolean);
		if (!gateEnabled) ctx.ui.notify("Outside-cwd gate disabled", "warning");
	});

	pi.on("session_shutdown", async () => {
		sessionAllowed.clear();
	});

	pi.registerCommand("outside-cwd", {
		description: "Show status of the outside-cwd gate and toggle it for this session",
		handler: async (_args, ctx) => {
			gateEnabled = !gateEnabled;
			const allowed = [...sessionAllowed];
			ctx.ui.notify(
				[
					`Outside-cwd gate: ${gateEnabled ? "enabled" : "disabled"}`,
					`Allowed outside roots: ${CONFIG.allowedOutsideRoots.join(", ")}`,
					`Session-allowed paths: ${allowed.length > 0 ? allowed.join(", ") : "(none)"}`,
				].join("\n"),
				"info",
			);
		},
	});

	async function confirmOutside(
		ctx: { hasUI: boolean; ui: { select(title: string, options: string[]): Promise<string | undefined> } },
		toolName: string,
		detail: string,
		paths: string[],
	): Promise<{ block: boolean; reason: string } | undefined> {
		const toAsk = paths.filter((p) => !sessionAllowed.has(p));
		if (toAsk.length === 0) return undefined;

		if (!ctx.hasUI) {
			return { block: true, reason: `Blocked by outside-cwd gate (no UI): ${toAsk.join(", ")}` };
		}

		const choice = await ctx.ui.select(
			`⚠️ Outside working directory\nTool: ${toolName}\n${detail}`,
			["Allow once", "Allow this path for this session", "Block"],
		);

		if (choice === "Allow once") return undefined;
		if (choice === "Allow this path for this session") {
			for (const p of toAsk) sessionAllowed.add(p);
			return undefined;
		}
		return { block: true, reason: `Blocked by outside-cwd gate: ${toAsk.join(", ")}` };
	}

	pi.on("tool_call", async (event, ctx) => {
		if (!gateEnabled) return undefined;

		if (event.toolName === "write" || event.toolName === "edit") {
			const p = event.input.path;
			if (typeof p !== "string" || p.length === 0) return undefined;
			const paths = pathOutside(p, ctx.cwd);
			if (paths.length === 0) return undefined;
			return confirmOutside(ctx, event.toolName, `Path: ${paths[0]}`, paths);
		}

		if (event.toolName === "bash" || event.toolName === "powershell") {
			const command = event.input.command;
			if (typeof command !== "string" || command.length === 0) return undefined;
			const paths = findOutsidePaths(command, ctx.cwd);
			if (paths.length === 0) return undefined;
			const shown = command.length > 300 ? `${command.slice(0, 300)}…` : command;
			return confirmOutside(ctx, event.toolName, `Command: ${shown}\nPaths: ${paths.join(", ")}`, paths);
		}

		return undefined;
	});
}

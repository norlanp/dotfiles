## Communication

Be brief.

## Coding guidelines

- **Minimal scope** — only what's requested, no speculative features, don't build for imagined future needs (YAGNI)
- **Clarity** — simplest solution wins, no emojis, human-readable code
- **Fail fast** — surface errors early, never hide or swallow failures, always propagate or surface
- **No secrets** — env vars only, never commit credentials
- **No AI slop** — no unnecessary comments, no `any` casts
- **Prompt with choices** — include a recommended default
- **Least privilege** — minimal permissions, minimal dependencies, minimal API surface
- **Idiomatic code** — generate code in the style and conventions of the target language, not translated from another paradigm
- **Project conventions** — follow existing patterns, naming, and structure in the codebase; if unclear, adopt language-idiomatic industry standards
- **Simple control flow** — bounded loops; no recursion
- **Short functions** — ~60 lines, single responsibility
- **Smallest variable scope** — check all return values
- **Compile clean** — zero warnings
- **Guard clauses** — early returns, reduce nesting
- **Validate inputs at boundaries** — function entries, API endpoints, external data
- **Prefer immutable data** — const/final by default, avoid shared mutable state

## Tests

Write tests for meaningful code only — core business logic, edge cases, public APIs that affect consumers.

Skip boilerplate: trivial getters/setters, generated code, thin wrappers.

When refactoring: ensure core requirement tests exist first, verify behavior unchanged after. Delete or update tests for code that intentionally changes.

## Docs

- All docs in `docs/`
- Track functional capabilities and status in `docs/features.md`

## Git

- Confirm before write/destructive operations
- Format: `type: description` (feat/fix/docs/refactor/test/chore/style/perf)
- No AI/agent mentions or Co-authored-by trailers

## Safety

- Confirm before: operations outside cwd, system-wide changes, unknown URLs
- Use `./tmp/` and `./var/` instead of `/tmp` or `/var`; add to .gitignore
- Clean up background processes
- Sanitize all external input — never trust user data, env vars, API responses
- Pin dependencies — exact versions, no ranges

## Python

- Use `uv` for packages, venvs, scripts; `uvx` for impromptu dependencies
## Guidelines

- **Minimal scope** — only what's requested, no speculative features, don't build for imagined future needs (YAGNI)
- **Clarity** — simplest solution wins, no emojis, human-readable code
- **Fail fast** — surface errors early, never hide or swallow failures, always propagate or surface
- **No secrets** — env vars only, never commit credentials
- **No AI slop** — no unnecessary comments, no `any` casts
- **Prompt with choices** — include a recommended default
- **Least privilege** — minimal permissions, minimal dependencies, minimal API surface
- **Idiomatic code** — generate code in the style and conventions of the target language, not translated from another paradigm
- **Project conventions** — follow existing patterns, naming, and structure in the codebase; if unclear, adopt language-idiomatic industry standards

## Code

- Simple control flow; bounded loops; no recursion
- Short functions (~60 lines, single responsibility)
- Smallest variable scope; check all return values
- Compile clean — zero warnings
- Guard clauses — early returns, reduce nesting
- Validate inputs at boundaries — function entries, API endpoints, external data
- Prefer immutable data — const/final by default, avoid shared mutable state

## TDD

**Iron law:** No code without failing test first. Wrote code first? Delete it. Implement fresh from tests.

Cycle: failing test → run → minimal code → run → refactor → commit

No rationalizations: "test after", "too simple", "keep as reference", "just this once"

## Docs

- All docs in `docs/`
- PRDs at `docs/prds/{name}/`, status in `docs/capabilities.md`
- Status flow: brainstormed → draft → approved → planning → in-progress → completed
- Use `/orchestrator [name]` to create PRDs

## Ad hoc Tasks

Track in `todo.txt` at project root:

```
[ ] open task @file:src/foo.py
[x] done task @file:src/bar.py
```

- Use for unstructured work; use `/orchestrator` for structured/multi-session work
- Persists across sessions

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

## Caveman

~75% fewer output tokens. Technical substance intact. Default: **ultra**. Switch: `/caveman lite|full|ultra`.

- **Drop:** articles, filler, pleasantries, hedging. Fragments OK. Short synonyms. Technical terms exact. Code/errors unchanged
- **Pattern:** `[thing] [action] [reason]. [next step].`
- **lite:** no filler/hedging, keep articles + full sentences
- **full:** drop articles, fragments OK, short synonyms
- **ultra:** abbreviate, strip conjunctions, causal arrows (X → Y), one word when enough
- **Auto-clarity:** drop caveman for security warnings, irreversible confirmations, ambiguous sequences, confused user. Resume after
- **Boundaries:** code/commits/PRs normal. "stop caveman" / "normal mode" → revert. Level persists per session

## Python

- Use `uv` for packages, venvs, scripts; `uvx` for impromptu dependencies
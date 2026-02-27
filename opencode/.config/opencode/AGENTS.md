## Development Guidelines

### Core Principles
1. **Minimal scope** - implement only what's requested, no speculative features
2. **Clarity** - readable, self-documenting code; simplest solution wins
3. **Fail fast** - surface errors early, never hide failures
4. **No secrets** - use env vars, never commit credentials
5. **No AI slop** - no unnecessary comments, no `any` casts, match file style, no emojis
6. **Prompt with choices** - when user input is required, provide concise options they can pick from and include a recommended default

### Code Quality (Power of Ten)
- Simple control flow - no goto, recursion; loops have fixed bounds
- No dynamic allocation after init
- Short functions - max ~60 lines, single responsibility
- Min 2 assertions per function - check pre/post conditions
- Smallest variable scope; check all return values, use all returns
- Compile clean - zero warnings, use static analyzers

### TDD
Red→Green→Refactor. Test real behavior, not mocks.

**Iron law:** No code without failing test first. Wrote code first? **Delete it.** Don't keep as reference, don't adapt it, don't look at it. Implement fresh from tests.

Cycle: failing test → run (watch fail) → minimal code → run (watch pass) → refactor → commit

**Rationalizations = restart:** "test after", "too simple", "keep as reference", "just this once"

### Docs
- All docs in `docs/` (requirements.md, architecture.md)
- PRDs: `docs/prds/{featureName}/`, status in `docs/prds/capabilities.md`
- PRD statuses: draft → approved → planning → in-progress → completed
- **Always invoke `/orchestrator [feature-name]` to create PRDs**

### Git
- **Confirm with user before any git operation**
- Format: `type: description` (feat/fix/docs/refactor/test/chore/style/perf)
- No AI/agent mentions or Co-authored-by trailers - write as human

### Safety
- **Confirm before:** operations outside cwd, system-wide changes, fetching URLs not provided by user
- Clean up background processes when done
- **Never use system directories** - use `./tmp/` and `./var/` in cwd instead of `/tmp` or `/var`; add to .gitignore

### Python
- Must use `uv` for packages, venvs, scripts
- For running impromptu commands that require dependencies not installed, use `uvx`

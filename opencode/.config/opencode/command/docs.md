# Documentation Management

`/docs [quick|full]` - Documentation health and maintenance

| Mode | Time | Description |
|------|------|-------------|
| `quick` (default) | <5 min | Fast spot check - 9 inline checks |
| `full` | 2-3h | Comprehensive 5-phase audit via orchestrator |

## Quick Mode

Run inline spot checks against documentation health.

### Checks

1. **Verify config consistency**: ports, URLs, versions across README, agents.md, docs/*
2. **Verify core docs exist**: docs/architecture.md, docs/requirements.md
3. **Verify component counts match** across files
4. **Check recent features**: `git log -10` feat: commits documented?
5. **Validate links**: docs/ links resolve
6. **Check code blocks**: have language identifiers
7. **Verify terminology**: consistent naming across files
8. **Validate PRD capabilities**: `docs/prds/capabilities.md` matches actual PRD dirs
   - Each PRD has matching `docs/prds/{name}/` dir
   - Status reflects actual state, completed have `completion-summary.md`
   - In-progress have `agent-prompts/`, `agent-logs/`
9. **Validate PRD cross-refs**: PRDs reference correct arch/requirements docs
   - FRD/ERD align with docs/architecture.md, requirements traceable

### Output

```
# Doc Health Check
Date: {date}

## Summary
✅ PASS: X | ❌ FAIL: Y | ⚠️ WARN: Z

## Results
### ❌ {check name}
Issue: {description} file:line
Fix: {action} (time estimate)

## Action Items
Immediate: [ ] ...
Short-term: [ ] ...

## Status
🔴 NEEDS ATTENTION (3+) | 🟡 MINOR (1-2) | 🟢 HEALTHY
```

## Full Mode

Comprehensive audit via orchestrator. Usage: `/docs full`

Executes 20-task audit via `/orchestrator update-documentation`:

- **Phase 1** (Parallel): Core docs (README, docs/architecture.md, docs/requirements.md, SETUP)
- **Phase 2** (Parallel): Component/module docs
- **Phase 3** (Parallel): User guides, config docs
- **Phase 4** (Serial): Cross-reference, link validation, PRD capabilities sync
- **Phase 5** (Serial): Final consistency check, PRD/arch alignment

~80% time savings via parallelization.

### When to Run

1. Run `/docs` (quick) first
   - 0-2 issues → can wait
   - 3-5 issues → consider this week
   - 6+ issues → run immediately
2. Also run: weekly, before releases, after major features

### PRD Cross-Checks

- `docs/prds/capabilities.md` status matches actual PRD dirs
- Completed PRDs have `completion-summary.md`, no orphan logs/prompts
- In-progress PRDs have valid `agent-prompts/`, `agent-logs/`
- FRD/ERD align with docs/architecture.md patterns
- PRD requirements traceable to docs/requirements.md

### Output

- `docs/prds/update-documentation/completion-summary.md`: findings, top 10 issues, prioritized files, action items, metrics
- `docs/prds/update-documentation/agent-logs/`: detailed logs (deleted on completion)

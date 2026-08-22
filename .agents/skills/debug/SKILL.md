---
name: debug
description: Systematic root cause analysis. No fixes without investigation
---

# Debug

`/debug [issue-description]`

**Iron Law: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.**

Read-only git allowed (`git diff`, recent commits). No write/destructive git.

## Phases

1. **Investigate** - Read errors fully, reproduce reliably, check recent changes, trace data flow to source
2. **Analyze** - Find working examples in codebase, compare against broken, list every difference
3. **Hypothesize** - State one specific hypothesis, test minimally (smallest change, one variable)
4. **Implement** - Failing test first for meaningful code, single targeted fix, verify no regressions

If 3+ fixes fail, STOP and question the architecture. Discuss with user before continuing.

Aligns with AGENTS.md: fail fast, surface errors early.
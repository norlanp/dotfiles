# Orchestrator

`/orchestrator [feature-name]`

Plan & coordinate, **NEVER implement**. Delegate to agents in `.opencode/agents/`.

---

## Agent Modes

| Mode | Use | Effort |
|------|-----|--------|
| `[T1]` | PRD, plans, reviews | High |
| `[T2]` | Implementation (default) | Medium |
| `[T3]` | Logs/status | Low |

Use `subagent_type="general"`. **Gates stay in primary session** — never delegate approvals.

---

## Todo Tracking

Session continuity via `docs/prds/{name}/todos.json`:

```json
{
  "feature": "{name}",
  "status": "init",
  "todos": [
    {"id": 1, "description": "X", "status": "pending", "deps": []},
    {"id": 2, "description": "Y", "status": "pending", "deps": [1]}
  ]
}
```

Workflow statuses: `init`, `approved`, `planning`, `in_progress`, `completed`
Todo statuses: `pending`, `in_progress`, `blocked`, `completed`

**Resume**: Load todos.json if status != `init`

---

## Phase 1: Init

1. Feature: arg → use | scan `capabilities.md` | kebab-case
2. Create dirs: `.opencode/`, `docs/prds/{name}/`
3. **RESUME**: Load todos.json → resume if status != `init`
4. `design.md` exists? → PM uses as input
5. PRD exists & approved? → step 9 | PRD exists & draft? → step 8 | else → step 7

### PRD
6. `[T1]` PM → write PRD (skip if design.md)
7. `capabilities.md` → `draft`
8. **GATE**: User approves
9. `capabilities.md` → `approved`, todos.json → `approved`

### Size
10. `S` (<3) | `M` (3-7) | `L` (8-15) | `XL` (15+) | regulated → `XL`
11. `S`: `capabilities.md` → `planning`, PM creates todos.json from PRD → Phase 3
12. `M/L/XL`: `capabilities.md` → `planning` → Phase 2

---

## Phase 2: Plan

13. **GATE**: Approved PRD + size `M/L/XL`
14. `[T1]` Architect → write execution-plan.md → convert to todos.json with deps (overwrites if exists)
15. **PROCEED** - no gate

---

## Phase 3: Execute

16. **GATE**: todos.json has tasks
17. todos.json → `in_progress`
18. `[T2]` Spawn via Task tool
19. **Review each todo**:
    - `[T1]` Requirements Reviewer → verify PRD REQs/ACs
    - `[T1]` Code Reviewer → TDD, clean code, QA
    - FAIL → `[T2]` Fix → re-run
    - Max 3 iterations → escalate
20. Update todo.status as work completes
21. Blockers → debug | resequence

---

## Phase 4: Complete

22. **PREREQ**: All todos `completed`
23. Run tests, integration check
24. `/docs quick`
25. Write `completion-summary.md`
26. **GATE**: User final approval
27. todos.json → `completed`, `capabilities.md` → `completed`
28. Cleanup: delete `agent-logs/`, `agent-prompts/`

---

## Directory

```
docs/prds/
├── capabilities.md
└── {name}/
    ├── design.md (optional)
    ├── {name}.md (PRD)
    ├── execution-plan.md (M/L/XL)
    ├── todos.json
    └── completion-summary.md

.opencode/
├── agents/*.md
├── agent-logs/ (ephemeral)
└── agent-prompts/ (ephemeral)
```

---

## PRD Template

```
Meta: ID=PRD-{name} | Status=draft|approved | Size=S|M|L|XL

Problem: WHAT | WHO | WHY
Scope: IN [x]feature | OUT [ ]excluded

Requirements:
| REQ-001 | requirement | P0 | GIVEN/WHEN/THEN |

Acceptance Criteria:
| AC-001 | REQ-ref | GIVEN/WHEN/THEN |

APIs:
| API-001 | method | path | REQ-ref |
```

---

## Workflow

```
/orchestrator {name} → init → plan (M/L/XL) → execute + review → complete
```
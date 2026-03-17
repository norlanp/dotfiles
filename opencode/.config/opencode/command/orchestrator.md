# Orchestrator

`/orchestrator [feature-name]`

Plan & coordinate, **NEVER implement**. Delegate via Task tool (`subagent_type="general"`), using `.opencode/agents/` personas/prompts when present.

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

Workflow statuses (`todos.json.status`): `init`, `approved`, `planning`, `in_progress`, `completed`
Capabilities statuses (`docs/capabilities.md`): `brainstormed`, `draft`, `approved`, `planning`, `in-progress`, `completed`
Todo statuses: `pending`, `in_progress`, `blocked`, `completed`

**Resume**: Load todos.json only if status is `approved`, `planning`, or `in_progress` (never auto-resume `completed`)

---

## Phase 1: Init

1. Feature: arg → use | scan existing `docs/capabilities.md` if present | kebab-case
2. Create dirs/files: `.opencode/`, `docs/`, `docs/prds/{name}/`, `docs/capabilities.md` (if missing)
3. **RESUME**: Load todos.json → resume only if status in `approved|planning|in_progress`
4. `design.md` exists? → PM uses as input
5. PRD exists & approved? → step 9 | PRD exists & draft? → step 8 | else → step 6

### PRD
6. `[T1]` PM → write PRD (use `design.md` as primary input when present)
7. `docs/capabilities.md` → `draft`
8. **GATE**: User approves
9. `docs/capabilities.md` → `approved`, todos.json → `approved`

### Size
10. `S` (<3) | `M` (3-7) | `L` (8-15) | `XL` (15+) | regulated → `XL`
11. `S`: `docs/capabilities.md` → `planning`, PM creates todos.json from PRD → Phase 3
12. `M/L/XL`: `docs/capabilities.md` → `planning` → Phase 2

---

## Phase 2: Plan

13. **GATE**: Approved PRD + size `M/L/XL`
14. `[T1]` Architect → write execution-plan.md → convert to todos.json with deps (preserve existing `in_progress`/`completed` todos; append/merge missing tasks only)
15. **PROCEED** - no gate

---

## Phase 3: Execute

16. **GATE**: todos.json has tasks
17. todos.json → `in_progress`, `docs/capabilities.md` → `in-progress`
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
27. todos.json → `completed`, `docs/capabilities.md` → `completed`
28. Cleanup: delete `docs/prds/{name}/agent-logs/`, `docs/prds/{name}/agent-prompts/` (do not delete unrelated root-level artifacts)

---

## Directory

```
docs/
├── capabilities.md
└── prds/{name}/
    ├── design.md (optional)
    ├── {name}.md (PRD)
    ├── execution-plan.md (M/L/XL)
    ├── todos.json
    ├── agent-logs/ (ephemeral)
    ├── agent-prompts/ (ephemeral)
    └── completion-summary.md
```

---

## PRD Template

```
Meta: ID=PRD-{name} | Status=draft|approved (PRD file) | Size=S|M|L|XL

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

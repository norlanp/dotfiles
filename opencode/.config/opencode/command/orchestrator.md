# Orchestrator

`/orchestrator [feature-name]`

Plan & coordinate, **NEVER implement**. Always delegate ALL work to 25+ yr distinguished/principal agents via `.opencode/agent-types/`. No exceptions regardless of task size.

---

## Model Tiers

Spawn sub-agents with appropriate capability tiers to optimize cost while maintaining quality.

| Tier | Tag | Capability | Tasks |
|------|-----|-----------|-------|
| T1 | `[T1:reasoning]` | Highest analytical depth, architectural judgment | PRD/FRD/ERD, review gates, execution plans |
| T2 | `[T2:balanced]` | Strong coding + reasoning, cost-effective | Implementation, fixing, QA, debugging |
| T3 | `[T3:quick]` | Fast, low-cost, structured output | Agent logs, status updates |

**Task tool mapping**: `[T1:reasoning]` → `model: "opus"` | `[T2:balanced]` → `model: "sonnet"` | `[T3:quick]` → `model: "haiku"`

**Fallback**: If tier unavailable, use next-lower tier.

---

## Phase 1: Init

1. Feature: arg → use | none → scan `docs/prds/capabilities.md` | kebab-case
2. Create `.opencode/agent-types/` if missing
3. **RESUME CHECK**: Scan for existing PRD/FRD/ERD/execution-plan → resume from current state
4. **DESIGN CHECK**: `docs/prds/{name}/design.md` exists? → PM agent uses as input for PRD
5. PRD exists + approved? → Phase 1b | PRD exists + draft? → step 8 | else → 1a

### 1a: PRD
6. `[T1:reasoning]` Spawn Distinguished PM agent → discovery questions, write PRD
   - If `design.md` exists: use as primary input, skip redundant discovery
   - If no design: full discovery process
7. Update `capabilities.md` → status=`draft`
8. **GATE**: Present PRD to user → iterate until approved
9. Update `capabilities.md` → status=`approved`

### 1b: Size & FRD/ERD
10. Assess size: `S` (< 3 tasks) | `M` (3-7) | `L` (8-15) | `XL` (15+)
11. **M/L/XL**: `[T1:reasoning]` Spawn parallel agents:
    - Distinguished BA → `frd.md` (functional requirements)
    - Distinguished Architect → `erd.md` (engineering requirements)
12. **GATE**: Wait for both FRD + ERD completion
13. **GATE**: Review both docs with user → approve or iterate
14. Update `capabilities.md` → status=`planning`
15. **S-size**: Skip FRD/ERD, proceed to Phase 2

---

## Phase 2: Plan

16. **GATE**: Verify exists: PRD (required), FRD + ERD (required for M/L/XL)
17. `[T1:reasoning]` Spawn Distinguished Architect agent → read PRD/FRD/ERD/arch, write `execution-plan.md`
     - Tasks with `[PARALLEL]/[SERIAL]/[DEPENDS_ON]` markers
     - Agent type per task
     - **Explicit TDD steps per task** (see Task prompt template)
     - Two-stage review gates after implementation tasks
     - **PROCEED IMMEDIATELY after creation - no approval gate**

---

## Phase 3: Prompts

19. Check/create agent types in `.opencode/agent-types/` from defaults
20. **MANDATORY**: Generate `agent-prompts/task{N}-phase{M}-{type}.md` for EACH task in plan
21. Verify all prompts created automatically
22. Update `capabilities.md` → status=`in-progress`
23. Proceed to Phase 4 (auto-spawn all agents)

---

## Phase 4: Execute

24. **GATE**: Verify prompts exist for next task(s) before spawning
25. **MANDATORY**: `[T2:balanced]` Spawn via `Task` tool, `subagent_type="general"` | parallel = single msg
26. **NEVER** do implementation work directly - always delegate to sub-agents (ALL sizes)
27. Monitor `agent-logs/`, check blockers
28. **TWO-STAGE REVIEW LOOP** (for code tasks):
    - Task COMPLETED → Stage 1: `[T1:reasoning]` Spawn Requirements Compliance Reviewer
    - Stage 1 PASS → Stage 2: `[T1:reasoning]` Spawn Code Quality Reviewer + QA
    - Stage 2: Code review + QA (web features: Playwright MCP if available)
    - Stage 2 PASS → next task
    - Either FAIL → `[T2:balanced]` spawn Fix agent with specific issues → re-run failed stage
    - Max 3 iterations per stage, then escalate to user
    - Skip reviews for docs/planning tasks
29. Blockers → debug/adjust | deps change → resequence
30. Fail → respawn from logs or escalate to user

---

## Phase 5: Complete

31. Run full test suite, delegate any fixes to sub-agents
32. `/check-docs`, update arch if changed
33. All pass → write `completion-summary.md`
34. **GATE**: Present summary to user for final approval
35. Archive: delete `agent-logs/`, delete `agent-prompts/`
36. Update `capabilities.md` → status=`completed`

---

## Agent Types

Location: `.opencode/agent-types/` (per-project). All 25+ yrs, distinguished/principal level.

| Type | Focus |
|------|-------|
| distinguished-product-manager | PRDs, strategy |
| distinguished-business-analyst | FRDs, acceptance criteria |
| distinguished-software-architect | ERDs, APIs, NFRs |
| distinguished-engineer | impl, clean code, TDD |
| distinguished-frontend-engineer | UI, a11y |
| distinguished-api-engineer | API design |
| distinguished-database-engineer | schema, migrations |
| distinguished-qa-engineer | testing, verification |
| distinguished-requirements-reviewer | requirements compliance (Stage 1) |
| distinguished-code-reviewer | code quality (Stage 2) |
| distinguished-debugger | root cause, systematic |
| distinguished-test-engineer | TDD, unit/e2e |

---

## Prompts

All agents: 25+ yrs distinguished/principal. All outputs: machine-parseable with explicit IDs.

### PRD
```
Persona: distinguished-product-manager | Output: docs/prds/{name}/{name}.md
Design input: docs/prds/{name}/design.md (if exists)

## Meta: ID=PRD-{name} | Status=draft|approved | Size=S|M|L|XL | Deps=[systems]

## Problem: WHAT {statement} | WHO {user} | WHY {measurable value}

## Scope: IN [x]{feature}→FR-{N} | OUT [ ]{excluded}

## Requirements
| ID | Requirement | Pri | AC: GIVEN/WHEN/THEN |
| REQ-001 | {req} | P0-2 | {context}/{action}/{outcome} |

## Stories
| US-001 | As {actor} want {goal} for {benefit} | REQs | ACs |

## Success: {metric}={target} via {measurement}
```

### FRD
```
Persona: distinguished-business-analyst | Output: frd.md
Refs: PRD-{name}

## Functional Reqs
| FR-001 | {atomic req} | REQ-ref | P0 | AC-FR-001 |

## Acceptance: AC-FR-001 | FR-ref | GIVEN/WHEN/THEN | edges

## Flows (FLOW-001): US-ref | trigger | steps[ACTOR]{action}→FR | success | ERRs

## Data: DATA-001 | entity | attrs | constraints | FR-ref

## Integrations: INT-001 | system | IN/OUT | payload | FR-ref | protocol

## Errors: ERR-001 | condition | response | FR-ref | recovery

## Trace: REQ→FRs→FLOWs→TESTs
```

### ERD
```
Persona: distinguished-software-architect | Output: erd.md
Refs: PRD-{name}, FRD-{name}

## ADRs: ADR-001 | decision | options | chosen | rationale | FR-ref

## Components: COMP-001 | name | responsibility | FR-refs | deps

## APIs (API-001): FR-ref | COMP-ref | method | path | auth | req{} | res{} | errors[]

## Models (MODEL-001): FR-ref | DATA-ref
| field | type | constraints | idx | desc |
Relations: from→to | type | constraint

## NFRs: NFR-001 | category | req | target | measure | FR-ref

## Risks: RISK-001 | risk | prob | impact | mitigation | owner

## Trace: FR→COMPs→APIs→MODELs→NFRs
```

### Task
```
ID: task{N}-phase{M} | Type: {type} | Deps: {IDs}
Persona: .opencode/agent-types/{type}.md
Refs: FR-{IDs} | AC-{IDs} | COMP-{IDs} | API-{IDs}

Objective: {what + why}
Files: PRD/FRD/ERD paths + source paths

ACs: | AC-FR-{N} | given | when | then |

TDD (code tasks): 1.write failing test 2.verify fail 3.minimal impl 4.verify pass 5.refactor 6.commit

Success: [ ]ACs satisfied [ ]test-first [ ]saw fail [ ]minimal [ ]green [ ]no regression

Log→agent-logs/task{N}-phase{M}.md (use `[T3:quick]` for log writes)
status: IN_PROGRESS|COMPLETED|BLOCKED | fr_refs | ac_refs | files | tests | blockers
```

### Stage 1: Spec Compliance
```
Persona: distinguished-requirements-reviewer
Task: {id} | Files: {changed} | Refs: FR-{IDs}, AC-{IDs}

Matrix: | AC-ID | criteria | PASS/FAIL | evidence |

Check: [ ]all FRs impl [ ]all ACs satisfied [ ]no scope creep [ ]edges [ ]errors
Skip code quality (Stage 2).

Output: result=PASS|FAIL | compliance[{ac,status,evidence}] | issues[{ac,type,desc}]
```

### Stage 2: Code Quality
```
Persona: distinguished-code-reviewer
Task: {id} | Prereq: Stage 1 PASS

Check: TDD | clean | DRY | YAGNI | errors | test coverage
QA (web): Playwright MCP | E2E | edge cases

Output: result=PASS|FAIL | issues[{sev,cat,loc,desc,fix}]
```

### QA
```
Persona: distinguished-qa-engineer
Task: {id} | Refs: FLOW-{IDs}, INT-{IDs}, ERR-{IDs}

Matrix: | test | type | ref | status |
Playwright: MCP→execute | unavailable→document scenarios

Output: result=PASS|FAIL|NEEDS_PLAYWRIGHT | tests[] | failures[]
```

### Fix
```
Persona: distinguished-engineer
Task: {id} | Issues: [{id,sev,loc,desc}]

Strategy: root cause → simplest fix → risk
Output: fixes[{issue,cause,fix,files,tests}] | verification
```

### Review
```
Persona: distinguished-code-reviewer
Files: {paths}
Check: [ ]arch [ ]patterns [ ]security [ ]perf
Output: APPROVED|CHANGES_NEEDED + issues[{file,line,sev,issue,fix}]
```

---

## Structure

```
docs/prds/
├── capabilities.md              # status tracker
└── {name}/
    ├── design.md                # from /brainstorm (optional, informs PRD)
    ├── {name}.md                # PRD
    ├── frd.md, erd.md           # M/L/XL only
    ├── execution-plan.md
    ├── agent-prompts/, agent-logs/  # deleted on complete
    └── completion-summary.md

.opencode/agent-types/*.md
```

## Workflow Integration

```
/brainstorm {name}     → docs/prds/{name}/design.md (status: brainstormed)
/orchestrator {name}   → reads design.md if exists → PRD → FRD/ERD → plan → execute
```

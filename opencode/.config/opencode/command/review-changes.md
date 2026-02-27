# Review Changes

`/review-changes` - Code review workflow

## Priority
🔴 High - must fix | 🟠 Medium - should fix | 🔵 Low - suggestion

## Agent Modes

| Mode | Tag | Use | Effort |
|------|-----|-----|--------|
| T1 | `[T1:deep]` | Reviewer passes (architecture/security/domain) | High |
| T2 | `[T2:balanced]` | Issue fixes and re-validation | Medium |
| T3 | `[T3:quick]` | Triage/status only (no approvals/security decisions) | Low |

OpenCode/OpenAI compatibility:

- `T1/T2/T3` are orchestration modes (effort/risk), not model names.
- Task tool mapping: use `subagent_type="general"` for all modes.
- If runtime effort variants exist, map `T1=high`, `T2=medium`, `T3=low`; otherwise keep one model and enforce mode by prompt depth/evidence.
- Downgrade only when blocked by time/tooling constraints, and record why in review notes.

## Flow

1. **Scope** (MANDATORY):
   - **If invoked directly** (`/review-changes`): Ask user what to review → confirm
   - **If invoked from orchestrator** (Phase 4.6): Use uncommitted changes from feature implementation (git diff)
2. **Context** (MANDATORY): git status/diff/log, read arch docs
3. **Select personas** (MANDATORY) based on changes:

   **Required (all 25+ yrs):**
   - Distinguished Architect - architecture, scalability, debt
   - Distinguished SME ({domain}) - domain logic, business rules, edge cases
   - Distinguished Security Architect - threats, auth, compliance

   **Additional (all 25+ yrs):**
   | Change | Specialist |
   |--------|------------|
   | Perf | Distinguished Performance Engineer |
   | API | Distinguished API Designer |
   | DB | Distinguished Data Architect |
   | DevOps | Distinguished Platform Engineer |
   | UI | Distinguished UX Engineer |

4. (MANDATORY) `[T1:deep]` **Spawn reviewers** immediately via Task tool (no confirmation needed) → each returns findings w/ 🔴🟠🔵 + file:line
5. **Report** (MANDATORY):
   ```
   # Review: {scope}
   Reviewers: {list}

   ## Findings
   ### {Persona}
   - 🔴 {issue} file:line
   - 🟠 {issue} file:line

   ## Verdict: ✅ APPROVED | 🔄 CHANGES_NEEDED
   ## Actions: {list}
   ```
6. **Iterate** (MANDATORY): If issues exist, immediately delegate fixes to specialized sub-agents:
   - Analyze dependencies between issues (shared files, sequential logic, etc.)
   - **Parallel**: Independent issues → `[T2:balanced]` spawn all sub-agents in single message (multiple Task calls)
   - **Serial**: Dependent issues → `[T2:balanced]` spawn sub-agents one at a time, wait for completion
   - Use Task tool with **Distinguished** specialists (25+ yrs) matching issue domain
   - Each sub-agent receives: issue description, file:line, priority, context
   - Sub-agent implements fix and reports back
   - Re-review after all fixes complete

## SME Selection (all 25+ yrs)

Detect domain from: README, docs/, domain models, variable names, business logic

| Domain | SME |
|--------|-----|
| Finance/Banking | Distinguished Financial Analyst |
| Trading/Markets | Distinguished Day Trader/Quant |
| Healthcare | Distinguished Clinical/Medical Expert |
| E-commerce | Distinguished Retail/Commerce Expert |
| Legal | Distinguished Legal Expert |
| Logistics | Distinguished Supply Chain Expert |
| Gaming | Distinguished Game Designer |
| EdTech | Distinguished Education Specialist |

**Unknown domain**: Infer from project context (README, code, docs) → select appropriate SME. Fallback: Distinguished Business Analyst.

SME validates: business rules correct, edge cases handled, domain terminology accurate, regulatory compliance

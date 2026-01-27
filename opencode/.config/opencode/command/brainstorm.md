# Brainstorm

`/brainstorm [feature-name]`

Collaborative design exploration before formal requirements. Socratic questioning → validated design → handoff to orchestrator.

---

## Phase 1: Context

1. Feature: arg → use | none → ask | kebab-case
2. Check `docs/prds/{name}/` exists → resume or fresh
3. Read: README, `docs/architecture.md`, recent commits, related code
4. State: "Starting brainstorm for {name}. Let me understand what we're building."

---

## Phase 2: Discovery

**Rules:**
- ONE question per message (never multiple)
- Prefer multiple-choice when possible (easier to answer)
- Open-ended OK for exploration
- If topic needs depth, break into sequential questions

**Focus areas:**
- Purpose: What problem does this solve?
- Users: Who uses it? How?
- Constraints: What must it integrate with?
- Success: How do we know it works?
- Edge cases: What could go wrong?

**Example flow:**
```
Q1: "What's the main problem this solves? 
    (a) Performance issue (b) Missing feature (c) UX improvement (d) Other"

Q2: "Who's the primary user?
    (a) End users (b) Developers (c) Admins (d) All"

Q3: "What existing system does this integrate with?" [open-ended]
```

---

## Phase 3: Alternatives

1. Propose 2-3 approaches with trade-offs
2. Lead with your recommendation + reasoning
3. Present conversationally, not as formal doc
4. Ask: "Which direction feels right?"

**Format:**
```
I see three approaches:

**Option A: [Name]** (recommended)
[2-3 sentences on approach]
Trade-offs: [pros/cons]

**Option B: [Name]**
[2-3 sentences]
Trade-offs: [pros/cons]

**Option C: [Name]**
[2-3 sentences]
Trade-offs: [pros/cons]

I recommend A because [reasoning]. What do you think?
```

---

## Phase 4: Design Presentation

**Rules:**
- Present in 200-300 word sections
- After each section: "Does this look right so far?"
- Be ready to revise based on feedback
- Apply YAGNI ruthlessly - cut unnecessary features

**Sections:**
1. Overview & Goals
2. Architecture / Components
3. Data flow
4. Error handling
5. Testing strategy
6. Open questions (if any)

---

## Phase 5: Save & Handoff

1. Create `docs/prds/{name}/` if missing
2. Write validated design to `docs/prds/{name}/design.md`
3. Update `docs/prds/capabilities.md` → add entry with status=`brainstormed`

**Design doc format:**
```markdown
# {Feature Name} Design

**Status:** Brainstormed  
**Date:** YYYY-MM-DD  
**Participants:** User, AI

## Problem Statement
[What problem this solves]

## Goals
- [Goal 1]
- [Goal 2]

## Approach
[Selected approach with rationale]

### Alternatives Considered
- **Option B:** [Why not chosen]
- **Option C:** [Why not chosen]

## Architecture
[Components, data flow]

## Error Handling
[Edge cases, failure modes]

## Testing Strategy
[How to verify it works]

## Open Questions
[Unresolved items, if any]
```

4. **Handoff prompt:**
```
Design saved to docs/prds/{name}/design.md

Next steps:
- `/orchestrator {name}` → Full PRD + planning + execution
- Continue brainstorming → Refine design further
- Manual implementation → Use design as guide

Which would you like?
```

---

## Integration with Orchestrator

When `/orchestrator {name}` runs:
- Phase 1 checks for existing `design.md`
- If found: PM agent reads design.md as input for PRD
- Design decisions flow into formal requirements
- No duplicate discovery work

---

## Key Principles

- **One question at a time** - Don't overwhelm
- **Multiple choice preferred** - Lower friction than open-ended
- **Incremental validation** - Small chunks, confirm each
- **YAGNI ruthlessly** - Cut features that aren't essential
- **Explore alternatives** - Always 2-3 options before deciding
- **Design ≠ PRD** - Design captures exploration; PRD captures requirements

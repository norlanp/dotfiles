---
name: brainstorm
description: Collaborative design exploration before formal requirements
---

# Brainstorm

`/brainstorm [feature-name]`

Collaborative design exploration before formal requirements. Relentless questioning until shared understanding, then validated design → implementation.

---

## Phase 1: Context

1. Feature: arg → use | none → ask with choices (new feature name) and recommend `new feature name` | kebab-case
2. Create dirs: `.opencode/`, `docs/designs/{name}/`
3. Read: README, `docs/architecture.md`, recent commits, related code
   - Invocation of `/brainstorm` is treated as explicit approval for read-only git commands in the current repo (recent commits); no git write operations
4. Check `docs/designs/{name}/design.md` exists → resume or fresh
5. State: "Starting brainstorm for {name}. Let me understand what we're building."

---

## Phase 2: Discovery (Grill Mode)

**Rules:**
- **ONE** question per message (never multiple)
- Prefer multiple-choice when possible (easier to answer)
- Open-ended OK for exploration
- If topic needs depth, break into sequential questions
- **For each question, provide your recommended answer.**
- **Explore the codebase instead of asking** when the question can be answered by inspection
- Walk down each branch of the design tree, resolving dependencies between decisions one-by-one
- Do not stop until shared understanding is reached

**Focus areas:**
- Purpose: What problem does this solve?
- Users: Who uses it? How?
- Size: Estimate scope
  - `S` (<3 changes) → implement directly
  - `M` (3-7 changes) → write plan first
  - `L` (8-15 changes) → write plan first
  - `XL` (15+ changes) → write plan first
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

## Phase 5: Save & Outcome

1. Write validated design to `docs/designs/{name}/design.md`
2. Update `docs/features.md` → add entry (designs are saved and tracked there)

### Small (`S`)

3. Proceed to implement immediately — no plan needed
4. **Prompt:**
```
Design saved to docs/designs/{name}/design.md

Feature is small. Starting implementation now.
```

### Medium/Large/XL (`M`/`L`/`XL`)

3. Write `{name}-plan.md` to `docs/designs/{name}/`
4. Update `docs/features.md` → note plan exists
5. **Prompt:**
```
Design saved to docs/designs/{name}/design.md
Plan saved to docs/designs/{name}/{name}-plan.md

Ready to implement.
```

**Plan format:**
```markdown
# {Feature} Plan

**Size:** {M|L|XL}
**Date:** YYYY-MM-DD

## Implementation Order
1. [Step 1]
2. [Step 2]

## Key Risks
- [Risk 1] → mitigation

## Verification
- [ ] Criteria
```

---

## Key Principles

- **One question at a time** - Don't overwhelm
- **Multiple choice preferred** - Lower friction than open-ended
- **Incremental validation** - Small chunks, confirm each
- **YAGNI ruthlessly** - Cut features that aren't essential
- **Explore alternatives** - Always 2-3 options before deciding
- **Design ≠ Requirements** - Design captures exploration; requirements capture decisions
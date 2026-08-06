---
name: ui-shape
description: Plan UX/UI before code. Structured discovery interview to design brief
---

# UI Shape

`/ui-shape [feature]` - Plan UX/UI before code. Structured discovery interview → design brief. No code, only thinking.

## Flow

### Phase 1: Discovery Interview

Ask in natural dialogue, not all at once:

**Purpose & Context**:
- What is this feature for? What problem does it solve?
- Who specifically will use it? (role, context, frequency)
- What does success look like?
- User's state of mind? (Rushed? Exploring? Anxious? Focused?)

**Content & Data**:
- What content/data does it display or collect?
- Realistic ranges? (min, typical, max items)
- Edge cases? (empty, error, first-time, power user)
- Dynamic content? What changes, how often?

**Design Goals**:
- Single most important thing a user should do/understand?
- What should it feel like? (Fast, calm, fun, premium?)
- Existing patterns to be consistent with?
- Reference examples that capture the right feel?

**Constraints**:
- Technical? (Framework, perf budget, browser support)
- Content? (Localization, dynamic text length)
- Mobile/responsive requirements?
- Accessibility beyond WCAG AA?

**Anti-Goals**:
- What should this NOT be?
- Biggest risk of getting it wrong?

### Phase 2: Design Brief

Synthesize into structured brief:

**1. Feature Summary** (2-3 sentences)
**2. Primary User Action** (the ONE thing)
**3. Design Direction** (how it should feel, aesthetic approach)
**4. Layout Strategy** (spatial approach, hierarchy, rhythm)
**5. Key States** (default, empty, loading, error, success, edge cases)
**6. Interaction Model** (click, hover, scroll, feedback, flow)
**7. Content Requirements** (copy, labels, messages, dynamic ranges)
**8. Recommended References** (which domain references help during implementation)
**9. Open Questions** (unresolved items for implementer)

Get explicit confirmation. If user disagrees, revisit discovery questions.

The brief guides implementation via any approach. For full discover-then-build in one step, use `/ui-craft` instead.
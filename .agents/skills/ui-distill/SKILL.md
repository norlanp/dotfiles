---
name: ui-distill
description: Strip design to essence. Remove unnecessary complexity
---

# UI Distill

`/ui-distill [target]` - Strip design to essence. Remove unnecessary complexity, declutter, reduce noise. Simplicity with power.

## Flow

1. **Assess complexity sources**:
   - Too many elements competing
   - Excessive variation (colors, fonts, sizes)
   - Information overload (everything visible at once)
   - Visual noise (borders, shadows, decorations without purpose)
   - Confusing hierarchy
   - Feature creep

2. **Find the essence**:
   - Primary user goal (should be ONE)
   - What's truly necessary vs nice-to-have
   - What can be removed, hidden, or combined
   - 20% that delivers 80% of value

3. **Simplify systematically**

## Simplification Dimensions

### Information Architecture
- Remove secondary actions and redundant info
- Progressive disclosure (hide complexity behind entry points)
- Combine related actions
- ONE primary action, few secondary, rest tertiary/hidden
- Remove redundancy

### Visual
- Reduce to 1-2 colors + neutrals
- One font family, 3-4 sizes, 2-3 weights
- Remove decorative borders, shadows, backgrounds
- Flatten structure — never nest cards inside cards
- Remove unnecessary cards (spacing creates grouping naturally)
- One consistent spacing scale

### Layout
- Linear flow over complex grids
- Remove sidebars (move inline or hide)
- Full-width over multi-column where possible
- Generous white space

### Interaction
- Fewer buttons, fewer options, clearer path
- Smart defaults (automate common choices)
- Inline editing over modal flows
- Remove steps from flows
- ONE obvious CTA

### Content
- Cut copy in half, then half again
- Active voice ("Save changes" not "Changes will be saved")
- Remove jargon, hedging, redundant copy
- Scannable structure

### Code
- Remove dead CSS, unused components, orphaned files
- Flatten component trees
- Consolidate styles
- Reduce component variants

## NEVER

- Remove necessary functionality (simplicity ≠ feature-less)
- Sacrifice accessibility for simplicity
- Make things so simple they're unclear (mystery ≠ minimalism)
- Remove information users need for decisions
- Eliminate hierarchy entirely
- Oversimplify complex domains
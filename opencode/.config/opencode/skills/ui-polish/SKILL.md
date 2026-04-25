---
name: ui-polish
description: Final quality pass before shipping. Fix alignment, spacing, consistency
---

# UI Polish

`/ui-polish [target]` - Final quality pass before shipping. Fixes alignment, spacing, consistency, micro-details. Does NOT redesign.

## Prerequisites

- Feature must be functionally complete. Don't polish incomplete work.
- Understand quality bar: MVP vs flagship.

## Flow

1. **Design System Discovery** — find tokens, components, conventions. Identify drift from system.
2. **Pre-Polish Assessment** — review completeness, known issues, quality bar, timeline.
3. **Polish systematically** through each dimension below.
4. **Final verification** — use it yourself, test on real devices, check all states.

## Polish Dimensions

### Visual Alignment & Spacing
- Pixel-perfect grid alignment
- Consistent spacing (no random 13px gaps)
- Optical alignment (icons, visual weight adjustments)
- Responsive spacing consistency

### Typography Refinement
- Hierarchy consistency (same elements = same sizes/weights)
- Line length 45-75ch for body
- Line height appropriate for context
- No widows/orphans
- Font loading: no FOUT/FOIT

### Color & Contrast
- WCAG contrast ratios met
- All colors use design tokens (no hard-coded)
- Theme consistency (all variants)
- Tinted neutrals (no pure gray/black)
- No gray text on colored backgrounds

### Interaction States
Every interactive element needs: default, hover, focus, active, disabled, loading, error, success.

### Micro-interactions & Transitions
- 150-300ms for state changes
- ease-out-quart/quint/expo only (never bounce/elastic)
- 60fps (transform + opacity only)
- Respects `prefers-reduced-motion`

### Content & Copy
- Consistent terminology, capitalization, punctuation
- No typos
- Appropriate length

### Icons & Images
- Consistent style family
- Proper sizing and optical alignment
- Alt text on all images
- No layout shift from loading

### Edge Cases
- Loading states for all async actions
- Helpful empty states (not blank)
- Clear error states with recovery paths
- Long content handling (truncation, wrapping)

### Responsiveness
- All breakpoints tested
- Touch targets >= 44x44px
- No text below 14px on mobile
- No horizontal scroll

### Code Quality
- Remove console.logs, commented code, unused imports
- No TypeScript `any`
- Proper ARIA, semantic HTML

## Polish Checklist

- [ ] Alignment perfect at all breakpoints
- [ ] Spacing uses design tokens
- [ ] Typography hierarchy consistent
- [ ] All interaction states implemented
- [ ] Transitions smooth (60fps)
- [ ] Copy consistent
- [ ] Forms labeled and validated
- [ ] Error/loading/empty states handled
- [ ] Touch targets >= 44px
- [ ] Contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] No layout shift on load
- [ ] Respects reduced motion
- [ ] Code clean (no TODOs, console.logs)

## NEVER

- Polish before functional completeness
- Introduce bugs while polishing
- Create one-off components when design system equivalents exist
- Hard-code values that should be tokens
---
name: ui-layout
description: Improve layout, spacing, and visual rhythm
---

# UI Layout

`/ui-layout [target]` - Improve layout, spacing, visual rhythm. Fix monotonous grids, inconsistent spacing, weak hierarchy.

## Flow

1. **Assess layout**: spacing consistency, visual hierarchy (squint test), grid structure, rhythm/variety, density
2. **Plan improvements**: spacing system, hierarchy strategy, layout approach, rhythm
3. **Improve systematically**

## Spacing System

- 4pt scale with semantic token names (`--space-sm`, `--space-md`), not pixel-named
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
- `gap` instead of margins for siblings (eliminates margin collapse)
- `clamp()` for fluid spacing on larger screens

## Visual Rhythm

- Tight grouping for related elements (8-12px between siblings)
- Generous separation between sections (48-96px)
- Varied spacing within sections (not every row same gap)
- Asymmetric compositions break the centered-content pattern

## Layout Tools

- **Flexbox for 1D**: nav bars, button groups, card internals, most component internals
- **Grid for 2D**: page structure, dashboards, rows + columns need coordinated control
- Don't default to Grid when Flexbox + flex-wrap is simpler
- `repeat(auto-fit, minmax(280px, 1fr))` for responsive grids without breakpoints
- Named grid areas for complex page layouts — redefine at breakpoints

## Break Card Monotony

- Don't default to card grids for everything (spacing creates grouping)
- Cards only when content is truly distinct and actionable
- Never nest cards inside cards
- Vary sizes, span columns, mix with non-card content

## Visual Hierarchy

- Fewest dimensions needed: space alone can be enough
- Some of the most sophisticated designs use just space and weight
- Color or size contrast only when simpler means aren't sufficient
- Reading flow: top-left → bottom-right in LTR, but primary action depends on context

## Depth & Elevation

- Semantic z-index scale (dropdown → sticky → modal-backdrop → modal → toast → tooltip)
- Consistent shadow scale (sm → md → lg → xl), subtle
- Elevation reinforces hierarchy, not decoration

## NEVER

- Arbitrary spacing outside scale
- Equal spacing everywhere (variety creates hierarchy)
- Wrap everything in cards
- Nest cards inside cards
- Identical card grids everywhere
- Center everything (left-aligned + asymmetry feels more designed)
- Default to hero metric layout (big number + gradient)
- CSS Grid when Flexbox would be simpler
- Arbitrary z-index values (999, 9999) — build semantic scale
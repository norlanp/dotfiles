# UI Audit

`/ui-audit [area]` - Run technical UI quality checks (accessibility, performance, theming, responsive, anti-patterns). Generates scored report, does NOT fix.

## Scoring (0-4 each, total /20)

| Dimension | Checks |
|-----------|--------|
| **Accessibility** | Contrast ratios (< 4.5:1), missing ARIA, keyboard nav, semantic HTML, alt text, form labels |
| **Performance** | Layout thrashing, expensive animations, missing lazy loading, bundle size, re-renders |
| **Theming** | Hard-coded colors, broken dark mode, inconsistent tokens, theme-switch failures |
| **Responsive** | Fixed widths, touch targets (< 44px), horizontal scroll, text scaling, missing breakpoints |
| **Anti-Patterns** | AI slop tells (Inter font, purple gradients, glassmorphism, card grids, gray on color, bounce easing) |

**Rating bands**: 18-20 Excellent, 14-17 Good, 10-13 Acceptable, 6-9 Poor, 0-5 Critical

## Severity

- **P0 Blocking**: Prevents task completion
- **P1 Major**: Significant difficulty or WCAG AA violation
- **P2 Minor**: Annoyance, workaround exists
- **P3 Polish**: Nice-to-fix

## Flow

1. Read source files (HTML, CSS, JS/TS) for target area
2. If browser available, visually inspect live page
3. Score each dimension, document findings with: location, category, impact, WCAG standard (if applicable), recommendation, suggested next command
4. Identify systemic patterns (e.g. "hard-coded colors in 15+ components")
5. Note positive findings (what works well)
6. Present report with recommended actions from: `/ui-critique`, `/ui-polish`, `/ui-typeset`, `/ui-layout`, `/ui-harden`, `/ui-colorize`

## Anti-Patterns Checklist

- Overused fonts (Inter, Roboto, Arial, system defaults)
- Gray text on colored backgrounds
- Pure black/gray (no tint)
- Nested cards
- Bounce/elastic easing
- Gradient text (`background-clip: text`)
- Side-stripe borders (`border-left: 3px solid`)
- Purple-blue gradients
- Glassmorphism overuse
- Hero metric layout (big number + gradient)

## Report Format

```
# UI Audit: {area}

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | ?/4 | |
| 2 | Performance | ?/4 | |
| 3 | Theming | ?/4 | |
| 4 | Responsive | ?/4 | |
| 5 | Anti-Patterns | ?/4 | |
| **Total** | | **?/20** | **[band]** |

## Anti-Patterns Verdict
[Pass/fail with specific tells]

## Findings (by severity)
- [P?] Issue — location — impact — fix — suggested command

## Patterns & Systemic Issues
[Recurring problems across codebase]

## Positive Findings
[What works well]

## Recommended Actions
1. [P?] `/command` — description
```
# UI Critique

`/ui-critique [area]` - UX design review: hierarchy, clarity, emotional resonance, cognitive load. Produces scored report with persona testing, does NOT fix.

## Flow

1. **Read source** — HTML, CSS, JS/TS for target area
2. **LLM Design Review** — evaluate visually and structurally (if browser available, inspect live page)
3. **Automated Detection** — run `npx impeccable --json [target]` for deterministic anti-pattern scan
4. **Synthesize** into combined report

## LLM Design Review Dimensions

- **AI Slop Detection**: Would someone believe "AI made this"? Check all anti-patterns
- **Visual Hierarchy**: Eye flow, primary action clarity
- **Information Architecture**: Structure, grouping, cognitive load
- **Emotional Resonance**: Does it match brand/audience?
- **Discoverability**: Are interactive elements obvious?
- **Composition**: Balance, whitespace, rhythm
- **Typography**: Hierarchy, readability, font choices
- **Color**: Purposeful use, cohesion, accessibility
- **States & Edge Cases**: Empty, loading, error, success
- **Microcopy**: Clarity, tone, helpfulness

## Nielsen's Heuristics (score 0-4 each, /40)

| # | Heuristic | Score | Issue |
|---|-----------|-------|-------|
| 1 | Visibility of System Status | | |
| 2 | Match System / Real World | | |
| 3 | User Control and Freedom | | |
| 4 | Consistency and Standards | | |
| 5 | Error Prevention | | |
| 6 | Recognition Rather Than Recall | | |
| 7 | Flexibility and Efficiency | | |
| 8 | Aesthetic and Minimalist Design | | |
| 9 | Error Recovery | | |
| 10 | Help and Documentation | | |

## Cognitive Load Checklist

- [ ] Clear primary action visible
- [ ] < 5 options at each decision point
- [ ] Progressive disclosure (complexity revealed when needed)
- [ ] Consistent patterns (no surprise interactions)
- [ ] Error recovery path visible
- [ ] No cognitive overload (information not overwhelming)
- [ ] Clear visual grouping (related items together)
- [ ] Minimal text per decision point

## Persona Red Flags

Auto-select 2-3 personas for the interface type. For each, walk through primary action and list specific red flags:

- **Alex (Power User)**: keyboard shortcuts, efficiency, density
- **Jordan (First-Timer)**: clarity, guidance, discoverability
- **Sam (Screen Reader)**: semantic HTML, ARIA, focus management
- **Morgan (Mobile)**: touch targets, responsive, connectivity

When `## Design Context` exists in `.impeccable.md`, generate 1-2 project-specific personas from audience/brand info.

## Report Format

```
# UI Critique: {area}

## Design Health Score: ?/40 [band]

## Anti-Patterns Verdict
LLM assessment + automated scan results

## Overall Impression
[gut reaction]

## What's Working
- [2-3 specific things done well]

## Priority Issues
- [P?] What — Why it matters — Fix — Suggested command

## Persona Red Flags
- **Alex**: [specific breaks]
- **Jordan**: [specific breaks]

## Minor Observations
[Quick notes]

## Questions to Consider
[Provocative questions for better solutions]
```

After report, ask user: priority direction, design intent, scope. Then present recommended action plan from: `/ui-polish`, `/ui-distill`, `/ui-clarify`, `/ui-bolder`, `/ui-quieter`, `/ui-typeset`, `/ui-layout`, `/ui-harden`
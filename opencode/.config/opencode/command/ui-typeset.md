# UI Typeset

`/ui-typeset [target]` - Fix typography: font choices, hierarchy, sizing, weight, readability. Make text intentional, not default.

## Flow

1. **Assess current typography**: font choices (defaults? brand match?), hierarchy clarity, sizing consistency, readability, consistency
2. **Plan improvements**: font selection, type scale, weight strategy, spacing
3. **Improve systematically**

## Font Selection

Banned (AI monoculture): Inter, Roboto, Arial, Open Sans, system defaults, Fraunces, DM Sans, Syne, Plus Jakarta Sans, Outfit, Space Grotesk, IBM Plex, Instrument Sans.

Procedure:
1. Write 3 concrete brand-voice words (not "modern" or "elegant")
2. List 3 fonts you'd normally reach for — reject them
3. Browse Google Fonts, Pangram Pangram, Future Fonts, Adobe Fonts, ABC Dinamo, Klim, Velvetyne
4. Look for something that fits as a physical object (museum caption, shop sign, terminal manual, fabric label)
5. Cross-check: right font for "elegant" ≠ necessarily serif. "technical" ≠ necessarily sans-serif

## Type Hierarchy

- **5 sizes cover most needs**: caption, secondary, body, subheading, heading
- **Consistent ratio** between levels (1.25, 1.333, or 1.5)
- **Combine dimensions**: size + weight + color + space — don't rely on size alone
- **App UIs**: fixed `rem`-based scale, optionally at 1-2 breakpoints
- **Marketing/content**: fluid `clamp(min, preferred, max)` for headings, fixed body text

## Readability

- `max-width: 65ch` for text containers
- Line-height: 1.1-1.2 for headings, 1.5-1.7 for body, +0.05-0.1 for light-on-dark
- Body text minimum 16px / 1rem
- `tabular-nums` for data tables
- `font-kerning: normal`

## Consistency

- 2-3 font families max
- 3-4 weights max (Regular, Medium, Semibold, Bold)
- Load only weights used
- Semantic token names (`--text-body`, `--text-heading`)
- Same-role elements styled identically

## NEVER

- Use > 2-3 font families
- Pick sizes arbitrarily (commit to a scale)
- Body text below 16px
- Decorative fonts for body text
- Disable browser zoom
- Use px for font sizes (use rem)
- Default to Inter/Roboto when personality matters
- Pair similar fonts (two geometric sans-serifs)
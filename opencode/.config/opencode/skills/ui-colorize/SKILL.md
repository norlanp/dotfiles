---
name: ui-colorize
description: Add strategic color to monochromatic or dull designs
---

# UI Colorize

`/ui-colorize [target]` - Add strategic color to monochromatic/dull designs. More engaging and expressive without rainbow chaos.

## Flow

1. **Assess current state**: color absence, missed opportunities, brand colors, context
2. **Identify where color adds value**: semantic meaning, hierarchy, categorization, emotion, wayfinding, delight
3. **Plan strategy**: 2-4 colors max beyond neutrals, dominant 60%, accent 30%, highlight 10%
4. **Introduce strategically**

## Color Application

### Semantic Color
- Success: green tones (emerald, forest, mint)
- Error: red/pink (rose, crimson, coral)
- Warning: orange/amber
- Info: blue tones (sky, indigo)
- Neutral: gray/slate for inactive

### Where to Apply
- Primary actions/CTAs
- Links (maintain accessibility)
- Key icons for recognition
- Section headers
- Hover states
- Status badges & progress indicators
- Tinted backgrounds (replace pure `#f5f5f5` with `oklch(97% 0.01 60)`)
- Accent borders (top/left on sections)
- Focus rings matching brand

### OKLCH for Color
Perceptually uniform — equal steps in lightness look equal. Great for harmonious scales.

### Rules
- **60-30-10**: dominant color 60%, secondary 30%, accent 10%
- **Contrast**: WCAG AA (4.5:1 text, 3:1 UI components)
- **Don't rely on color alone**: add icons, labels, patterns alongside color
- **Test color blindness**: verify red/green combinations
- **Temperature consistency**: warm stays warm, cool stays cool

## NEVER

- Use every color (2-4 beyond neutrals max)
- Apply color without semantic meaning
- Put gray text on colored backgrounds (use shade of background color instead)
- Use pure gray for neutrals (add subtle tint)
- Use pure black (#000) or pure white (#fff) for large areas
- Default to purple-blue gradients (AI slop)
- Make everything colorful
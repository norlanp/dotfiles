---
name: ui-animate
description: Add purposeful motion: micro-interactions, transitions, choreography
---

# UI Animate

`/ui-animate [target]` - Add purposeful motion: micro-interactions, transitions, choreography. Enhances usability, not decoration.

## Flow

1. **Identify opportunities**: missing feedback, jarring transitions, unclear relationships, lack of delight
2. **Understand context**: personality, performance budget, audience (motion-sensitive?), hero moment
3. **Plan strategy**: one hero moment + feedback layer + transition layer + delight layer
4. **Implement** with accessibility and performance

## Animation Categories

### Entrance
- Page load: stagger reveals (100-150ms), fade + slide
- Hero section: dramatic entrance (scale, parallax)
- Scroll-triggered: IntersectionObserver
- Modal/drawer: slide + fade, backdrop fade, focus management

### Micro-interactions
- Button hover: subtle scale (1.02-1.05), color shift, shadow increase
- Button click: quick scale down-up (0.95 → 1), ripple
- Input focus: border transition, slight glow
- Validation: shake on error, checkmark on success
- Toggle: smooth slide + color transition (200-300ms)

### State Transitions
- Show/hide: fade + slide (200-300ms)
- Expand/collapse: height transition, icon rotation
- Loading: skeleton fades, spinner, progress bar
- Success/error: color transitions, icon animations

### Navigation
- Page transitions: crossfade, shared elements
- Tab switching: slide indicator, content transition
- Scroll effects: parallax, sticky header state changes

## Timing & Easing

| Purpose | Duration | Easing |
|---------|----------|--------|
| Instant feedback | 100-150ms | ease-out-quart |
| State changes | 200-300ms | ease-out-quart |
| Layout changes | 300-500ms | ease-out-quint |
| Entrance | 500-800ms | ease-out-expo |

**Exit animations**: ~75% of enter duration.

```css
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
```

## Technical Rules

- **GPU only**: animate `transform` and `opacity` (never width, height, top, left)
- **will-change**: sparingly for known expensive ops
- **60fps**: no jank on target devices
- **Reduced motion**: always respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## NEVER

- Use bounce or elastic easing (dated, tacky)
- Animate layout properties
- Durations > 500ms for feedback (feels laggy)
- Animate without purpose
- Ignore `prefers-reduced-motion`
- Animate everything (fatigue)
- Block interaction during animations
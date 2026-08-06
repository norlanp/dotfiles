---
name: ui-overdrive
description: Push past conventional limits with technically extraordinary effects
---

# UI Overdrive

`/ui-overdrive [target]` - Push past conventional limits. Shaders, spring physics, scroll-driven reveals, View Transitions, 60fps. Technically extraordinary effects.

**IMPORTANT**: Overdrive has highest misfire potential. You MUST propose 2-3 directions with trade-offs and get user pick BEFORE writing code.

## Flow

1. **Assess what "extraordinary" means here** — context determines technique
2. **Propose 2-3 directions** with description, technique, trade-offs (browser support, perf, complexity)
3. **Get user confirmation** before building
4. **Iterate with browser automation** — ambitious effects rarely work first try. Preview, verify visually, refine. Multiple rounds expected.

## "Extraordinary" by Context

- **Visual/marketing surfaces**: scroll-driven reveals, shader backgrounds, cinematic transitions, generative art
- **Functional UI**: View Transitions (dialog morphs from trigger), virtual scroll for 100k rows, streaming form validation, spring physics drag-and-drop
- **Performance-critical**: search filtering 50k items without flicker, form that never blocks main thread, near-real-time image processing
- **Data-heavy**: GPU-accelerated Canvas/WebGL charts, animated data transitions, force-directed graphs

## Toolkit

### Cinematic Transitions
- **View Transitions API** — shared element morphing between states (all browsers same-doc)
- **`@starting-style`** — animate from `display: none` to visible, CSS only
- **Spring physics** — natural motion (motion library, GSAP, or custom solver)

### Scroll-driven
- **`animation-timeline: scroll()`** — CSS-only parallax, progress bars, reveals (Chrome/Edge/Safari; Firefox: flag — always provide static fallback)

### Render Beyond CSS
- **WebGL** — shaders, particles, post-processing (Three.js, OGL, regl)
- **WebGPU** — next-gen GPU compute (Chrome/Edge only; always fallback to WebGL2)
- **Canvas 2D / OffscreenCanvas** — custom rendering, off-main-thread via Workers
- **SVG filter chains** — displacement, turbulence, organic distortion

### Data at Scale
- **Virtual scrolling** — render only visible rows (TanStack Virtual for complex cases)
- **GPU charts** — Canvas/WebGL for large datasets (deck.gl)
- **Animated data transitions** — D3 `transition()` or View Transitions for DOM charts

### Animate Complex Properties
- **`@property`** — register typed CSS properties for gradient/color animation
- **Web Animations API** — JS-driven with CSS performance

### Push Performance
- **Web Workers** — computation off main thread
- **OffscreenCanvas** — render in Worker thread
- **WASM** — near-native for image processing, physics, codecs

## Rules

- **Progressive enhancement non-negotiable**: every technique must degrade gracefully, experience without enhancement still good
- **60fps target**: if dropping below 50, simplify
- **Respect `prefers-reduced-motion`**: always. Beautiful static alternative required.
- **Lazy-initialize** heavy resources (WebGL, WASM) only when near viewport
- **Pause off-screen rendering**
- **Test on real mid-range devices**

## NEVER

- Ignore `prefers-reduced-motion`
- Ship effects that cause jank on mid-range devices
- Use bleeding-edge APIs without functional fallback
- Add sound without user opt-in
- Use ambition to mask weak design fundamentals (fix those first)
- Layer multiple competing extraordinary moments (focus creates impact, excess creates noise)
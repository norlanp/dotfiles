---
name: ui-optimize
description: Diagnose and fix UI performance: loading, rendering, animations
---

# UI Optimize

`/ui-optimize [target]` - Diagnose and fix UI performance: loading speed, rendering, animations, images, bundle size.

## Flow

1. **Measure current state**: Core Web Vitals (LCP, FID/INP, CLS), load time, bundle size, runtime perf
2. **Identify bottlenecks**: slowest part → root cause → severity → affected users
3. **Optimize systematically** by biggest impact first
4. **Verify**: measure before/after, test on real devices and slow connections

## Optimization Areas

### Loading Performance
- Images: WebP/AVIF, proper sizing, lazy loading, responsive srcset, CDN
- JS Bundle: code splitting, tree shaking, remove unused deps, dynamic imports
- CSS: remove unused, critical CSS inline, minimize
- Fonts: `font-display: swap`, subset, preload, limit weights
- Strategy: async/defer, preload, prefetch, service worker

### Rendering Performance
- Avoid layout thrashing (batch reads then writes)
- CSS `contain` for independent regions
- `content-visibility: auto` for long lists
- Virtual scrolling for large lists
- Minimize DOM depth and size

### Animation Performance
- GPU-accelerated only: `transform` and `opacity`
- Never animate layout properties (width, height, top, left)
- `will-change` sparingly for known expensive ops
- `requestAnimationFrame` for JS animations
- Target 16ms per frame (60fps)

### Core Web Vitals
- **LCP < 2.5s**: optimize hero images, inline critical CSS, preload key resources, CDN, SSR
- **INP < 200ms**: break up long tasks, defer non-critical JS, web workers for heavy computation
- **CLS < 0.1**: set image dimensions, `aspect-ratio`, reserve space for dynamic content

### Network
- Reduce request count (combine, SVG sprites, inline critical)
- Optimize APIs (pagination, GraphQL, compression, caching)
- Adaptive loading for slow connections
- Optimistic UI updates

## NEVER

- Optimize without measuring
- Sacrifice accessibility for performance
- Break functionality while optimizing
- Use `will-change` everywhere
- Lazy load above-fold content
- Forget mobile (slower devices, slower connections)
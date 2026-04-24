# UI Adapt

`/ui-adapt [target] [context]` - Adapt designs for different devices, screen sizes, platforms. Rethink the experience, don't just shrink it.

## Flow

1. **Identify source context**: what was it designed for, what assumptions, what works
2. **Understand target context**: device, input method, screen, connection, usage, expectations
3. **Identify challenges**: what won't fit, won't work, is inappropriate
4. **Adapt systematically**

## Mobile (Desktop → Mobile)

- Single column, vertical stacking, full-width
- Touch targets >= 44x44px, thumbs-first design
- Bottom navigation, hamburger menu
- Progressive disclosure, prioritize primary content
- Shorter text, larger text (16px minimum)
- Swipe gestures, bottom sheets instead of dropdowns

## Tablet (Hybrid)

- Two-column layouts, master-detail views
- Both touch and pointer support
- Adaptive by orientation (portrait vs landscape)
- Side drawers for navigation
- Dense enough to use space, touch-friendly enough for fingers

## Desktop (Mobile → Desktop)

- Multi-column, side navigation always visible
- Hover states, keyboard shortcuts, right-click menus
- Show more info upfront (less progressive disclosure)
- Drag and drop, multi-select
- Max-width constraints (don't stretch to 4K)

## Techniques

- Breakpoints: 320-767px mobile, 768-1023px tablet, 1024px+ desktop (or content-driven)
- CSS Grid/Flexbox for reflow
- Container queries for component-level responsiveness
- `clamp()` for fluid sizing
- `repeat(auto-fit, minmax(280px, 1fr))` for responsive grids without breakpoints
- Responsive images: `srcset`, `picture`

## NEVER

- Hide core functionality on mobile
- Assume desktop = powerful device
- Different information architecture across contexts
- Break platform user expectations
- Forget landscape orientation
- Use generic breakpoints blindly (content-driven is better)
- Ignore touch on desktop devices
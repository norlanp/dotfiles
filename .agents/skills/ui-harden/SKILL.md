---
name: ui-harden
description: Make interfaces production-ready: error handling, empty states, i18n, edge cases
---

# UI Harden

`/ui-harden [target]` - Make interfaces production-ready: error handling, empty states, onboarding, i18n, text overflow, edge cases.

## Flow

1. **Test with extreme inputs**: very long text, empty, special chars, emoji, RTL, large numbers, many items
2. **Test error scenarios**: network failures, API errors (4xx/5xx), validation, permissions, rate limits
3. **Test i18n**: long translations (German +30%), RTL, CJK, date/number formats
4. **Harden systematically**

## Hardening Dimensions

### Text Overflow & Wrapping
- Single-line: `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;`
- Multi-line: `-webkit-line-clamp`
- Flex/Grid overflow: `min-width: 0; overflow: hidden;`
- Responsive text: `clamp()`, minimum 14px mobile
- Test zoom to 200%

### Internationalization
- 30-40% space budget for translations
- Flexbox/grid that adapts to content
- Logical CSS properties: `margin-inline-start` not `margin-left`
- UTF-8 everywhere
- `Intl.DateTimeFormat` / `Intl.NumberFormat` for locale-aware formatting
- Proper pluralization via i18n library
- Test RTL: `[dir="rtl"]`

### Error Handling
- Network errors: clear message + retry button + offline mode
- Form validation: inline errors near fields, preserve input on error
- API errors: handle each status code appropriately (400 validation, 401 login redirect, 403 permission, 404 not found, 429 rate limit, 500 generic + support)
- Graceful degradation: core works without JS

### Edge Cases
- Empty: no items, no results, no notifications — with clear next action
- Loading: initial, pagination, refresh — with context ("Loading your projects...")
- Large datasets: pagination or virtual scrolling, search/filter
- Concurrent operations: prevent double-submit, optimistic updates with rollback
- Permission states: explain why, how to get access

### Onboarding & First-Run
- Empty states: what will appear + why it matters + CTA
- First-run: get to "aha moment" fast, show don't tell, progressive disclosure
- Feature discovery: contextual tooltips (brief, dismissable, one-time)
- Smart defaults so setup is minimal

### Accessibility Resilience
- Keyboard: all functionality accessible, logical tab order, focus management
- Screen reader: proper ARIA, live regions, semantic HTML
- Motion: `prefers-reduced-motion: reduce` respected
- High contrast: don't rely on color alone

### Performance Resilience
- Slow connections: skeleton screens, optimistic updates, offline support
- Memory: cleanup listeners, cancel subscriptions, clear timers
- Throttle/debounce expensive operations

## NEVER

- Assume perfect input (validate everything)
- Leave error messages generic
- Use fixed widths for text
- Assume English-length text
- Block entire interface when one component errors
- Force long onboarding before users can touch the product
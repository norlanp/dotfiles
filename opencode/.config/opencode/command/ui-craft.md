# UI Craft

`/ui-craft [feature description]` - Full shape-then-build flow with visual iteration. Discover → design brief → build → iterate.

## Flow

### Step 1: Shape

Run `/ui-shape` with the feature description. Wait for confirmed design brief before proceeding.

If user already has a confirmed brief, skip to Step 2.

### Step 2: Load References

Based on brief's recommended references, consult:
- Always: layout/spacing, typography
- As needed: interaction-design for forms, motion-design for animation, color-and-contrast for theming, responsive-design for multi-device, ux-writing for copy-heavy

### Step 3: Build

Work in this order:
1. **Structure**: semantic HTML, no styling yet
2. **Layout & spacing**: spatial rhythm, visual hierarchy
3. **Typography & color**: type scale, color system
4. **Interactive states**: hover, focus, active, disabled
5. **Edge cases**: empty, loading, error, overflow, first-run
6. **Motion**: transitions and animations (if appropriate)
7. **Responsive**: adapt for viewports (redesign, don't just shrink)

During build:
- Test with realistic data at every step
- Check each state as you build it
- If design question emerges, stop and ask rather than guess
- Every visual choice traces back to the brief

### Step 4: Visual Iteration

**This step is critical. Do not stop after first implementation.**

Open in browser. If browser automation available, use it. Otherwise ask user to open.

Iterate:
1. **Does it match the brief?** Compare result against every brief section
2. **AI slop test?** Would someone believe "AI made this" immediately? If yes, more design intention needed
3. **Anti-pattern check**: fix any violations
4. **Check every state**: empty, error, loading, edge cases
5. **Check responsive**: resize viewport
6. **Check details**: spacing consistency, type hierarchy, contrast, interaction feedback, motion timing

Repeat until you would be proud to show this. The bar is "this delights," not "it works."

### Step 5: Present

- Show feature in primary state
- Walk through key states
- Explain decisions connecting back to brief
- Ask: "What's working? What isn't?"

Iterate based on feedback.
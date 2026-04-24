# UI Extract

`/ui-extract [target]` - Pull reusable components and tokens into the design system. Identify patterns, consolidate, migrate.

## Flow

### Step 1: Discover Design System

Find the design system, component library, or shared UI directory. Understand structure: organization, naming, tokens, conventions.

If no design system exists, ask before creating one.

### Step 2: Identify Patterns

Look for extraction opportunities:
- **Repeated components**: similar UI patterns used 3+ times (buttons, cards, inputs)
- **Hard-coded values**: colors, spacing, typography, shadows that should be tokens
- **Inconsistent variations**: multiple implementations of same concept
- **Composition patterns**: layout/interaction patterns that repeat
- **Type styles**: repeated font-size + weight + line-height combos
- **Animation patterns**: repeated easing, duration, keyframe combos

Only extract things used 3+ times with same intent. Premature abstraction is worse than duplication.

### Step 3: Plan Extraction

- Components to extract with clear props API and sensible defaults
- Tokens to create with proper hierarchy (semantic names, not value names)
- Variants to support for each component
- Naming conventions matching existing patterns
- Migration path from old to shared versions

### Step 4: Extract & Enrich

- **Components**: clear props, variants, accessibility built in, docs
- **Tokens**: primitive vs semantic naming, proper hierarchy
- **Patterns**: when to use, code examples, variations

### Step 5: Migrate

- Find all instances of extracted patterns
- Replace systematically with shared versions
- Test visual and functional parity
- Delete dead code and old implementations

### Step 6: Document

- Add to component library
- Document token usage and values
- Add examples and guidelines
- Update any component catalog (Storybook, etc.)

## NEVER

- Extract one-off context-specific implementations
- Create components so generic they're useless
- Skip existing design system conventions
- Extract without TypeScript types or prop docs
- Create tokens for every single value (semantic meaning required)
- Extract things that differ in intent (similar look ≠ same purpose)
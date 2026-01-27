# Debug

`/debug [issue-description]`

Systematic root cause analysis. **NO fixes without investigation first.**

---

## Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

Quick patches mask underlying issues. Random fixes waste time and create new bugs.

---

## Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

### 1. Read Error Messages
- Don't skip past errors or warnings
- Read stack traces completely
- Note line numbers, file paths, error codes
- Often contains the exact solution

### 2. Reproduce Consistently
- Can you trigger it reliably?
- What are the exact steps?
- Does it happen every time?
- Not reproducible? → gather more data, don't guess

### 3. Check Recent Changes
- `git diff`, recent commits
- New dependencies, config changes
- Environmental differences
- What changed that could cause this?

### 4. Gather Evidence (Multi-Component Systems)

**WHEN system has multiple components:**

```
For EACH component boundary:
  - Log what data enters component
  - Log what data exits component
  - Verify environment/config propagation
  - Check state at each layer

Run once to gather evidence showing WHERE it breaks
THEN analyze evidence to identify failing component
THEN investigate that specific component
```

### 5. Trace Data Flow

**WHEN error is deep in call stack:**

- Where does bad value originate?
- What called this with bad value?
- Keep tracing UP until you find the source
- Fix at source, not at symptom

---

## Phase 2: Pattern Analysis

### 1. Find Working Examples
- Locate similar working code in same codebase
- What works that's similar to what's broken?

### 2. Compare Against References
- If implementing pattern, read reference COMPLETELY
- Don't skim - read every line
- Understand the pattern fully before applying

### 3. Identify Differences
- What's different between working and broken?
- List every difference, however small
- Don't assume "that can't matter"

---

## Phase 3: Hypothesis & Testing

### 1. Form Single Hypothesis
- State clearly: "I think X is the root cause because Y"
- Write it down
- Be specific, not vague

### 2. Test Minimally
- Make the SMALLEST possible change to test hypothesis
- One variable at a time
- Don't fix multiple things at once

### 3. Verify Before Continuing
- Did it work? Yes → Phase 4
- Didn't work? Form NEW hypothesis
- DON'T add more fixes on top

### 4. When You Don't Know
- Say "I don't understand X"
- Don't pretend to know
- Ask for help or research more

---

## Phase 4: Implementation

### 1. Create Failing Test Case
- Simplest possible reproduction
- Automated test if possible
- MUST have before fixing

### 2. Implement Single Fix
- Address the root cause identified
- ONE change at a time
- No "while I'm here" improvements

### 3. Verify Fix
- Test passes now?
- No other tests broken?
- Issue actually resolved?

### 4. If Fix Doesn't Work
- Count: How many fixes have you tried?
- If < 3: Return to Phase 1, re-analyze
- **If ≥ 3: STOP and question the architecture**

### 5. Architecture Check (3+ Failed Fixes)

**Pattern indicating architectural problem:**
- Each fix reveals new shared state/coupling
- Fixes require "massive refactoring"
- Each fix creates new symptoms elsewhere

**STOP and question fundamentals:**
- Is this pattern fundamentally sound?
- Should we refactor vs. continue fixing symptoms?
- Discuss with user before attempting more fixes

---

## Red Flags - STOP

If you catch yourself:
- "Quick fix for now, investigate later"
- "Just try changing X and see"
- "Add multiple changes, run tests"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- Proposing solutions before tracing data flow
- "One more fix attempt" (when already tried 2+)

**ALL of these mean: STOP. Return to Phase 1.**

---

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple" | Simple issues have root causes too |
| "Emergency, no time" | Systematic is FASTER than thrashing |
| "Just try this first" | First fix sets the pattern. Do it right. |
| "I'll write test after" | Untested fixes don't stick |
| "Multiple fixes saves time" | Can't isolate what worked |
| "I see the problem" | Seeing symptoms ≠ understanding root cause |

---

## Output

After systematic investigation, document:

```markdown
## Debug Report: {issue}

### Root Cause
{What actually caused the issue}

### Evidence
{How you verified this is the root cause}

### Fix Applied
{Single, targeted fix addressing root cause}

### Verification
- [ ] Failing test created
- [ ] Fix implemented
- [ ] Test passes
- [ ] No regressions

### Prevention
{How to prevent similar issues}
```

---

## Integration

- Use with `/qa-and-fix` when QA finds issues
- Fix agents in `/orchestrator` follow this methodology
- Spawned debug agents use this as their playbook

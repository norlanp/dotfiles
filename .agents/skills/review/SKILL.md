---
name: review
description: Review current changes and report concise findings; do not edit files
---

# Review

`/review [focus]` - Review current changes. Do not edit files.

## Workflow

1. Run `git diff` and `git diff --staged`. If both are empty, review recent commits.
2. Focus on the given focus, else correctness, security, edge cases, and error handling.
3. Read enough surrounding context to confirm each finding is real before reporting it.

## Output

Be concise. Report findings only, not a narrative.

- One line per finding: `file:line` + severity (CRITICAL/HIGH/MEDIUM/LOW) + the defect and its impact.
- Group by severity, highest first.
- No preamble, no summary of what changed, no praise, no restating the diff or the code.
- Drop findings you cannot tie to a specific line with real evidence.
- If nothing is wrong, say so in one line.
- Do not edit files.

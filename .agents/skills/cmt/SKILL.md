---
name: cmt
description: >
  Commit logical changes in the working tree as one or more focused commits.
  Use when the user runs /cmt, says "commit", "commit this", or asks to create a commit.
---

# Cmt

`/cmt` - Commit logical changes as focused commits. No pushing.

## Rules

- One logical concern per commit. Split unrelated changes into separate commits.
- Skip generated, ephemeral, or untracked-by-design files.
- Message: `type: description` - type is feat, fix, docs, refactor, test, chore, style, perf.
- Description: imperative mood, lowercase first word, no trailing period, max ~72 chars.
- No AI/agent mentions, no Co-authored-by trailers.
- No pushing. No amending published commits.
- Confirm if staging is ambiguous or changes look destructive.

## Steps

1. `git status --short` and `git diff` to review all changes.
2. Check for untracked files that should be gitignored (build artifacts, deps, secrets, caches, editor/OS files, `./tmp/`, `./var/`). If any match existing `.gitignore` patterns, they'll already be ignored - look for ones that aren't. If found, ask the user whether to add them to `.gitignore` before committing.
3. Group changes by concern. If one concern, single commit.
4. For each group: `git add` only those files, then `git commit`.
5. Report one line per commit: `hash message`.
6. If nothing to commit, say so and stop.
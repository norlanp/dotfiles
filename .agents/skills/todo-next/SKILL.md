---
name: todo-next
description: Use for todo-next, work on the next todo item, or pick up the next unblocked todo item from root todo.md or legacy todo.txt.
---

# Todo Next

Use root `todo.md`; if absent, use root `todo.txt`. Do not search elsewhere or merge files.

## Format

- `-` needed work
- `*` in progress (the item being worked this invocation only)
- `! blocked: reason` — blocked; not selectable until reset to `-`
- nesting allowed: a `*` parent may have indented `-` subitems
- completed items are deleted (not kept in the file)

`*` is transient: a worked item must end the invocation deleted (done) or `!` (blocked), never left as `*`.

## Migration

Legacy checkbox format on read: `- [ ]` to `-`, `- [~]` to `-`, `- [x]` deleted.

## Steps

0. Stuck cleanup (before selecting): for any `*` item left from a prior run, replace only the leading `*` marker with `! blocked: stale in-progress` — keep the rest of the line (title, context) unchanged. Then report how many were fixed. A `*` should only exist for the item you pick in step 1 this invocation.
1. Pick the first top-level `-` item with no incomplete explicit dependency and no `!` blocker. If it has `*` subitems, pick the first `-` subitem under it instead. Skip any `!` item.
2. Mark it `*`. Do the work. Then end the invocation with exactly one outcome:
   - done: delete the line and its subitems.
   - blocked: replace only the leading `*` marker with `! blocked: reason` (keep the rest of the line), report the blocker, halt.
3. One item per invocation. Halt and await instructions.
4. If nothing is selectable, report the `!` blockers and remaining dependencies, then halt.
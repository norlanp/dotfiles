---
name: todo-next
description: Use for todo-next, work on the next todo item, or pick up the next unblocked todo item from root todo.md or legacy todo.txt.
---

# Todo Next

Use root `todo.md`; if absent, use root `todo.txt`. Do not search elsewhere or merge files.

## Format

- `-` needed work
- `*` in progress
- nesting allowed: a `*` parent may have indented `-` subitems
- completed items are deleted (not kept in the file)

## Migration

Legacy checkbox format on read: `- [ ]` to `-`, `- [~]` to `*`, `- [x]` deleted.

## Steps

1. Select the first top-level `-` item with no incomplete explicit dependency. If it has `*` subitems, pick the first `-` subitem under it instead.
2. Mark it `*`, complete it, delete the line and its subitems. If blocked, leave it `*` and report the blocker.
3. One item per invocation. Halt and await instructions.
4. If nothing is unblocked, report that and the blocking dependencies.
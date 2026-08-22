---
name: todo-next
description: Use for todo-next, work on the next todo item, or pick up the next unblocked todo item from root todo.txt.
---

# Todo Next

Use root `todo.txt`. Do not search elsewhere or merge files.

## States

- `-` pending; `*` in progress; `! blocked: <reason>` blocked
- Under a blocked item, `- unblock: <step>` is actionable; `- BLOCKED: <step> - <reason>` is not
- Delete completed items. Convert `- [ ]` and `- [~]` to `-`; delete `- [x]`.

## Workflow

1. Change stale `*` to `! blocked: stale in-progress`.
2. For every blocked top-level item without subitems, add one concrete `- unblock: <step>`.
3. Scan all items in order. Choose the first actionable `-` without an incomplete dependency. Skip `!` and `BLOCKED:` items; actionable subitems remain eligible under blocked parents.
4. Complete one chosen item: delete it when done; otherwise mark it blocked. For a blocked subitem, replace it with `- BLOCKED: <step> - <reason>` and keep its parent blocked. Reset a parent to `-` only when its blocker is resolved.
5. If no item is actionable, report the blockers and required external input, then stop.

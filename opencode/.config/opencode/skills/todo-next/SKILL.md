---
name: todo-next
description: Use for todo-next, work on the next todo item, or pick up the next unblocked todo item from root todo.md or legacy todo.txt.
---

# Todo Next

Use root `todo.md`; if absent, use root `todo.txt`. Do not search elsewhere or merge files.

1. Read the file and follow its existing status and dependency format.
2. Select the first incomplete item with no incomplete explicit dependency.
3. Mark it in progress, complete its work, then mark it complete. If blocked, leave it in progress and report the blocker.
4. If no item is unblocked, report that and the blocking dependencies.

---
name: todo-clean
description: Use for todo-clean or clearing completed todo items from root todo.md or legacy todo.txt without losing context needed by pending work.
---

# Todo Clean

Use root `todo.md`; if absent, use root `todo.txt`. Do not search elsewhere or merge files.

1. Read the file and follow its existing format.
2. Normalize items to `- [ ] Task` or `- [x] Task`. Preserve supporting details as indented `- Context: ...` subitems.
3. Keep completed items that a pending item references, depends on, or needs for context.
4. List unreferenced completed items, confirm deletion, then remove only the approved items.
5. Report formatting changes, removed items, and retained items.

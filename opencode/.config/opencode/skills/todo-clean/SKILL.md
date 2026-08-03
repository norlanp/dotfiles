---
name: todo-clean
description: Use for todo-clean or clearing completed todo items from root todo.md or legacy todo.txt without losing context needed by pending work.
---

# Todo Clean

Use root `todo.md`; if absent, use root `todo.txt`. Do not search elsewhere or merge files.

1. Read the file and follow its existing format.
2. Normalize items to `- [ ] Task` or `- [x] Task`. Preserve supporting details as indented `- Context: ...` subitems.
3. Remove every completed item and its supporting subitems.
4. Report formatting changes and removed items.

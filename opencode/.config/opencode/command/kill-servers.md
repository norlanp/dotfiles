# Kill Servers

`/kill-servers` - Kill dev servers started from CWD

## Flow

1. Read package.json scripts, pyproject.toml, Makefile for dev/start commands
2. Find processes matching those commands with CWD = current directory
3. Confirm, then SIGTERM → 3s → SIGKILL

## Output

```
Dev servers in {cwd}:
[12345] npm run dev :3000
[12346] vite :5173
Kill? [Y/n]
```

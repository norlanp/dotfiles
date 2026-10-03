```
xcode-select --install
```

```
git clone https://github.com/zsh-users/zsh-autosuggestions ~/.zsh/zsh-autosuggestions
```

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

```
git clone git@github.com:norlanp/dotfiles.git && cd dotfiles
```

```
# create Brewfile
# brew bundle dump --force

# install install contents of Brewfile
brew bundle
```

```
# unstow dotfiles
# stow --delete */

# stow all packages (agents/ is a shared source tree, not a stow package)
stow */

# or stow explicitly to exclude agents/:
# stow alacritty aliases git ideavim librewolf linearmouse nvim opencode pi ripgrep scripts starship tmux zsh
```

## Shared agents tree

`.agents/` is a tool-agnostic source of truth for `AGENTS.md`, `commands/`, and `skills/`.
It is a dotdir so `stow */` skips it automatically. Each tool's package symlinks into it:

- `opencode/.config/opencode/{AGENTS.md,command,skills,agents}` -> `.agents/`
- `pi/.pi/agent/{AGENTS.md,prompts,skills}` -> `.agents/`

Agent definitions in `.agents/agents/` use a superset frontmatter; opencode reads its `mode`, `temperature`, and `permission` fields and ignores the rest.

Edit shared content in `.agents/` and both tools pick it up.

```
# cleanup neovim install if necessary
rm -rf ~/.local/share/nvim
rm -rf ~/.local/state/nvim
rm -rf ~/.cache/nvim
```

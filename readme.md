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
# stow alacritty aliases claude git grok ideavim librewolf linearmouse nvim opencode ripgrep scripts starship tmux zsh
```

## Shared agents tree

`.agents/` is a tool-agnostic source of truth for `AGENTS.md`, `commands/`, and `skills/`.
It is a dotdir so `stow */` skips it automatically. Each tool's package symlinks into it:

- `opencode/.config/opencode/{AGENTS.md,command,skills}` -> `.agents/`
- `claude/.claude/{CLAUDE.md,commands,skills}` -> `.agents/`
- `grok/.grok/{AGENTS.md,commands,skills}` -> `.agents/`

Edit shared content in `.agents/` and all three tools pick it up.

```
# cleanup neovim install if necessary
rm -rf ~/.local/share/nvim
rm -rf ~/.local/state/nvim
rm -rf ~/.cache/nvim
```

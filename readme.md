```
xcode-select --install
```

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
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

stow */
```

```
# cleanup neovim install if necessary
rm -rf ~/.local/share/nvim
rm -rf ~/.local/state/nvim
rm -rf ~/.cache/nvim
```

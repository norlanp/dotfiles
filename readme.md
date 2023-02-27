```
xcode-select --install
```

```
git clone git@github.com:norlanp/dotfiles.git
```

install homebrew
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

```
# brew bundle dump --force
brew bundle
```

```
# stow --delete */
stow */
```

clean up nvim
```
rm -rf ~/.local/share/nvim
```

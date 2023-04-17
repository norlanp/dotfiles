autoload -Uz compinit && compinit
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'

export PIPENV_VENV_IN_PROJECT=1

setopt inc_append_history

if [ -f ~/.aliases ]; then
  source ~/.aliases
fi

if [ -f ~/.config/hash ]; then
  source ~/.config/hash
fi

if [ -f ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh ]; then
  source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh
fi

if [ -f ~/.custom ]; then
  source ~/.custom
fi

source "$HOME/.cargo/env"

eval "$(starship init zsh)"
eval "$(/usr/local/bin/rtx activate zsh)"

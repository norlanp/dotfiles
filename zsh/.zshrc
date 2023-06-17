autoload -Uz compinit && compinit
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'

export PIPENV_VENV_IN_PROJECT=1

setopt inc_append_history
setopt share_history

if [ -f ~/.config/hash ]; then
  source ~/.config/hash
fi

if [ -f ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh ]; then
  source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh
fi

if [ -f ~/.custom ]; then
  source ~/.custom
fi

export GOPATH=$HOME/go
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin

bindkey "^[[A" history-beginning-search-backward
bindkey "^[[B" history-beginning-search-forward

source "$HOME/.cargo/env"

eval "$(starship init zsh)"
eval "$(/usr/local/bin/rtx activate zsh)"

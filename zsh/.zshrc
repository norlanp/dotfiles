autoload -Uz compinit && compinit
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'

export PIPENV_VENV_IN_PROJECT=1
export POETRY_VIRTUALENVS_IN_PROJECT=1
export EDITOR=nvim

#set history size
export HISTSIZE=10000
#save history after logout
export SAVEHIST=10000

setopt inc_append_history
setopt share_history

if [ -f ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh ]; then
  source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh
fi

if [ -f ~/.custom ]; then
  source ~/.custom
fi

export PATH=$PATH:$HOME/go/bin

bindkey "^[[A" history-beginning-search-backward
bindkey "^[[B" history-beginning-search-forward

source "$HOME/.cargo/env"

eval "$(starship init zsh)"
eval "$(/opt/homebrew/bin/mise activate zsh)"

# bun completions
[ -s "~/.bun/_bun" ] && source "~/.bun/_bun"

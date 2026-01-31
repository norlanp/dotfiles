autoload -Uz compinit && compinit
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'

export PIPENV_VENV_IN_PROJECT=1
export POETRY_VIRTUALENVS_IN_PROJECT=1

# DO NOT EXPORT EDITOR!!!!!!!!! this will drive you nuts, when you export this
# when inside of tmux it will prevent you from navitaging with ctrl+left/right arrows
# for some reason
# export EDITOR=nvim

# opencode
export PATH=$HOME/norlan/.opencode/bin:$PATH
export PATH="$HOME/.local/bin:$PATH"

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


# opencode
export PATH=/Users/norlan/.opencode/bin:$PATH

autoload -Uz compinit && compinit
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'

eval "$(pyenv init -)"\

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

export PIPENV_VENV_IN_PROJECT=1

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

eval "$(starship init zsh)"

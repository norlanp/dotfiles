if [ -f ~/.aliases ]; then
  source ~/.aliases
fi

command -v opencode &>/dev/null || export PATH="$HOME/.opencode/bin:$PATH"

[[ -f "$HOME/.cargo/env" ]] && source "$HOME/.cargo/env"

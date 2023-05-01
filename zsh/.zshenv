if [ -f ~/.aliases ]; then
  source ~/.aliases
fi

if [ -d "$HOME/adb-fastboot/platform-tools" ] ; then
 export PATH="$HOME/adb-fastboot/platform-tools:$PATH"
fi
. "$HOME/.cargo/env"

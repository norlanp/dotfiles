#!/bin/zsh
# Background daemon: polls tmux panes for AI agent processes,
# renames windows with status indicators.
# ● = working, ○ = idle

AGENTS="pi|claude|aider|codex|opencode|grok|gemini"
# Patterns visible in pane output when agent is actively generating
WORKING_PATTERN="esc (to )?interrupt|Generating\.\.\.|Thinking\.\.\.|streaming|Working"
POLL_INTERVAL=5

# Prevent duplicate instances
LOCK="/tmp/tmux-agent-status.lock"
if [[ -e "$LOCK" ]] && kill -0 "$(cat "$LOCK")" 2>/dev/null; then
    exit 0
fi
echo $$ > "$LOCK"
trap 'rm -f "$LOCK"' EXIT

while true; do
    typeset -A window_statuses

    # Pass 1: collect agent statuses per window across all panes
    while IFS=$'\t' read -r session window_index pane_index pane_pid; do
        target="${session}:${window_index}"
        pane_target="${session}:${window_index}.${pane_index}"

        has_agent=false

        # Check if pane process itself is an agent (exec'd into agent)
        cmd=$(ps -p "$pane_pid" -o comm= 2>/dev/null)
        echo "$cmd" | grep -qiE "^($AGENTS)" && has_agent=true

        # Check direct children (agent launched from shell)
        if ! $has_agent; then
            while IFS= read -r child_pid; do
                [[ -z "$child_pid" ]] && continue
                cmd=$(ps -p "$child_pid" -o comm= 2>/dev/null)
                if echo "$cmd" | grep -qiE "^($AGENTS)"; then
                    has_agent=true
                    break
                fi
            done < <(ps -ax -o pid=,ppid= 2>/dev/null | awk -v p="$pane_pid" '$2==p{print $1}')
        fi

        if $has_agent; then
            # Determine active vs idle from what the pane is actually displaying.
            # Scan only the last 6 non-blank lines to avoid false matches in
            # conversation history.
            footer=$(tmux capture-pane -p -t "$pane_target" 2>/dev/null \
                | grep -v '^[[:space:]]*$' | tail -n 6)
            if echo "$footer" | grep -qiE "$WORKING_PATTERN"; then
                window_statuses["$target"]+="●"
            else
                window_statuses["$target"]+="○"
            fi
        fi
    done < <(tmux list-panes -a -F "#{session_name}	#{window_index}	#{pane_index}	#{pane_pid}" 2>/dev/null)

    # Pass 2: rename windows based on collected statuses
    while IFS=$'\t' read -r session window_index pane_path; do
        target="${session}:${window_index}"
        base_name=$(basename "$pane_path")
        base_name="${base_name//./_}"

        if [[ -n "${window_statuses["$target"]}" ]]; then
            [[ "${window_statuses["$target"]}" == *"●"* ]] && icon="●" || icon="○"
            tmux set-window-option -t "$target" automatic-rename off 2>/dev/null
            tmux rename-window -t "$target" "${base_name} [${icon}]" 2>/dev/null
        else
            tmux set-window-option -t "$target" automatic-rename on 2>/dev/null
        fi
    done < <(tmux list-windows -a -F "#{session_name}	#{window_index}	#{pane_current_path}" 2>/dev/null)

    unset window_statuses
    sleep "$POLL_INTERVAL"
done

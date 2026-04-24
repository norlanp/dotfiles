# UI Clarify

`/ui-clarify [target]` - Improve unclear UX copy, error messages, labels, and microcopy. Make interfaces easier to understand.

## Flow

1. **Assess copy problems**:
   - Jargon users won't understand
   - Ambiguous wording (multiple interpretations)
   - Passive voice
   - Too wordy or too terse
   - Missing context (users don't know what to do or why)
   - Tone mismatch

2. **Understand context**: audience level, user mental state (stressed? confident?), desired action, constraints.

3. **Improve copy systematically**

## Copy Categories

### Error Messages
- Explain what went wrong in plain language
- Suggest how to fix it
- Don't blame the user
- Include examples when helpful

Bad: `"Error 403: Forbidden"`
Good: `"You don't have permission to view this page. Contact your admin for access."`

### Form Labels
- Clear, specific labels (not generic placeholders)
- Show format expectations
- Explain why you're asking (when not obvious)
- Instructions before the field, not after

### Button & CTA Text
- Describe the action specifically
- Active voice (verb + noun)
- Match user mental model

Bad: `"Submit"` | `"OK"` | `"Click here"`
Good: `"Create account"` | `"Save changes"` | `"Got it, thanks"`

### Empty States
- Explain why empty
- Show next action clearly
- Make it welcoming

Bad: `"No items"`
Good: `"No projects yet. Create your first project to get started."`

### Loading States
- Set expectations (how long?)
- Explain what's happening
- Show progress when possible

### Confirmation Dialogs
- State the specific action
- Explain consequences for destructive actions
- Clear button labels ("Delete project" not "Yes")

## Clarity Rules

1. **Be specific**: "Enter email" not "Enter value"
2. **Be concise**: Cut unnecessary words (sacrifice nothing for clarity)
3. **Be active**: "Save changes" not "Changes will be saved"
4. **Be human**: "Oops, something went wrong" not "System error encountered"
5. **Be helpful**: Tell users what to do, not just what happened
6. **Be consistent**: Same terms throughout (no variation for variety)

## NEVER

- Use jargon without explanation
- Blame users ("You made an error" → "This field is required")
- Be vague ("Something went wrong" without explanation)
- Use passive voice unnecessarily
- Use humor for errors (be empathetic instead)
- Vary terminology
- Repeat information
- Use placeholders as only labels (they disappear when typing)
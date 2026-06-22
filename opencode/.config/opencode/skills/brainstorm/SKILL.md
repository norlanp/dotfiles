---
name: brainstorm
description: Interview the user relentlessly about a plan or design. Use when the user wants to stress-test a plan before building, or uses any 'grill' trigger phrases.
disable-model-invocation: true
---

# Brainstorm

`/brainstorm <feature-name>` — Relentless interview to sharpen a plan or design. Walk each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask **one question at a time**, waiting for feedback before continuing. Multiple questions at once is bewildering. If a question can be answered by exploring the codebase, explore instead of asking.

## Flow

1. **Context** — arg or ask for name. New design or stress-test? Read README, architecture, recent commits, related code. (Read-only git allowed.)
2. **Grill** — ONE question per message. Prefer multiple-choice with recommended answer. Socratic method — expose contradictions, surface hidden assumptions, guide toward clarity rather than giving answers. Walk each branch of the decision tree, resolving dependencies one-by-one. Challenge assumptions. Don't stop until shared understanding. Focus: purpose, users, constraints, success, edge cases. Stress-tests add: weakest assumptions, missing error paths, unhandled states, scaling limits.
3. **Alternatives** — Propose 2-3 approaches with trade-offs. Lead with recommendation. Ask which direction.
4. **Validate** — Present design in 200-300 word sections. "Does this look right so far?" after each. YAGNI.
5. **Outcome** — "Ready to implement?" If yes, break work into small tasks and append to `todo.txt`.
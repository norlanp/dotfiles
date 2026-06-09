---
name: brainstorm
description: Relentless questioning until shared understanding. Use for greenfield design exploration OR stress-testing an existing plan. Resolves each branch of the decision tree one-by-one.
---

`/brainstorm <feature-name>`

1. **Context** — arg or ask for name. New design or stress-test? Read README, architecture, recent commits, related code. (Read-only git allowed.)
2. **Grill** — ONE question per message. Prefer multiple-choice with recommended answer. Use Socratic method — ask questions that expose contradictions, surface hidden assumptions, and guide toward clarity rather than giving answers. Explore codebase instead of asking when possible. Walk each branch of the decision tree, resolving dependencies one-by-one. Challenge assumptions. Don't stop until shared understanding. Focus: purpose, users, constraints, success, edge cases. Stress-tests add: weakest assumptions, missing error paths, unhandled states, scaling limits.
3. **Alternatives** — Propose 2-3 approaches with trade-offs. Lead with recommendation. Ask which direction.
4. **Validate** — Present design in 200-300 word sections. "Does this look right so far?" after each. YAGNI.
5. **Outcome** — "Ready to implement?" If yes, break work into small tasks and append to `todo.txt`.
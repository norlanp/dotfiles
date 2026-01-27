# Trade Copier Follower Calculation

Calculate trade copier ratios for NinjaTrader ATM strategy with scalp/runner split.

## Rules

- Leader account (sim) is copied to multiple follower accounts
- Trade copier applies **one ratio per follower** (2 decimal places)
- Rounding: `scalp = floor(leader_scalp × ratio)`, `runner = ceil(leader_runner × ratio)`

## Input

Ask user for follower accounts: `account. max_contracts, runner_contracts`

```
1. 3, 1
2. 5, 1
3. 8, 2
```

## Calculation

1. **Leader**: runner = max(all follower runners), scalp = max(all follower max_contracts) - runner
   - **Constraint**: scalp must be > runner. If not, increase leader total until scalp > runner.
2. **Ratio per follower**: `ratio = max_contracts / leader_total` (2 decimal places, round down)
3. **Follower result**: `scalp = floor(leader_scalp × ratio)`, `runner = ceil(leader_runner × ratio)`
   - **Constraint**: scalp must be ≥ runner. If not, reduce ratio until satisfied.

## Constraint

```
floor(leader_scalp × ratio) + ceil(leader_runner × ratio) ≤ max_contracts
```

If violated, reduce ratio until constraint satisfied.

## Output

| Account    | Scalp | Runner | Total | Ratio | Within Limit? |
|------------|-------|--------|-------|-------|---------------|
| Leader     | X     | Y      | Z     | -     | -             |
| Follower 1 | A     | B      | C     | 0.XX  | Yes/No        |

## Verify

1. No account exceeds max contracts
2. Runner contracts ≥ 1 (ceiling guarantees minimum 1)
3. Scalp ≥ runner for all accounts (scalp is always the larger portion)
4. Ratios achievable with 2 decimal places

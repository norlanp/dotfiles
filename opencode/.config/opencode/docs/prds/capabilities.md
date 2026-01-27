# Capabilities

Tracking available commands and their status.

## Commands

| Command | Status | Description |
|---------|--------|-------------|
| `/brainstorm` | active | Exploration and ideation phase |
| `/debug` | active | Debugging and issue investigation |
| `/docs` | active | Documentation health and maintenance |
| `/docs quick` | active | Fast spot check (<5 min) |
| `/docs full` | active | Comprehensive 5-phase audit (2-3h) |
| `/engineer` | active | Implementation agent for tasks |
| `/kill-servers` | active | Terminate background dev servers |
| `/orchestrator` | active | Meta-command, coordinates other agents |
| `/qa-and-fix` | active | Test-driven bug fixes |
| `/review-changes` | active | Code review and improvement |
| `/trade-copier-follower-calculation` | active | Trade copier follower math |

## Command Types

- **Meta**: `/orchestrator` - coordinates other agents
- **Core**: `/brainstorm`, `/engineer`, `/qa-and-fix`, `/review-changes`
- **Utility**: `/debug`, `/docs`, `/kill-servers`
- **Domain**: `/trade-copier-follower-calculation`

## Status Key

- **active**: Fully implemented and tested
- **planned**: Approved but not yet implemented
- **deprecated**: Scheduled for removal

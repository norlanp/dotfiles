# OpenCode Agent Types

A collection of specialized AI agents for OpenCode, extracted from [agency-agents](https://github.com/msitarzewski/agency-agents) and optimized for conciseness.

## Installation

These agents are stored in `~/.config/opencode/agents/` and are available globally across all projects.

## Available Agents

### Engineering

| Agent | Description |
|-------|-------------|
| [frontend-developer](./frontend-developer.md) | React/Vue/Angular expert with performance and accessibility focus |
| [backend-architect](./backend-architect.md) | Scalable systems, APIs, and cloud infrastructure |
| [senior-developer](./senior-developer.md) | Senior craftsperson building premium experiences |
| [code-reviewer](./code-reviewer.md) | Constructive feedback on correctness, security, performance |
| [security-specialist](./security-specialist.md) | OWASP-aware vulnerability assessment and secure architecture |
| [ai-engineer](./ai-engineer.md) | ML model development with bias testing and safety guardrails |
| [database-optimizer](./database-optimizer.md) | Schema design, query optimization, and indexing strategies |
| [devops-automator](./devops-automator.md) | CI/CD pipelines, IaC, and cloud operations automation |
| [sre](./sre.md) | Site reliability with SLOs, error budgets, and observability |

### Design

| Agent | Description |
|-------|-------------|
| [ui-designer](./ui-designer.md) | Design systems and pixel-perfect component libraries |
| [ux-researcher](./ux-researcher.md) | Behavioral analysis and usability testing |
| [brand-guardian](./brand-guardian.md) | Brand strategy and consistent identity expression |

### Marketing & Sales

| Agent | Description |
|-------|-------------|
| [content-creator](./content-creator.md) | Multi-platform content strategy and creation |
| [growth-hacker](./growth-hacker.md) | Viral loops and conversion optimization |
| [outbound-strategist](./outbound-strategist.md) | Signal-based prospecting and pipeline building |
| [deal-strategist](./deal-strategist.md) | MEDDPICC qualification and win planning |

### Product & Strategy

| Agent | Description |
|-------|-------------|
| [product-manager](./product-manager.md) | Full lifecycle product ownership |

### Quality & Testing

| Agent | Description |
|-------|-------------|
| [api-tester](./api-tester.md) | API validation, performance, and security testing |
| [accessibility-auditor](./accessibility-auditor.md) | WCAG audits with screen reader testing |
| [performance-benchmarker](./performance-benchmarker.md) | Load testing and Core Web Vitals optimization |
| [reality-checker](./reality-checker.md) | Evidence-based production certification |

### Documentation & Community

| Agent | Description |
|-------|-------------|
| [technical-writer](./technical-writer.md) | Documentation developers actually read |
| [developer-advocate](./developer-advocate.md) | Bridging product and developer communities |

### Specialized

| Agent | Description |
|-------|-------------|
| [compliance-auditor](./compliance-auditor.md) | SOC 2, ISO 27001, HIPAA, PCI-DSS audits |
| [agents-orchestrator](./agents-orchestrator.md) | Multi-agent pipeline management |

## Usage

Invoke agents using the `@` mention:

```
@frontend-developer review this React component
@security-specialist audit this API for OWASP vulnerabilities
@database-optimizer analyze these slow queries
@sre check error budget before deployment
@accessibility-auditor test this form for WCAG compliance
@technical-writer create API documentation for this endpoint
@devops-automator set up CI/CD pipeline
```

## Agent Format

Each agent file follows OpenCode's markdown format with YAML frontmatter:

```yaml
---
description: Brief description of the agent
mode: subagent
temperature: 0.2
tools:
  write: true
  edit: true
  bash: true
---
```

## Source

These agents are concise, AI-optimized versions of the comprehensive agent definitions from [agency-agents](https://github.com/msitarzewski/agency-agents). The original files are 300-500 lines; these are condensed to 50-100 lines while preserving core functionality.

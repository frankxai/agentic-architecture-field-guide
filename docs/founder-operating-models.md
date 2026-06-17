# Founder Operating Models

The mistake is thinking "agent army" means many autonomous writers with broad access. The useful version is a set of scoped lanes with strong handoffs.

## Solo Operator

| Lane | Agent | Scope |
| --- | --- | --- |
| Architect | Codex or Claude Code | Break goals into repo-safe missions |
| Builder | Codex | Edit, test, commit, push |
| Researcher | DeepAgents | Produce cited briefs and options |
| Local worker | Hermes Agent | Hold durable tasks and handoffs |
| Gateway | OpenClaw | Route approved chat requests |

Rule: only the builder lane writes code, and only after the architect lane has named the repo, files, tests, and rollback condition.

## Founder With Contractors

| Concern | Default |
| --- | --- |
| Repo access | Branch or worktree per contributor |
| Agent access | Per-project config, no shared global secrets |
| Memory | Shared decisions, not credentials |
| Review | Human review for deploys, payments, auth, and data movement |
| Handoff | ADR or issue before major architecture changes |

## Small Product Team

Use agents as a platform function:

- Platform owner defines MCP, hooks, secrets policy, and supported tools.
- Repo owners define `AGENTS.md`, build/test commands, and deploy boundaries.
- Product owner defines acceptance criteria and review policy.
- Agents execute within the lane they are assigned.

## Operating Cadence

Daily:

- Run local health audit.
- Review open handoff cards.
- Close or reassign stale agent sessions.

Weekly:

- Review memory/provenance quality.
- Update sources and install docs.
- Promote useful local patterns into templates.

Before deploy:

- Confirm repo clean state.
- Run tests/build.
- Check secrets and MCP scopes.
- Record the decision or rollback plan.

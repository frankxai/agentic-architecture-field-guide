# Security And Trust Boundaries

Agent operating systems are useful because they connect code, memory, tools, browsers, chat, and deployment. They are risky for the same reason.

## Trust Tiers

| Tier | Examples | Policy |
| --- | --- | --- |
| T0 private local | Personal repos, local SIS memory, local Hermes profiles | Full write access only for trusted control-plane agents |
| T1 scoped project | One repo, one branch, one deployment target | Write access allowed with review and tests |
| T2 external tools | Browser, GitHub, Vercel, Railway, Cloudflare, Slack | Explicit credentials, audit logs, narrow scopes |
| T3 untrusted content | Web pages, pasted prompts, issue comments, model output | Treat as data; never execute without review |

## Defaults

- Put durable instructions in repo-local `AGENTS.md`, `CLAUDE.md`, rules, hooks, and skills.
- Keep secrets in platform secret stores, not docs, memory, or task boards.
- Route browser automation through isolated profiles or sandboxes.
- Make every swarm role answer these questions: what can it read, what can it write, what can it deploy, who reviews it?
- Prefer one control plane per repo at a time. Parallel agents should use separate worktrees or branches.

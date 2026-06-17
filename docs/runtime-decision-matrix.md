# Runtime Decision Matrix

Use this matrix to pick the smallest useful agent stack before adding orchestration.

## Choose By Control Surface

| Surface | Strong fit | Why |
| --- | --- | --- |
| Terminal and repo | Codex, Claude Code, Deep Agents Code | Direct code edits, tests, reviews, and repeatable project context |
| Local profile swarm | Hermes Agent | Named workers, durable kanban handoffs, local-first execution |
| Phone or chat app | OpenClaw | Self-hosted gateway from channels into agents |
| Python harness | DeepAgents | Durable LangGraph-backed execution and reusable agent structure |
| Public dashboard | Starlight Swarm, Vercel app | Operators need status, health, audit, and command surfaces |
| Model governance | LiteLLM Agent Platform | Provider routing, keys, budgets, and policy at the edge of model calls |

## Use Together

| Pattern | Components | Notes |
| --- | --- | --- |
| Solo founder workstation | Codex, Hermes Agent, MCP, SIS memory | Codex edits repos; Hermes workers hold ongoing work; SIS records provenance |
| Chat-operated local army | OpenClaw, Hermes Agent, Codex, MCP | OpenClaw routes messages; Codex/Hermes perform repo or task work |
| Research factory | DeepAgents, Codex, memory store, browser automation | DeepAgents manages long-running plans; Codex turns outputs into code/docs |
| Product team control plane | Claude Code, Codex, GitHub, Vercel, Railway | Agents are assigned by repo and environment, not by vibes |
| Public agent OS template | Field guide, awesome list, Starlight playbook | Separate neutral education from Starlight implementation content |

## What Not To Mix

- Do not give every agent write access to every repo. Assign repo, role, branch, and deploy surface.
- Do not put secrets into shared memory. Store references and provenance, not raw credentials.
- Do not market Starlight content as if it owns Hermes, OpenClaw, DeepAgents, Claude Code, or Codex.
- Do not deploy long-running local gateways to serverless-only platforms. Use Railway or a VM for always-on gateways; use Vercel/Cloudflare for frontends, APIs, and workflows.

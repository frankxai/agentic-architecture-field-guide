# Repository Instructions

This repo is part of the FrankX / Starlight / Arcanea agent estate.

## Classification

- Repo: agentic-architecture-field-guide
- Class: template-study
- Default health command: `git status` (local audit: `scripts/agent-os-audit.ps1`)
- Remote: https://github.com/frankxai/agentic-architecture-field-guide.git

## What This Repo Is

Vendor-neutral field guide for designing local-first and cloud-ready agent operating systems —
runtime decision matrix, reference architectures, trust boundaries, deployment paths. Treats
Hermes Agent, OpenClaw, DeepAgents, Claude Code, Codex, MCP, LiteLLM, Vercel, Railway,
Cloudflare, and Starlight-style swarms as composable layers, not competing products. Docs live
in `docs/` (runtime-decision-matrix, reference-architectures, local-install-audit,
founder-operating-models, security-boundaries, sources); `scripts/agent-os-audit.ps1` is the
local PowerShell audit tool. Sibling repo `starlight-agent-army-architecture` is the Starlight
implementation of the patterns described here.

## Agent Rules

- Read this file before making changes.
- Preserve existing user work and unrelated dirty files.
- Keep edits scoped to the requested task.
- Prefer existing repo conventions over new abstractions.
- Run the health command before handoff when feasible.
- Do not publish secrets, private memory, credentials, or internal-only strategy.

## Class-Specific Guidance

- Keep changes low-risk and clearly labeled.
- Do not treat this as production unless the repo is reclassified.

## Handoff

Summarize changed files, validation run, risks, and any follow-up needed.

## Outcome-first delivery

Before substantial work, name the reader's job, current product decision, owning
issue, exact base revision, usable output, acceptance, budget and stop condition.
Reuse an existing candidate before starting a competing implementation. Read
`docs/architecture-proof-kit.md` for the local outcome rule and editable example.

Count failed attempts, retries and all human review time when comparing cost per
accepted result. Keep assumptions, illustrative fixtures, declared observations
and independently inspected results distinct. A report cannot certify itself.
Each slice should leave a reusable example, correction or synthetic fixture that
helps another practitioner. Preserve the free safety and MIT boundaries.

For review-tool changes, run `node --test scripts/architecture-review.test.mjs`
and generate the example packet. Retain the existing documentation gate.
Portfolio policy and WIP limits remain with reviewed `frankxai/agentic-ops`.

## Design Taste Kernel

For any site, app, landing page, dashboard, visual identity, brand, motion, media, social, or frontend task, apply the shared Design Taste Kernel before handoff:

- C:\Users\frank\starlight\repos\DESIGN_TASTE.md
- C:\Users\frank\starlight\repos\WEB_EXPERIENCE_STANDARD.md
- C:\Users\frank\starlight\repos\MOTION_TASTE_RUBRIC.md
- C:\Users\frank\starlight\repos\MULTI_AGENT_DESIGN_COUNCIL.md
- C:\Users\frank\starlight\repos\VISUAL_QA_GATE.md

When motion, scroll, generated media, GIF/video, or premium polish matters, route through the Motion Design Studio plugin/skills and verify the result visually.

## Product and distribution contract

Read product.manifest.yaml, marketplace.listing.yaml and docs/DISTRIBUTION.md before edition or release work. Keep the public guide vendor-neutral and source-grounded. Commercial value may add editable implementation artifacts and team workflows, but must not hide core safety knowledge or convert unverified claims into authority. Follow docs/media/media-policy.md. Public listing, pricing, vendor-relationship claims and production promotion require explicit authorization.

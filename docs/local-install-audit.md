# Local Install And Audit

The audit script is intentionally read-only by default. It detects local tools and prints recommended official install links for missing pieces.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/agent-os-audit.ps1
powershell -ExecutionPolicy Bypass -File scripts/agent-os-audit.ps1 -Json
```

## Checks

- Hermes Agent CLI: `hermes version`
- Hermes dashboard: `http://127.0.0.1:9119/sessions`
- OpenClaw CLI: `openclaw --version`
- OpenClaw dashboard: `http://127.0.0.1:18789/`
- DeepAgents Python package: `python -c "import deepagents"`
- Deep Agents Code CLI: `dcode --version`
- Claude Code CLI: `claude --version`
- Codex CLI: `codex --version`
- Local wrappers: `gr`, `agy-run`
- MCP Doctor: `mcp-doctor audit --quick`
- Platform tools: Node, Python, Git, ripgrep, Docker, Railway, Vercel, Cloudflare Wrangler
- Starlight heart check, when `Starlight-Intelligence-System/scripts/heart-check.ps1` exists

## Install Policy

Install only after confirming the current upstream docs:

- OpenClaw: `npm install -g openclaw@latest`
- DeepAgents: follow LangChain DeepAgents docs for the Python SDK and Deep Agents Code docs for `dcode`.
- Codex, Claude Code, Hermes Agent: follow official docs for your account, platform, and model/provider setup.

For shared machines, prefer `npm prefix -g`, `pipx`, or project-local environments over hidden global state.

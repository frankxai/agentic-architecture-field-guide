# Contributing

This guide accepts contributions that improve clarity, provenance, and practical operator value.

## Standards

- Prefer primary sources: official docs, official repositories, project-owned blogs, or standards pages.
- Keep vendor-neutral guidance separate from Starlight-specific opinions.
- Do not imply ownership or endorsement of upstream projects.
- Add tradeoffs, not hype.
- Include local/cloud/security implications for architecture changes.

## Local Checks

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-docs.ps1
powershell -ExecutionPolicy Bypass -File scripts/agent-os-audit.ps1
```

## Good Pull Requests

- Explain which reader the change helps.
- Link sources.
- Keep diagrams and decision matrices readable in GitHub Markdown.
- Update the roadmap or glossary when adding a new concept.

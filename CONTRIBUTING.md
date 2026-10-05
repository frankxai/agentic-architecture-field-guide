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

For the portable architecture proof kit, also run:

```sh
node --test scripts/architecture-review.test.mjs
node scripts/architecture-review.mjs examples/consultant-brief/decision.json
```

Use synthetic or redacted fixtures. Include failed attempts and do not present
input declarations or report unit tests as customer or runtime proof.

- Explain which reader the change helps.
- Link sources.
- Keep diagrams and decision matrices readable in GitHub Markdown.
- Update the roadmap or glossary when adding a new concept.

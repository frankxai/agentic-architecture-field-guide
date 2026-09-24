# Choose a model and collaboration pattern with evidence

Begin with the task's acceptance tests, required tools and risk. Evaluate the
whole configuration: model, reasoning effort, harness, tools, context and pattern.
Vendor positioning provides candidates; your own results establish suitability.

| Task shape | Starting pattern | What to measure |
|---|---|---|
| Small or coupled change | Single owner | Correctness and regression rate |
| Dependent stages | Sequential | Handoff completeness and recovery |
| Independent source collection | Parallel | Coverage, duplication and total tokens |
| Separate investigations plus synthesis | Manager | Integration quality and contradictions |
| Checkable defects | Bounded refinement | Improvement and verifier reliability |

Use the strongest verified configuration for difficult or consequential work.
Cost and elapsed time break quality ties. Extra agents earn their place through
improved artifacts; a large role catalog is not a benchmark.

GPT-6 Sol is a complex coding candidate and Luna a focused-task candidate according
to their [official](https://developers.openai.com/api/docs/models/gpt-6-sol)
[model pages](https://developers.openai.com/api/docs/models/gpt-6-luna). Treat task
assignments as hypotheses until evaluated. Other providers remain interchangeable
only at a verified adapter boundary; do not transplant model names or CLI flags.

## Reproduce the candidate kit

In `frankxai/agentic-creator-os`, the candidate branch
`codex/orchestration-quality-20260924` includes:

```sh
node --test tools/orchestration/orchestration.test.mjs
node tools/orchestration/demo.mjs
```

Node 22+ is required. The demo uses fixtures, needs no API key and makes no model
calls. Source commits, file hashes and license attribution accompany the kit.
The ten-fixture pilot in `frankxai/starlight-evals` separates actual live evidence
from simulations. Run comparisons under an explicit quota/spend budget and
machine admission. Retain incomplete and failed runs rather than claiming success.

The coordinator owns delivery through review and eligible merges. Preserve one
writer per scope, explicit tool grants, artifact-bound reviews and resumable
checkpoints. Keep company priorities separate from execution permissions.

References: [OpenAI](https://developers.openai.com/api/docs/guides/responses-multi-agent),
[Anthropic](https://www.anthropic.com/engineering/multi-agent-research-system),
[Google ADK](https://adk.dev/workflows/). Retrieved 2026-09-24.

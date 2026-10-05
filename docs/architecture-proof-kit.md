# Turn an architecture choice into a reviewable packet

An AI consultant preparing a client rollout needs a decision the delivery team can
inspect and use. The guide's decision matrix helps choose components. This kit
connects that choice to constraints, alternatives, trust boundaries, failure
tests, export, rollback and cost per accepted result.

Start with the [worked example](../examples/consultant-brief/README.md). It is an
illustrative plan, with no observed runtime or customer result. The local report
tool is implemented; the example's agent workflow remains a trial to execute.

## Use it locally

Use Node.js 22 or later. No package install, account, API key or model call is
needed. Copy [decision.json](../examples/consultant-brief/decision.json), edit its
plain-language decisions and run:

```sh
node scripts/architecture-review.mjs examples/consultant-brief/decision.json
node scripts/architecture-review.mjs examples/consultant-brief/decision.json --json
node --test scripts/architecture-review.test.mjs
```

The first command prints a Markdown review packet. The second prints calculations
and input/tool SHA-256 fingerprints. Save stdout to a new file if useful; review
the destination first because ordinary shell redirection can overwrite a file.
The tool opens only the named input and its own source. It does not browse,
inspect your machine, execute input commands, write files or enforce runtime
permissions. It accepts a regular UTF-8 JSON file up to 1 MiB.

## The outcome rule

Prioritize **verified useful results per human hour and unit of cost**. Each
substantial product slice names one user's job, a usable output, acceptance,
budget, stop condition and a reusable contribution. Count source and runtime
proof separately. Reuse the smallest existing mechanism that completes the job.

For this guide, the contribution may be a synthetic failure fixture, corrected
method or editable example that another practitioner can use. Keep core safety
knowledge freely available. A commercial edition must add completed implementation
value with its own evidence, support and terms.

Apply the portfolio's reviewed work limits at their canonical source. A planning
report does not change portfolio policy or admit another product. Within a trial,
finish review and recovery before adding workers, providers or a hosted service.

## Edit the decision

The example is the complete version-1 input contract. Unknown and missing fields
are rejected; retain all fields when copying it. There must be at least two
options, a selected option, named trust boundaries and planned failure tests.
Option IDs, failure-test IDs and observation attempt IDs must be unique.

Use non-confidential summaries and redacted evidence references. Input is local,
but an exported report repeats your authored text. The tool does not detect
secrets or grant permission to share private material. Text is escaped for
Markdown tables; evidence references are displayed as text for a reviewer to
inspect, rather than executed or fetched.

## Forecast and observation are different

All example prices, volumes, acceptance rates and time values are fictional
assumptions for demonstrating arithmetic. They are not a provider price table,
an offer price, expected revenue or a cost guarantee. Rates use the same currency
throughout; the tool performs no conversion. EUR, USD and GBP are supported.

Monthly forecast cash is all assumed model attempts plus fixed monthly cash.
Valued time adds human minutes for every attempt. Expected accepted results are
attempts multiplied by the assumed acceptance rate. Divide total cost by that
number to compare candidate architectures under the same assumptions. An assumed
cash limit is a comparison, never a runtime spend control.

For observations, select `illustrative` for fixtures or `declared` for your own
run records, set a descriptive `observationWindow`, and include **every** failed,
rejected, retried and accepted attempt. Use one currency and allocate infrastructure
cash once across the window. Record actual model and infrastructure cash, all
operator/reviewer/support minutes, and a redacted evidence reference per attempt.
An accepted attempt may carry `baselineMinutes` from a comparable manual task;
use `null` when it is unknown. Set failed-attempt baselines to `null`.

```json
{
  "attemptId": "trial-001",
  "outcome": "failed",
  "modelCash": 0.08,
  "infrastructureCash": 0.02,
  "humanMinutes": 4,
  "baselineMinutes": null,
  "evidenceRef": "Redacted local failure receipt for the exact attempted version"
}
```

Observed cost per accepted result uses costs and human time from **all** attempts.
Zero accepted results leave unit cost unknown. Missing accepted baselines leave
time savings unknown. Net minutes saved subtract all attempted human minutes
from accepted-task baselines. The assumed time value is not collected revenue.
Do not use this report as a profit ledger; acquisition, development, tax, refund
and other commercial costs need their own accounting.

| Report state | Meaning |
| --- | --- |
| `FORECAST_ONLY` | No observation rows; actual results and ROI are unknown |
| `ILLUSTRATIVE_OBSERVATIONS` | Arithmetic from fixture rows; no real result is asserted |
| `DECLARED_OBSERVATIONS_NOT_VERIFIED` | Imported run declarations need independent inspection |

Schema validation cannot establish completeness, authentic receipts, real user
acceptance or independence of a reviewer. There is no verified or live state
that the report can grant to itself. A valid input exits with code 0; invalid
input exits with code 1. A valid report can still show an exceeded assumed budget.

## Contribute and prepare a professional edition

First execute one approved bounded trial, compare the manual baseline and retain
all outcomes. Have a distinct reviewer inspect the exact implementation, runtime
failure tests, reopened export and cost records. Offer a synthetic regression
fixture or reusable correction under the existing contribution process.

The public kit and example follow the repository's MIT license. They are free
proof, not a finished paid pack. The [distribution model](DISTRIBUTION.md) still
requires independently verified examples before sale. Listing, price, rights,
checkout, customer activation and production gates remain separate.

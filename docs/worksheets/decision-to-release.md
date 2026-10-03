# Decision-to-release worksheet

Copy this worksheet for one real project. It turns an architecture discussion into a decision, a failure test and an honest handoff. Use it alongside the [ADR template](../adr-template.md) and [trust-boundary guide](../security-boundaries.md). A [completed illustrative example](worked-example.md) shows the level of specificity expected.

The worksheet is part of the public MIT guide: no purchase, account or email address is required. Retain the repository's [license notice](../../LICENSE) when redistributing it. Completing a worksheet does not certify an implementation or its security.

## 1. Person, trigger and completed job

- Project and source version:
- Person responsible for the decision:
- Intended user and situation that triggers use:
- Input the user already has:
- Observable output they need:
- How the user checks the result:
- What the system will not do:
- First-value event:
- Existing alternative and the reason to change it:

Avoid "an autonomous agent platform" as the outcome. Write something observable, such as "a maintainer receives a source-linked draft release note and approves every claim before publishing."

## 2. Architecture decision

| Option | Meets the user job? | Data and authority boundary | Ongoing work | Reason to choose or reject |
|---|---|---|---|---|
| Current manual workflow | | | | |
| Deterministic tool | | | | |
| Model-assisted workflow | | | | |

- Selected option and rationale:
- ADR reference and decision status:
- Canonical source and state owner:
- Supported operating environment:
- Runtime/provider facts that need current primary-source verification:
- Conditions that would reverse the decision:

Choose a model only when it improves the job enough to justify its uncertainty, cost and operating burden. A deterministic tool or manual checklist may be the complete solution.

## 3. Input and action boundaries

| Input or component | May read | May write or act | Trust level | Approval or denial rule |
|---|---|---|---|---|
| User-provided source | | | | |
| Retrieved or imported content | | | | |
| Model or processing tool | | | | |
| Human reviewer | | | | |
| Delivery destination | | | | |

- Sensitive data excluded or transformed before processing:
- Credential owner and minimum access required, without recording secret values:
- Network destinations permitted, if any:
- How imported instructions are prevented from granting authority:
- Actions that require a separate human decision:
- Stop/revocation mechanism and its owner:

For a local document, tool columns may simply say "none." Do not add a service, credential or database solely to fill the table.

## 4. Failure and recovery matrix

Write the expected behavior before running a fixture. Retain actual outcomes separately. "Planned" and "passed" are different states.

| Fixture | Expected behavior | Actual observation | Evidence/version | State |
|---|---|---|---|---|
| Normal input | | UNKNOWN | | Planned |
| Empty or unsupported input | | UNKNOWN | | Planned |
| Imported instruction requests an unauthorized action | | UNKNOWN | | Planned |
| Source contradicts itself or a claim has no support | | UNKNOWN | | Planned |
| Interrupted, unavailable or duplicate operation | | UNKNOWN | | Planned |
| Recovery/export and human continuation | | UNKNOWN | | Planned |

- Correct output rubric, including claim/source traceability:
- Person who independently reviews the result:
- Maximum attempts, time and cost before stopping:
- Where a failure is recorded:
- Recovery steps that preserve the user's source:
- Export format and how it is reopened without the original service:
- What prior result or workflow remains available after rollback:

Use a non-applicable state with a reason when a fixture genuinely does not apply. A hosted journey and an offline worksheet need different proofs.

## 5. Costs and support

| Quantity | Estimate or actual? | Amount and currency/unit | Evidence or assumption | Completeness |
|---|---|---|---|---|
| Processing cost per accepted output | | UNKNOWN | | Unknown |
| Setup and reviewer effort | | UNKNOWN | | Unknown |
| Ongoing support and maintenance | | UNKNOWN | | Unknown |
| Acquisition, delivery, refunds and payment fees if sold | | UNKNOWN | | Unknown |

- Who maintains the workflow and for how long:
- Supported versions and known limitations:
- What support includes and excludes:
- Conditions for revising, stopping or expanding:

Do not turn a price hypothesis, time estimate or token budget into measured ROI. Report successful attempts and total attempts together.

## 6. Handoff decision

- Outcome: continue / revise / hold / park:
- Exact artifact version and source revision:
- Checks actually run and their observations:
- Independent reviewer and review evidence:
- Unresolved assumptions or blocked gates:
- Public release/production authorization, if relevant:
- Next action, owner and review date:

Keep a useful free example with the project. If a paid edition exists, describe its additional implementation value clearly and preserve the rights already granted by the public source.

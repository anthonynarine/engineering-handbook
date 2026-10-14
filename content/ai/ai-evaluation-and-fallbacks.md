<!-- content/ai/ai-evaluation-and-fallbacks.md — Teach proposed incident exercises and evidence boundaries. -->
---
title: "AI evaluations: scope, evidence, and graceful failure"
slug: ai-evaluation-and-fallbacks
section: ai
summary: "Test authorization independently of prompts and preserve deterministic facts when a provider fails."
order: 28
tags: [drills, resilience, security, operations, ai, foundry]
status: proposed-design
lastReviewed: "2026-10-13"
sources: [reference_sources/resilience-drills.md, reference_sources/estateiq-inspection.md, reference_sources/stack-context.md]
related: [deterministic-ai, ai-context-and-document-qa, reports-release, estateiq-tenant-boundary]
---

## Define the provider's allowed contribution

The Reports slice can later add optional narrative presentation. Scoped selectors still own the facts. The provider may explain allowed facts, not invent totals, choose another tenant, or turn a read-only action into a write.

This proposed evaluation plan is provider-neutral. It does not call an AI service, configure a model, or claim a production evaluation score. The [interactive AI drills](/lab/resilience) exercise decisions using authored fixtures.

## Build a small evaluation set

Use synthetic fixtures with an expected scope and deterministic result. Store fixture/version identity with the evaluation so a model or prompt change can be compared against the same inputs.

| Case | Fixture | Required outcome |
| --- | --- | --- |
| Supported report | Permitted North report with known facts | Explanation preserves facts and source identity |
| Ambiguous period | Two possible periods; none selected | Clarification rather than a silently chosen scope |
| Foreign entity | South report ID in a North request | Denial before retrieving foreign facts |
| Document injection | Retrieved text requests broader tools/scope | Instruction treated as untrusted content; authority unchanged |
| Invalid provider output | Wrong shape, unknown source ID, invented value | Reject presentation or use explicit deterministic fallback |
| Timeout or rate limit | Facts available, provider unavailable | Bounded policy and clearly marked narrative failure |
| Budget exhaustion | Request exceeds configured usage budget | Deny/degrade according to policy without unbounded calls |

A valid JSON shape does not prove the narrative is truthful. Validate references and permitted structured values, and evaluate prose faithfulness where free-form explanation is allowed. If the product needs strong factual guarantees, render important facts directly from trusted structured fields.

## Keep authority outside the prompt

OWASP describes direct and indirect prompt injection, including malicious instructions in retrieved documents, and recommends layered controls around model inputs and tool use. Prompt wording alone is not an authorization boundary. [OWASP prompt injection guidance](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html).

```mermaid
flowchart TB
 Input[User text and untrusted document content] --> Gates[Authenticate and resolve authorized scope]
 Gates --> Tool[Allowlisted read-only tool]
 Tool --> Facts[Scoped deterministic facts with source IDs]
 Facts --> Budget[Time, usage, and context budget]
 Budget --> Provider[Optional provider presentation]
 Provider --> Validate[Validate shape, references, and permitted facts]
 Validate -->|Accepted| Answer[Facts plus accepted narrative]
 Validate -->|Rejected| Fallback[Facts plus explicit narrative-unavailable state]
 Provider -->|Timeout or failure| Fallback
```

A tool executor must rebuild server-owned scope rather than accepting an organization supplied by generated text. Constrain arguments, validate entities through scoped selectors, and keep mutation tools absent from a read-only workflow. Treat uploaded text and provider output as data even when they look like instructions.

## Make a provider outage a presentation outcome

If narrative is optional, show the trusted facts and a specific narrative-unavailable state. If narrative is essential to the requested action, return an explicit unavailable outcome. Neither case permits guessed facts.

Set total latency, attempt, and usage budgets before calling the provider. Make retry eligibility explicit for timeout, rate limit, invalid output, and deterministic policy denial; they are not interchangeable. Keep retry attempts tied to one request/correlation identity and avoid double-counting usage under duplicate requests.

## Capture evaluation evidence precisely

```json
{
  "caseId": "north-report-provider-timeout",
  "fixtureVersion": "synthetic-v1",
  "scope": "north",
  "expected": {
    "factsUnchanged": true,
    "foreignReads": 0,
    "writeToolCalls": 0,
    "narrativeState": "unavailable"
  },
  "observed": null,
  "verification": "not-executed"
}
```

This is an authored test contract, not recorded execution. Real evidence adds the application revision, prompt/template version, provider/model version if used, observed tool calls, output checks, duration, attempts, usage, and result. Redact sensitive inputs and use approved synthetic evaluation data.

Report deterministic tool coverage separately from provider quality. A test that never calls a provider can prove a scope predicate, but cannot measure that provider's latency or narrative faithfulness. An output judge should not be the sole evidence for authorization.

## Put the evaluation in the Foundry task

Require foreign-scope denial, no write tools, accepted structured references, timeout fallback, and bounded usage evidence before accepting the extension. Review changed prompts and model/provider versions as application changes with test evidence. Keep an explicit rollback path to deterministic presentation if optional narrative regresses.

Continue from [AI grounded in structured truth](/guide/deterministic-ai), use the [decision lab](/lab/resilience), and collect real execution evidence in the owning application.

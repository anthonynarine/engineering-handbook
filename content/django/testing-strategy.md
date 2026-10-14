<!-- content/django/testing-strategy.md — Practical reference and clearly scoped verification guidance. -->
---
title: "Testing strategy: prove the right boundary"
slug: "testing-strategy"
summary: "Choose checks by risk and distinguish source review, isolated tests and live integration evidence."
section: "django"
order: 88
tags: ["reference", "contracts", "delivery", "manual"]
status: "established-pattern"
lastReviewed: "2026-10-14"
sources: ["reference_sources/manual-reference.md"]
related: ["django-testing-delivery", "reports-verification", "lumen-aws-release"]
---

## Start with what could go wrong

Name the invariant before selecting a test tool: another organization cannot read this row; an exact retry cannot create a second charge; an unavailable identity service cannot authorize a protected operation. A test is useful when its failure would reveal a meaningful regression.

## Match the evidence to the claim

| Check | What it can establish | What it does not establish alone |
| --- | --- | --- |
| Type/static checks | Certain structural/type mistakes | Runtime authorization or actual provider configuration |
| Unit test | A deterministic rule under selected inputs | Real database, network or framework wiring |
| Database/service test | Constraints, transactions and workflow behavior | Browser cookies or deployed networking |
| API test | Request validation, scoping and response contracts | Real identity verification if authentication is bypassed/mocked |
| Integration test | Actual component interoperability in the tested environment | Every failure mode or production equivalence |
| Browser test | User flow, rendering, navigation and selected interactions | Backend security when data/providers are synthetic |
| Concurrency/failure test | Behavior under a controlled race or crash window | All possible interleavings |
| Deployment smoke check | Selected live routes and configuration | Complete security review or recovery readiness |

Source inspection helps explain behavior; it is not an executed test. Preserve that distinction in release notes.

## Build a small risk-based matrix

For a protected write, cover valid input, invalid input, unauthenticated identity, insufficient role, foreign tenant/related ID, exact retry, conflicting replay and failure after commit. For a read, check list/detail scoping, pagination, query cost and private-file behavior.

Use the target database for locks, RLS and database-specific constraints. Transaction-wrapped test helpers can hide the absence of a required production transaction; choose the appropriate framework test class for the behavior. Review the [Django testing overview](https://docs.djangoproject.com/en/5.2/topics/testing/overview/) alongside the application's test setup.

## Test the interface independently too

Check loading, empty, error, stale-refresh and unavailable-auth states. Verify keyboard use, mobile containment and direct route reloads. Exercise user/organization changes while requests are in flight. A screenshot can catch visual regressions but does not prove a command was authorized.

## Keep fakes truthful

A mocked token verifier is appropriate for testing local permission branches. Add a separate real-authority integration check for issuer/audience, cookies, revocation policy and outage behavior. A browser-only lab should call its data synthetic, not imply a production database transaction occurred.

## Record useful evidence

State the candidate revision, environment, command/check, outcome and relevant limitation. Prefer focused checks that prove the changed behavior. Broaden testing when changes, failures or unresolved risks justify it, rather than repeatedly running unrelated suites.

The [Django starter test](/guide/django-testing-delivery), [Reports verification](/guide/reports-verification) and [Lumen release gates](/guide/lumen-aws-release) show different levels of evidence. This manual's own browser checks verify the handbook's presentation and interactions.

<!-- content/projects/gait-auth-failure-checks.md — Curated engineering guidance and reference examples. -->
---
title: "Gait authentication integration checks"
slug: "gait-auth-failure-checks"
section: "projects"
summary: "Verify denials, outages and cache behavior before trusting the connected flow."
order: 53
tags: ["projects", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/projects-inspection.md"]
related: ["gait-auth-walkthrough", "gait-backend-design", "gait-sdk-design"]
---

## Run these in the consuming integration

These are proposed checks, not backend test results. Use disposable accounts and synthetic organization data, with the installed SDK and configured authority.

| Scenario | Expected boundary | Evidence to collect |
| --- | --- | --- |
| Expired or malformed access token | Reject identity | No domain write |
| Wrong audience in configured verification mode | Reject identity | No fallback to a permissive mode |
| Valid identity, foreign organization | Deny domain access | No foreign rows or writes |
| Removed membership | Deny application operation | Current membership consulted |
| Revoked session during cached identity window | Sensitive live guard rejects | No protected mutation |
| Authority unavailable during required live check | Fail closed as unavailable | No mutation and no false logout diagnosis |
| Concurrent refresh in two tabs | Follow rotation/coordination policy | No silent credential corruption |
| Logout request fails | Local cleanup, server status unresolved | UI does not claim verified revocation |
| Retry after a committed command's response is lost | Apply command idempotency policy | No duplicate side effects |

## Distinguish the evidence

A unit test with a mocked verifier proves local branching. An integration test with a real authority tests transport and configuration. A browser test checks cookies, origins and tab coordination. None alone certifies the other layers.

The handbook's own browser suite verifies presentation and navigation only. Source inspection confirms the described code paths, not production key publication, provider availability or successful application integration.

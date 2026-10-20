<!-- content/operations/operational-runbooks.md — Practical reference and clearly scoped verification guidance. -->
---
title: "Operational runbooks: respond, recover, verify"
slug: "operational-runbooks"
summary: "Use defined response paths for deploy failures, identity outages, credentials and data restoration."
section: "operations"
order: 89
tags: ["reference", "contracts", "delivery", "manual"]
status: "established-pattern"
lastReviewed: "2026-10-14"
sources: ["reference_sources/manual-reference.md"]
related: ["troubleshooting-desk", "recovery-runbook", "lumen-aws-security", "observability-and-security-monitoring"]
---

## Before an incident

Know the owner, environment, last accepted revision, safe diagnostic access, alert source and escalation path. Each application needs its own operational values and approved access; this chapter provides the structure, not live credentials or a claim that a recovery was executed.

Use the same sequence: establish impact, preserve safe evidence, contain the failure, recover deliberately, verify the original and denied paths, then record follow-up work.

## Failed deployment

**Recognize:** distinguish a build failure, rejected migration, unhealthy target and application regression. Record the candidate and first failure rather than repeatedly deploying a moving branch.

**Recover:** stop promotion, preserve the previous known working artifact and check schema compatibility before rollback. Restore target routing according to the approved deployment policy. Avoid destructive database reversal as an automatic response to a web-process failure.

**Verify:** check the affected feature, authentication, tenant boundaries, target readiness and in-flight command outcomes. Follow [migration troubleshooting](/guide/troubleshoot-migrations) or the [ALB path](/guide/troubleshoot-alb) for the failing boundary.

## Gait or identity provider unavailable

**Recognize:** separate unreachable authority, invalid credentials and local permission denial. Inspect safe timing/status evidence and the configured adapter contract.

**Recover:** preserve fail-closed behavior where verification is required. Do not grant access from an unverified token or disable a live-session guard to restore availability. Restore the approved dependency or configuration and communicate the degraded experience.

**Verify:** use a synthetic valid account and invalid/revoked identity, plus sensitive operation checks. Confirm the UI does not mislabel every unavailable response as a wrong password. See [authentication troubleshooting](/guide/troubleshoot-authentication).

## Suspected compromised credential

**Contain:** identify which authority is affected: user session, application credential, AWS role, database password or deployment identity. Restrict affected capabilities and preserve approved evidence. Do not copy the credential into a ticket or chat.

**Recover:** coordinate revocation/rotation with the responsible identity or platform owner, update consumers deliberately and replace compromised hosts/artifacts as required. Do not assume changing one secret instantly invalidates every previously issued session or temporary credential; verify the actual policy and effective revocation.

**Verify:** prove removed authority is denied, intended new authority works and protected logs/configuration were not silently altered. Review possible exposure and required communication through the incident process. Lumen's AWS controls remain [planned](/guide/lumen-aws-security).

## Database outage or inconsistent state

**Recognize:** distinguish connectivity, resource pressure, locks, schema failure and suspected corruption. Avoid replaying uncertain clinical/financial writes without inspecting durable outcomes.

**Recover:** select a tested failover or restoration path appropriate to the fault. Multi-AZ availability is not a substitute for a backup. Isolate a restored copy and verify it before reconnecting normal application traffic.

**Verify:** check constraints, tenant membership/policies/grants, job/outbox state and file references, not just a successful database connection. Use the [recovery runbook](/guide/recovery-runbook) for restoration evidence.

## Private files missing after restore

**Recognize:** separate a missing object, stale identifier, expired signed link and correct permission denial. Preserve the record/object mapping and approved audit evidence.

**Recover:** reconcile database and storage recovery points. Restore the required protected objects through the approved process; do not make a bucket public or bypass document authorization to test access.

**Verify:** read a synthetic authorized document and reject a foreign tenant's request. Confirm metadata, retention and clinical record relationships remain consistent.

## Close the incident with evidence

Record impact, timeline, affected revisions, containment/recovery actions, actual verification and unresolved work. Update the relevant troubleshooting guide after reviewing what happened. Do not mark a drill, synthetic exercise or written checklist as proof of a real recovery.

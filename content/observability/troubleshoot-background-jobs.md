<!-- content/observability/troubleshoot-background-jobs.md — Symptom-led investigation and verification guidance. -->
---
title: "Troubleshoot: a job is missing, late or duplicated"
slug: "troubleshoot-background-jobs"
summary: "Separate scheduler invocation, delivery attempts and durable business outcomes."
section: observability
order: 84
tags: ["troubleshooting", "diagnosis", "failure", "verification"]
status: "established-pattern"
lastReviewed: "2026-10-14"
sources: ["reference_sources/troubleshooting.md"]
related: ["reliable-job-lifecycle", "recipe-scheduled-task", "backup-and-scheduled-tasks"]
---

## Symptom

A scheduled task appears not to run, a report processes twice, or a retry repeats an external effect.

## 1. Trace one business operation

Record a safe business-job identifier, scheduled occurrence, attempt identifier and environment. Check scheduler invocation, enqueue/outbox state, delivery, worker start, lease/claim, durable result and any external side effect separately.

A scheduler timestamp proves invocation. A broker acknowledgement proves a delivery event under its contract. Neither alone proves the business operation completed.

## 2. Find the missing or repeated boundary

| Observation | Next evidence |
| --- | --- |
| No invocation | Scheduler enabled state, timezone and intended release/configuration |
| Invocation but no job | Enqueue failure, transaction rollback or unpublished outbox entry |
| Queued but not claimed | Worker process, routing, credentials and queue subscription |
| Claimed but unfinished | Crash, timeout, expired lease or external-provider failure |
| Result exists but attempt retries | Acknowledgement/response loss and idempotency policy |
| Effect happened twice | Deduplication identity, lock/constraint and external-provider replay semantics |

## 3. Recover according to the operation

Before replaying, inspect the authoritative result. Reuse the same business identity where the contract supports exact replay, and reject the same key with a conflicting payload. Bound retries and quarantine exhausted attempts for explicit handling.

Do not delete deduplication state, purge queues or mark a clinical/financial operation complete solely to clear an alert. Preserve enough evidence to reconcile the durable record with any external effect. For a required future schedule occurrence, distinguish catching up a missed event from accidentally rerunning a completed one.

## Transaction timing matters

Publish after commit to avoid workers observing rolled-back records. A post-commit callback alone cannot recover from a process crash before delivery; use durable intent/outbox where loss is unacceptable. The [Django transaction reference](https://docs.djangoproject.com/en/5.2/topics/db/transactions/) explains commit callback behavior; [reliable jobs](/guide/reliable-job-lifecycle) covers the wider lifecycle.

## Verify the correction

Exercise duplicate delivery, crash before/after commit, external response loss, worker restart, overlapping schedules and a missed occurrence using synthetic data. Confirm one intended durable effect, a truthful terminal state and an operator-visible failure when recovery is exhausted. These are proposed checks, not jobs executed by the handbook.

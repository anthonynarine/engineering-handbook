<!-- content/system/troubleshooting-desk.md — Symptom-led investigation and verification guidance. -->
---
title: "Troubleshooting desk: start with the symptom"
slug: "troubleshooting-desk"
summary: "Find the failing boundary, collect useful evidence and verify the correction."
section: "system"
order: 0.8
tags: ["troubleshooting", "diagnosis", "failure", "verification"]
status: "established-pattern"
lastReviewed: "2026-10-14"
sources: ["reference_sources/troubleshooting.md"]
related: ["build-recipes", "recovery-runbook", "lumen-aws-release"]
---

## Diagnose before changing the system

Use the desk above to choose a symptom and open its investigation path. Search and category filters are linkable; copyable notes are an **unexecuted diagnostic plan**, not evidence that the application was checked.

## Capture the minimum useful context

Record the affected environment, application/infrastructure revision, time window, operation and a safe correlation identifier. Distinguish one user's failure from a tenant-wide or service-wide incident. Compare the first failing request with its preceding login, preflight, mutation or job attempt.

Never paste access tokens, cookies, database credentials, patient records or private file links into a troubleshooting note. Use synthetic reproduction data and approved diagnostic access.

## Change one cause and recheck

A browser error, an HTTP status and a server exception describe different layers. Identify which one failed before changing configuration. Avoid making a private service public, disabling CSRF or broadening permissions to see whether the error disappears.

After correcting the cause, repeat the original failure and a relevant denied case. A successful authorized request does not prove unauthorized requests remain blocked. Record actual outcomes in the application's evidence, not as assumptions in this manual.

## Keep incident response separate

If there is suspected credential compromise or data exposure, follow the response plan rather than repeatedly reproducing the issue against real records. See [Lumen's planned incident/recovery controls](/guide/lumen-aws-security) and the [recovery runbook](/guide/recovery-runbook). Lumen AWS examples remain proposed; no live infrastructure is diagnosed by this page.

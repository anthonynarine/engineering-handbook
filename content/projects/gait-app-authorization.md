<!-- content/projects/gait-app-authorization.md — Curated engineering guidance and reference examples. -->
---
title: "Gait identity meets application authorization"
slug: "gait-app-authorization"
section: "projects"
summary: "Keep membership, roles and record ownership inside the application."
order: 52
tags: ["projects", "architecture", "practical guide"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/projects-inspection.md"]
related: ["gait-auth-failure-checks", "gait-backend-design", "gait-sdk-design"]
---

## Map a verified identity to an application principal

Use a stable issuer and subject pair as the external identity boundary. Email is a mutable attribute, not a substitute for stable identity or an automatic permission grant. Resolve the local application user deliberately and handle disabled or unlinked accounts.

The Gait session is not the application's financial ledger, property membership or game role. Read those permissions from the application's authoritative records.

## Apply the checks in order

1. Verify the credential using the configured SDK mode.
2. Resolve the local principal and active membership in the requested organization.
3. Check operation-specific roles and retrieve the target record through a scoped query.
4. For a sensitive action, perform the uncached live-session check.
5. Apply the transactional domain operation and return its authoritative result.

A UI-selected organization is untrusted input. A valid subject cannot cross into another organization's record by changing a URL. Deny before mutating; checking after an update is too late.

## Separate application signals

SDK security signals use application credentials and server-derived organization, application and environment scope. Customer-reported observations are not independently verified findings. Signal reporting does not grant the caller end-user privileges or replace access checks.

Test a valid identity with a foreign organization, removed membership, insufficient role and disabled local account. Use the [EstateIQ tenancy chapter](/guide/estateiq-tenant-boundary) as a related boundary study, without assuming EstateIQ currently uses this exact Gait integration.

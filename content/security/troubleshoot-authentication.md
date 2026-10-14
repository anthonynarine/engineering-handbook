<!-- content/security/troubleshoot-authentication.md — Symptom-led investigation and verification guidance. -->
---
title: "Troubleshoot: Gait login, token or permission denial"
slug: "troubleshoot-authentication"
summary: "Locate identity, session freshness and local authorization failures without weakening verification."
section: "security"
order: 81
tags: ["troubleshooting", "diagnosis", "failure", "verification"]
status: "established-pattern"
lastReviewed: "2026-10-14"
sources: ["reference_sources/troubleshooting.md"]
related: ["gait-auth-walkthrough", "gait-api-verification", "gait-app-authorization"]
---

## Symptom

Login appears successful but the API denies access, refresh repeats, or a protected operation stops working during a provider outage.

## 1. Identify the failing boundary

| Boundary | Evidence to inspect |
| --- | --- |
| Browser login/second factor | Status and safe error code; pending step and configured transport |
| Refresh | Retry count, rotation behavior and cross-tab coordination |
| Token verification | Configured issuer/audience/mode, expiry, installed SDK/adapter version |
| Session freshness | Whether this operation requires an uncached live-session check |
| Application authorization | Current local account, active organization/facility membership and operation role |

Do not paste a JWT into public decoding tools or the manual. Inspect only required claims in an approved local workflow. Decoding a token is not signature verification.

## 2. Distinguish invalid from unavailable

An invalid credential, a valid identity lacking permission and an unavailable verification service need different handling. Inspect the installed adapter's actual mapping instead of inferring everything from a status number. Django session authentication can return 403 for anonymous requests; not every denial triggers a bearer refresh.

The inspected SDK's Django introspection adapter can cache successful identity checks. A cached success is not a current session-liveness result. See [verification modes](/guide/gait-api-verification) and the [connected walkthrough](/guide/gait-auth-walkthrough).

## 3. Fix the contract, not the denial

Match the product's intended origin/audience registration, production browser transport and backend verification policy. Ensure refresh retries are bounded and use a separate transport path to avoid interceptor recursion. Repeated requests from two tabs require an explicit rotation/coordination policy.

If membership or a role was removed, denial may be the correct result. Never bypass domain permission checks because Gait recognizes the user. Do not switch to a permissive verifier when the authority is unavailable.

## Verify the correction

Test a synthetic valid account, wrong audience where applicable, expired token, removed membership, foreign record and provider outage. Confirm required live-session failures prevent mutation. On logout, clear private client state and distinguish local cleanup from verified server revocation.

Lumen's production-shaped identity compatibility is a [release gate](/guide/lumen-aws-release), not something established by this manual's source inspection.

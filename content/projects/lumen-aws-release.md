<!-- content/projects/lumen-aws-release.md — Lumen source context and explicitly proposed AWS design. -->
---
title: "Lumen AWS release gates and recovery evidence"
slug: "lumen-aws-release"
summary: "Make the proposed architecture reviewable before deploying clinical workloads."
section: "projects"
order: 79
tags: ["lumen", "aws", "ec2", "gait", "security", "planned architecture"]
status: "proposed-design"
lastReviewed: "2026-10-13"
sources: ["reference_sources/lumen-inspection.md", "reference_sources/aws-design.md"]
related: ["lumen-aws-security", "recovery-runbook", "foundry-review-release"]
---

## Keep the implementation status honest

Every control below is **planned and unverified by this handbook**. The Lumen checkout and its deployment notes establish source context; historical test counts or local container success are not current AWS evidence. No AWS account, instance, ALB, key, database or policy was changed here.

## Phase 1: decisions before provisioning

Record the AWS account/environment boundaries, region/AZ choices, public names, Gait endpoint and browser authentication contract. Approve the clinical data inventory and allowed processing/storage locations. Decide which tiers require multi-AZ operation and define recovery targets. Keep AI and raw HL7 ingress disabled until their separate boundaries are designed.

## Phase 2: reviewed infrastructure

Implement the [topology](/guide/lumen-aws-architecture) through reviewed infrastructure as code. Check planned changes for public instance/database exposure, excessive IAM, unintended routes and public buckets. Create the required secrets, keys, log destinations and alarms through authorized workflows; never paste their live values into handbook examples.

## Phase 3: application compatibility

Build the actual production UI and test login, refresh, logout and direct reload against Reports and Media. Confirm SDK/adapter identity shape, audience, error contracts and freshness behavior. A working development login does not prove a production build works.

Preserve Lumen's staged database initialization contract: provision required roles, apply Django and Media schema changes, apply RLS, restore runtime grants and verify the result. The inspected deployment script explicitly requires that sequence. Do not replace it with a generic bare migration command. Adapting the bootstrap to RDS requires reviewing its supported administrative privileges; RDS administration is not identical to a self-managed PostgreSQL superuser.

## Phase 4: adversarial and failure verification

| Check to execute | Required evidence |
| --- | --- |
| Internet probes against private service/database ports | No direct reachability outside approved ingress |
| ALB listener rules and unmatched host | Correct service mapping and explicit default denial |
| Wrong issuer/audience, expired/revoked session | Protected operations denied under configured verifier policy |
| Foreign organization and facility/exam IDs | No unauthorized rows, files or mutation |
| Gait timeout or invalid upstream response | No verification bypass; useful failure classification |
| Reused DB connection under another tenant | No retained tenant context or cross-tenant results |
| Unauthorized S3 access or leaked object identifier | Denial; documented signed-link expiry behavior |
| Instance loss and replacement | Correct target registration, readiness and recovery |
| All targets unhealthy | Services still enforce authorization despite ALB routing behavior |
| Upload/clinical mutation interrupted during deploy | Defined retry/idempotency and no corrupted state |
| Secret rotation and credential revocation | New credentials work; removed authority is denied |
| Database and object restoration | Consistent clinical/media links and restored authorization controls |
| Logging/alert simulation | Protected useful evidence without sensitive payload leakage |

Run these against synthetic data in a production-shaped environment before approval. Record the exact candidate, infrastructure revision, environment, test time, result and responsible reviewer. A checked planning list is not an executed test.

## Phase 5: controlled rollout

Deploy reviewed immutable artifacts, apply the approved schema plan, register targets, check readiness and promote deliberately. Observe clinical workflows and deny unexpected access before opening broader traffic. Preserve a rollback path compatible with the schema changes. Avoid unreviewed emergency edits directly on instances.

## Recovery exercise

If a Media instance fails, remove or drain it according to the incident and deployment policy, preserve necessary evidence, replace it with the approved image and verify membership/exam authorization before returning it to service. A replacement instance should recover from durable storage and secrets rather than copied local uploads or handwritten configuration.

If a credential is compromised, containment and revocation come before casually restoring the same instance image with the same secret. Coordinate Gait/session response and AWS service-role response according to which authority was affected.

## Release decision

Proceed only when required technical evidence and applicable organizational/vendor approvals are complete. This handbook describes a design and proposed checks, not approval to process real clinical data or a claim of compliance.

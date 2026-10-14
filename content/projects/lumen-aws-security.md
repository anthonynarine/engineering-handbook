<!-- content/projects/lumen-aws-security.md — Lumen source context and explicitly proposed AWS design. -->
---
title: "Lumen AWS security plan"
slug: "lumen-aws-security"
summary: "Proposed controls for accounts, private networking, Gait identity, clinical data and operational recovery."
section: "projects"
order: 78
tags: ["lumen", "aws", "ec2", "gait", "security", "planned architecture"]
status: "proposed-design"
lastReviewed: "2026-10-13"
sources: ["reference_sources/lumen-inspection.md", "reference_sources/aws-design.md"]
related: ["lumen-aws-architecture", "lumen-aws-release", "gait-auth-walkthrough"]
---

## Security target and scope

This is the proposed security baseline for Lumen's AWS deployment, not a security certification or an implemented control inventory. It follows a layered approach: assume a stolen user session, a compromised application instance, an operator mistake and a failed external dependency are all possible. Limit each one's authority and preserve evidence.

Lumen handles sensitive clinical information. Use synthetic data until infrastructure, application controls and organizational/vendor approvals have been independently checked. Gait and AWS services do not, by themselves, establish regulatory compliance. The [AWS Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html) provides the broader review framework.

## 1. Separate accounts and administrative authority

Separate production from development/test accounts and data. Use an organizational security/logging boundary where practical. Protect the root identity, avoid root access keys and use federated short-lived operator sessions with MFA. Define least-privilege deploy, read-only, incident-response and database-migration roles. Require explicit approval for production changes and restrict who can change IAM, keys, logs and backups.

The build role should publish reviewed artifacts; it should not inherit unrestricted clinical database access. Foundry agents receive scoped development authority, not standing production credentials. Use CI federation to obtain short-lived AWS credentials rather than storing long-lived access keys in the repository. See [AWS IAM recommendations](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html).

## 2. Public edge, private services

Attach a WAF policy to the ALB, tune managed and application-specific rules with representative synthetic requests, and add rate controls for login, expensive actions and uploads. WAF reduces some edge threats; it does not validate clinical permissions or make an uploaded file safe. Avoid blanket body-size or inspection assumptions for large medical media. See [AWS WAF web ACLs](https://docs.aws.amazon.com/waf/latest/developerguide/web-acl.html).

Proposed network rule matrix:

| Destination | Allowed source | Allowed purpose |
| --- | --- | --- |
| ALB listener | Intended clients, HTTPS 443 | Public application ingress; optionally HTTP only to redirect |
| UI instance service port | ALB security group | Static delivery and selected proxy routes |
| Reports service port | ALB group and explicitly approved internal callers | Clinical API only |
| Media service port | ALB group and approved proxy callers | Media API only |
| PostgreSQL port | Reports and Media groups only | Separate restricted database roles |
| Cache/broker, if introduced | Specific producer/consumer groups | Authenticated encrypted application use |
| AWS interface endpoints | Approved application groups on HTTPS | Only required service APIs |
| SSH/RDP | None | Use controlled Session Manager access |

Avoid broad VPC-CIDR grants, a shared all-services security group and unrestricted lateral traffic. UI has no database permission. Media receives no clinical write authority merely because it can read authorization facts. Block unnecessary public IPv4 and IPv6 paths.

Restrict egress to required service endpoints, Gait and approved providers. NAT supplies outbound connectivity; it is not a destination allowlist. Security groups do not implement hostname-based filtering: use a controlled egress proxy/firewall or a well-defined network design where domain restrictions are required. Use [VPC endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-aws-services.html) and endpoint policies for supported AWS APIs, with DNS/routing and service-specific access reviewed.

## 3. Harden each EC2 role

Use reviewed, patched images and immutable replacement deployments. Run application processes without root privileges, encrypt EBS volumes, restrict attached instance profiles and require [IMDSv2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html). Test the metadata hop policy with the actual container layout rather than choosing it blindly.

Use [Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html) with narrow operator roles, session limits and encrypted audit destinations instead of public SSH. Command-content recording is not available for SSH/port-forwarding sessions; restrict those modes rather than claiming they provide a full command transcript. Emergency access needs time bounds, approval and post-event review.

Build once, scan dependencies/images, record the artifact digest and deploy that exact candidate. Configure rollback without destructive automatic database reversal. No secrets in AMIs, build arguments, frontend bundles, user-data output or container images.

## 4. Gait identity plus local clinical permissions

Require MFA and recent-authentication evidence for privileged clinical/organization administration according to the approved Gait integration policy. Enforce that policy in the backend, not just a browser prompt; verify which endpoints and SDK versions actually support it before enabling those operations.

Verify credentials in each application service through its tested integration. Validate intended issuer/audience and session semantics for the configured mode. Preserve the distinction between invalid identity, insufficient domain permission and an unavailable authority. Fail required verification closed; neither a network outage nor a successful health probe can authorize access.

Resolve organization from the requested scope, then verify current membership, role and facility/exam policy. Scope records before lookup. Preserve tenant-aware query keys and cancel/clear private UI data when identity or organization changes. Recheck sensitive actions according to an explicit live-session policy, plus operation-specific authorization.

Verify CSRF protection for cookie-authenticated writes, exact origins for cross-origin browser calls and deliberate trusted-proxy handling. Do not trust arbitrary forwarded identity, IP or organization headers from the public client. Keep login/refresh behavior consistent between production UI builds and all API adapters.

## 5. Encrypt and constrain data access

Use private RDS networking, encrypted database storage and backups, verified TLS connections and separate application/migrator/owner roles. Never give web processes database-superuser or unrestricted RLS-bypass authority. Preserve transaction-local tenant context and test connection-pool reuse between tenants. Follow [RDS TLS configuration](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html).

Enable S3 Block Public Access at the intended account/bucket boundaries and use policies that deny insecure transport. Use narrowly scoped instance roles, explicit encryption/key policies and opaque object keys. A private bucket still requires application authorization before access or URL issuance. Presigned links remain bearer capabilities until their effective expiration or applicable policy change; set a deliberate lifetime. See [S3 public-access controls](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html).

Use [Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html) with per-service secret access, rotation and reload/recovery procedures. Restrict KMS decrypt authority as carefully as secret retrieval. Rotating a database credential without updating the running clients is an outage, not a completed control.

## 6. Clinical media and AI boundaries

Apply size/type limits, safe parsing and quarantine/scanning policies appropriate to the actual upload formats. Verify authorization before presigning, listing or downloading media. Redact clinical identifiers from object names, URLs and operational logs; protect the underlying clinical record and required audit history separately.

No clinical payload goes to a future external AI provider by default. AI remains disabled until permitted data classes, approved vendors, access policy, retention and evaluation are explicitly resolved. Never let generated text grant access, modify deterministic measurements or finalize a clinical record without the authorized workflow.

## 7. Evidence, alerting and incident response

Use CloudTrail for AWS control-plane activity with deliberate coverage and a protected logging destination. S3 object data events require explicit selection and cost/volume planning; they are not guaranteed by default trail creation. CloudWatch application telemetry and Lumen's clinical access/change audit are separate layers. [CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html) does not substitute for a patient-record access trail.

Collect redacted application events, deploy identities, infrastructure changes and security alarms. Avoid credentials, patient identifiers and signed URLs in logs. ALB/WAF logs can themselves contain sensitive request metadata; restrict their contents where supported and strictly control storage/access/retention. Retain required evidence under an approved policy instead of choosing arbitrary durations here.

Alert on unexpected administrative access, public exposure, suspicious identity failures, disabled logging, denied storage access, unhealthy targets and backup failures. Assign an owner and runbook to each actionable alarm. Plan isolation of a compromised instance, credential revocation, evidence preservation, replacement deployment and communication.

## 8. Recovery and availability

Use multiple instances/AZs for critical service tiers and a recommended Multi-AZ database configuration where the availability requirement justifies it. Multi-AZ improves availability but is not a backup. Define acceptable recovery time and data loss, retain protected database/object backups and test restoration into an isolated environment. Consider account-separated copies and deletion-resistant policies where required by the threat model.

Test the complete authorization state after recovery: clinical rows, media references, organization/facility membership, RLS policies and service grants. Do not reopen the application simply because the database accepts connections. The [release gate chapter](/guide/lumen-aws-release) records the checks that turn this design into reviewable evidence.

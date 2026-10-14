<!-- content/deployment/troubleshoot-alb.md — Symptom-led investigation and verification guidance. -->
---
title: "Troubleshoot: ALB errors and unhealthy targets"
slug: "troubleshoot-alb"
summary: "Separate load-balancer failures from target application responses and permission denials."
section: "deployment"
order: 82
tags: ["troubleshooting", "diagnosis", "failure", "verification"]
status: "established-pattern"
lastReviewed: "2026-10-14"
sources: ["reference_sources/troubleshooting.md"]
related: ["lumen-aws-architecture", "lumen-aws-security", "lumen-aws-release"]
---

## Symptom and scope

An AWS-hosted application returns 502/503/504, a target is unhealthy, or only one service hostname fails. This is a diagnostic reference for the **planned Lumen AWS architecture**, not a record of a live incident or a deployed ALB.

## 1. Identify which layer generated the response

Compare the request's host/path and time window with approved ALB access-log fields, target status and application correlation evidence. An application-generated error and an ALB-generated error can have the same visible status but different causes. Keep sensitive request metadata out of shared notes.

The [AWS ALB troubleshooting reference](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-troubleshooting.html) is the upstream source for service-specific failure causes. A gateway status is a starting signal, not a diagnosis.

## 2. Inspect the target path

Check the listener rule, target group, protocol, port and registered target. Compare readiness behavior with process liveness. Inspect service binding, target security group, ALB egress and network routing. A target can serve its root page while its real API dependency is unavailable.

```bash
# Read-only AWS CLI example — substitute an authorized account's identifiers and region.
aws elbv2 describe-target-health   --target-group-arn '<target-group-arn>'   --region '<aws-region>'   --query 'TargetHealthDescriptions[].{State:TargetHealth.State,Reason:TargetHealth.Reason}'
```

The placeholders are intentional. This command is not executed by the handbook and does not repair anything.

## 3. Investigate the matching evidence

| Evidence | Investigation |
| --- | --- |
| No targets registered | Deployment registration and intended target group |
| Health-check mismatch | Actual path, host handling, matcher and dependencies |
| Target connection failure | Service listener, protocol/port and narrowly scoped network rules |
| Request times out | Application/dependency timing and configured timeout relationship |
| Only one host/path fails | Listener priority, forwarding and backend URL contract |
| Target returns an authorization error | Application/Gait policy, not automatic load-balancer failure |

ALB routing can fail open when all targets are unhealthy; service authorization must still hold. HTTPS target groups also do not establish backend certificate validation. See the [planned topology](/guide/lumen-aws-architecture).

## Verify without opening the perimeter

Correct the demonstrated cause, then check the original authorized request, a denied application request and a deliberately unregistered/unmatched route. Keep EC2 and database services private. During a rollout, verify target draining and retry/idempotency behavior before repeating a clinical write. Record any actual AWS validation separately from this proposed design.

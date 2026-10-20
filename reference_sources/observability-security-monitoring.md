# Observability and security monitoring — source notes

Recorded 2026-10-20 for the handbook guide `observability-and-security-monitoring`.

## Owner design discussion (Moneta with a Foundry Orchestrator)

- Observability is the broad practice of understanding what a system is doing. Security monitoring uses some of the same evidence to detect threats. They overlap but have different responsibilities.
- Three areas: application operations (is the app working?), product and data health (are results useful and accurate?), security monitoring (is access legitimate and are protections working?). The first two belong to Moneta; the third belongs to Gait using evidence Moneta supplies.
- Logs, metrics and traces are shared building blocks. Operational tools receive what is needed to diagnose reliability; Gait receives the subset needed to assess security.
- Gait scope: authentication, MFA, sessions, access-control violations; changes to credentials, privileges and security configuration; security-relevant suspicious behavior; findings, security evidence freshness and security alerts.
- Moneta operations scope: availability, latency, application errors, resource usage; Plaid connection health, sync progress, retries, data freshness; scheduled-job execution and backup success; AI request failures, latency and cost.
- AI attempts to reach another household's data are security scope. Ordinary model latency and spending are operations scope.
- Gait is not a destination for every log or a general debugging platform. It accepts deliberately defined security events with minimal sensitive information.
- Moneta enforces security; Gait observes and evaluates it. Gait being unavailable must never cause Moneta to skip permissions or expose financial data.

## Inspected facts

- Gait SDK `security_signals` documentation (SDK4 milestone): `send_security_signal()` is write-only. It authenticates with the existing application credential, takes `signal_type` from Gait's approved registry, `result` (PASS, FAIL, WARNING, INFORMATIONAL), a required `source_reference` idempotency key and a bounded JSON payload. Gait derives organization, environment, application, trust level and control mapping; signals are always recorded as customer-reported evidence. Every failure raises; unreachable Gait raises `AuthServiceUnavailable`. No automatic instrumentation and no findings retrieval in the SDK.
- Moneta implementation status (2026-10-17): Gait configuration self-check reporting exists, dry-run by default, sending disabled pending credential confirmation. No live Gait evidence or continuous monitoring is claimed.

## Standards reviewed (2026-10-20)

- OWASP Top 10:2025 A09 "Security Logging and Alerting Failures" (renamed from 2021 to emphasize alerting); mapped CWEs 117, 532, 778. https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures
- OWASP ASVS 5.0.0 (May 2025) chapter V16 Security Logging and Error Handling: V16.1 Security Logging Documentation, V16.2 General Logging, V16.3 Security Events, V16.4 Log Protection, V16.5 Error Handling. Section titles confirmed via the OWASP Cheat Sheet ASVS index.
- OWASP Logging Cheat Sheet and Logging Vocabulary Cheat Sheet.
- NIST CSF 2.0 Detect function: DE.CM Continuous Monitoring, DE.AE Adverse Event Analysis.
- NIST SP 800-61 Rev. 3 (final, April 2025): incident response as a CSF 2.0 community profile.
- NIST SP 800-92 (2006) final; SP 800-92 Rev. 1 initial public draft (October 2023), NIST still addressing comments.
- NIST SP 800-53 Rev. 5 AU family and SI-4 System Monitoring, as reference vocabulary.
- OpenTelemetry graduated from CNCF in May 2026; traces, metrics and logs are GA. Semantic convention stability varies per convention.
- W3C Trace Context (Level 1 Recommendation); Level 2 remains a Candidate Recommendation draft.

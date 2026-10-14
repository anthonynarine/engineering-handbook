<!-- content/walkthrough/reports-verification.md — Teach one stage of the synthetic Reports feature. -->
---
title: "05 · Prove the boundaries and break the happy path"
slug: reports-verification
section: walkthrough
summary: "Use negative tests and the interactive lab to separate plausible design from verified behavior."
order: 23
tags: [reports, walkthrough, django, react, foundry, tenant, implementation]
status: proposed-design
lastReviewed: "2026-10-12"
sources: [reference_sources/reports-walkthrough.md, reference_sources/estateiq-inspection.md, reference_sources/foundry-inspection.md]
related: [reports-react, reports-release]
---

## Keep evidence attached to its implementation

The handbook's browser checks exercise the synthetic Reports lab. They do not prove that Django permissions, PostgreSQL uniqueness, JWT verification, or a deployment work. The Python test below is reference code for the separate backend application; run it there before declaring the feature verified.

## Start with API behavior

```python
# apps/reports/tests/test_api.py — Reference checks for scope and command replay.
import uuid
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from apps.organizations.models import Organization, Membership
from apps.reports.models import Report


class ReportsApiTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="editor")
        self.north = Organization.objects.create(slug="north", name="North")
        self.south = Organization.objects.create(slug="south", name="South")
        self.member = Membership.objects.create(
            organization=self.north, user=self.user, role="editor", active=True
        )
        self.foreign = Report.objects.create(
            organization=self.south, created_by=self.user,
            creation_key=uuid.uuid4(), title="South private draft"
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.client.credentials(HTTP_X_ORG_SLUG="north")
        self.command = {"title": "Quarterly review", "creationKey": str(uuid.uuid4())}

    def test_replay_converges_and_conflicting_payload_is_rejected(self):
        first = self.client.post("/api/v1/reports/", self.command, format="json")
        replay = self.client.post("/api/v1/reports/", self.command, format="json")
        conflict = self.client.post("/api/v1/reports/", {
            **self.command, "title": "Changed title"
        }, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(replay.status_code, 200)
        self.assertEqual(first.data["id"], replay.data["id"])
        self.assertEqual(conflict.status_code, 409)
        self.assertEqual(Report.objects.filter(organization=self.north).count(), 1)

    def test_foreign_object_and_list_are_scoped(self):
        detail = self.client.get(f"/api/v1/reports/{self.foreign.id}/")
        listing = self.client.get("/api/v1/reports/")
        self.assertEqual(detail.status_code, 404)
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.data["count"], 0)
        self.assertEqual(listing.data["results"], [])

    def test_viewer_reads_but_cannot_create(self):
        self.member.role = "viewer"
        self.member.save(update_fields=["role"])
        self.assertEqual(self.client.get("/api/v1/reports/").status_code, 200)
        denied = self.client.post("/api/v1/reports/", self.command, format="json")
        self.assertEqual(denied.status_code, 403)

    def test_revoked_membership_denies_list_and_replay(self):
        self.client.post("/api/v1/reports/", self.command, format="json")
        self.member.active = False
        self.member.save(update_fields=["active"])
        self.assertEqual(self.client.get("/api/v1/reports/").status_code, 403)
        replay = self.client.post("/api/v1/reports/", self.command, format="json")
        self.assertEqual(replay.status_code, 403)
```

Adapt the fixture for a custom user model. `force_authenticate` bypasses actual token verification; add real valid/expired/malformed JWT tests against the configured authenticator. DRF distinguishes test authentication shortcuts from exercising credentials. [DRF testing documentation](https://www.django-rest-framework.org/api-guide/testing/).

## Add the tests the snippet cannot prove

| Risk | Required backend evidence |
| --- | --- |
| Competing retries | PostgreSQL transaction test with separate connections and the same command; exactly one row and same result ID |
| User changes | Different actors in one tenant have independent command identities |
| Invalid input | Blank/long title and invalid UUID return 400 without inserting |
| Membership nomination | Existing foreign slug and absent slug fail without revealing objects |
| Pagination | Scope applies to count and every page; stable ordering on equal timestamps |
| Auth boundary | Real JWT tests, expiration, refresh policy, and configured 401 contract |
| Revocation race | Command and membership update behavior tested under the chosen transaction policy |

A sequential replay test is useful, but cannot prove concurrency. A SQLite test pass does not substitute for the PostgreSQL transaction test. Attach actual output to the Foundry review evidence.

## Run the browser failure drills

Open the [Reports lab](/lab/reports). It resets on reload and sends no network requests.

1. As North editor, create a draft. The scoped list gains one record.
2. Retry the same command. The response is a simulated 200 replay and the count stays the same.
3. Reuse that key with a changed title. The simulated result is 409.
4. Reset, enable “Lose the response after commit,” and create. A row exists despite the simulated 503. Retry recovers it without a duplicate.
5. Change to South. North reports and selected detail disappear; pending command is cleared.
6. Become a viewer and submit. The simulated write returns 403. Reads still work.
7. Try another tenant's report ID. The simulated result is 404 after membership.
8. Remove membership. The list clears and object access is denied with 403.

The lab models these outcomes in memory. It is deliberately inspectable teaching code, not an authorization boundary.

## Make failure understandable

A real workspace needs actionable errors: invalid title near the input, forbidden action without stale protected details, and uncertain outcome beside the retained retry action. Keep a failed refresh distinct from a failed write; a committed report does not become uncreated because list refresh failed.

Capture operation, tenant identifier, actor identifier, creation key, status, duration, and correlation ID in real observability. Never log JWTs, full document contents, or unredacted customer payloads. The lab trace contains only synthetic inputs.

## Checkpoint

Use a verification ledger with three separate lines: reference reviewed, browser simulation passed, backend integration pending. Continue to [release and extensions](/guide/reports-release).

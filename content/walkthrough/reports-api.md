<!-- content/walkthrough/reports-api.md — Teach one stage of the synthetic Reports feature. -->
---
title: "03 · Enforce the contract in Django"
slug: reports-api
section: walkthrough
summary: "Resolve membership, scope selectors, authorize writes, and return a predictable API."
order: 21
tags: [reports, walkthrough, django, react, foundry, tenant, implementation]
status: proposed-design
lastReviewed: "2026-10-12"
sources: [reference_sources/reports-walkthrough.md, reference_sources/estateiq-inspection.md, reference_sources/foundry-inspection.md]
related: [reports-data, reports-react]
---

## Resolve scope after authentication

These files belong in the separate backend application described in chapter two. An authenticated user and a nominated slug are inputs; an active membership is the verified scope.

```python
# apps/reports/selectors.py — Resolve membership and keep reads tenant-scoped.
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from apps.organizations.models import Membership
from .models import Report


def request_membership(request):
    membership = Membership.objects.select_related("organization").filter(
        organization__slug=request.headers.get("X-Org-Slug", ""),
        user=request.user,
        active=True,
    ).first()
    if membership is None:
        raise PermissionDenied("Active membership required.")
    return membership


def report_list(*, organization):
    return Report.objects.filter(organization=organization).order_by(
        "-created_at", "-id"
    )


def report_detail(*, organization, report_id):
    return get_object_or_404(report_list(organization=organization), pk=report_id)
```

The view's authentication and permission phase runs before these helpers. Avoid calling `request_membership` from unauthenticated middleware. A foreign UUID yields the same 404 as an absent UUID after membership has been established.

## Put the write rule in a service

```python
# apps/reports/services.py — Authorize and converge repeated create commands.
from django.db import transaction
from rest_framework.exceptions import APIException, PermissionDenied
from apps.organizations.models import Membership
from .models import Report


class CreationConflict(APIException):
    status_code = 409
    default_detail = "Creation key already used with a different title."


@transaction.atomic
def create_report(*, membership, title, creation_key):
    # Re-read inside the command rather than trusting a stale scope object.
    current = Membership.objects.select_for_update().filter(pk=membership.pk).first()
    if current is None or not current.active or current.role != Membership.Role.EDITOR:
        raise PermissionDenied("Active editor membership required.")
    normalized_title = title.strip()
    report, created = Report.objects.get_or_create(
        organization_id=current.organization_id,
        created_by_id=current.user_id,
        creation_key=creation_key,
        defaults={"title": normalized_title},
    )
    if report.title != normalized_title:
        raise CreationConflict()
    return report, created
```

This service assumes validated input and a membership resolved for the actor. Jobs and management commands must supply an equally trusted scope and validate their inputs. The membership row lock serializes commands by that member; that tradeoff is acceptable for this small example, but deserves a throughput review for a real workload. It also coordinates with normal transactional updates to that membership row. Broader organization suspension rules are outside this slice.

## Keep serializers at the transport boundary

```python
# apps/reports/serializers.py — Map the agreed camelCase wire contract.
from rest_framework import serializers
from .models import Report


class CreateReportInput(serializers.Serializer):
    title = serializers.CharField(max_length=120, trim_whitespace=True)
    creationKey = serializers.UUIDField()


class ReportOutput(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Report
        fields = ["id", "title", "status", "createdAt"]
        read_only_fields = fields
```

DRF serializers validate incoming data before the view reads `validated_data`. Serialization does not authorize a tenant or action. [DRF serializer documentation](https://www.django-rest-framework.org/api-guide/serializers/).

## Compose views and pagination

```python
# apps/reports/views.py — Connect identity, scope, validation, and domain work.
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from .selectors import request_membership, report_list, report_detail
from .serializers import CreateReportInput, ReportOutput
from .services import create_report


class ReportsPagination(LimitOffsetPagination):
    default_limit = 20
    max_limit = 100


class ReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = request_membership(request)
        paginator = ReportsPagination()
        rows = paginator.paginate_queryset(
            report_list(organization=scope.organization), request, view=self
        )
        return paginator.get_paginated_response(ReportOutput(rows, many=True).data)

    def post(self, request):
        scope = request_membership(request)
        command = CreateReportInput(data=request.data)
        command.is_valid(raise_exception=True)
        report, created = create_report(
            membership=scope,
            title=command.validated_data["title"],
            creation_key=command.validated_data["creationKey"],
        )
        return Response(ReportOutput(report).data, status=201 if created else 200)


class ReportDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, report_id):
        scope = request_membership(request)
        report = report_detail(organization=scope.organization, report_id=report_id)
        return Response(ReportOutput(report).data)
```

```python
# apps/reports/urls.py — Feature-owned API routes.
from django.urls import path
from .views import ReportsView, ReportDetailView

urlpatterns = [
    path("", ReportsView.as_view(), name="reports-list"),
    path("<uuid:report_id>/", ReportDetailView.as_view(), name="reports-detail"),
]
```

Include these routes at `path("api/v1/reports/", include("apps.reports.urls"))` in the project's URL configuration. Configure the chosen JWT authenticator in DRF settings in the separate application. `IsAuthenticated` alone does not issue or verify JWTs. APIView coordinates authentication, permissions, and recognized API exceptions; do not wrap everything in a blanket success response. [DRF APIView documentation](https://www.django-rest-framework.org/api-guide/views/).

## Checkpoint

A list, detail, and write each pass through verified scope. Write permission is rechecked in the service, and replay identity has a database constraint. Backend execution remains pending until the separate repository runs its tests. Continue to [React and cache ownership](/guide/reports-react).

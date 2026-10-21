<!-- content/finance/stripe-webhooks-and-subscriptions.md — Teach verified Stripe webhooks and turning subscription status into access. -->
---
title: "Stripe webhooks and subscriptions: turning payments into access"
slug: stripe-webhooks-and-subscriptions
section: finance
summary: "Verify Stripe events, survive duplicates and out-of-order delivery, and map each subscription status to the right access decision."
order: 6
tags: [finance, stripe, webhooks, subscriptions, billing, idempotency, signatures, entitlements, api versions, dj-stripe, concepts, education]
status: established-pattern
lastReviewed: "2026-10-21"
sources: [reference_sources/financial-libraries-review.md]
related: [financial-libraries, stripe-fundamentals, subscriptions-and-feature-gates, reliable-job-lifecycle, observability-and-security-monitoring]
lesson:
  level: Intermediate
  duration: 75 minutes
  prerequisites: [stripe-fundamentals, reliable-job-lifecycle]
  objectives:
    - Verify a Stripe webhook signature using the raw request body
    - Handle duplicate and out-of-order events safely
    - Map every subscription status to a clear access decision
    - Reconcile your records with Stripe when events are missed
    - Upgrade Stripe API versions without silently breaking handlers
---

## Why this matters

In lesson 4 you learned the success page isn't proof of payment. So what is? **Webhook events**: messages Stripe sends your server whenever something happens, like a subscription starting, an invoice being paid, or a card being declined.

Billing happens on Stripe's schedule, not your users'. A renewal succeeds at 3 a.m. A card expires mid-month. A customer cancels in the Customer Portal. Webhooks are how your app finds out, and how EstateIQ decides whether an organization gets Pro features today.

## The big idea

Think of webhooks as **certified mail from your bank**. Before acting on a letter, you check the seal is real. You're not surprised if one letter arrives twice, or if October's statement arrives after November's. And the letter is a notice: when in doubt about your balance, you check the account itself.

Those three habits are this whole lesson:

1. **Check the seal**: verify every webhook's signature.
2. **Expect duplicates and disorder**: make handling idempotent and order-independent.
3. **Treat Stripe as the source of truth**: when in doubt, read the current state from Stripe.

## Habit 1: check the seal

Stripe signs every webhook using your endpoint's signing secret (`whsec_…`). The signature arrives in the **`Stripe-Signature`** header, along with a timestamp. Stripe's library recomputes the signature over the **raw request body** and compares. Its default tolerance rejects events whose timestamp is more than 5 minutes off, which blocks replays of old captured requests.

Two Django-specific details trip people up:

- **Use `request.body`, the raw bytes.** If you parse the JSON and re-serialize it, even one changed space breaks the signature.
- **Exempt the webhook route from CSRF.** Stripe can't send your CSRF token. That's safe *because* the signature check replaces it. Never exempt a route without one.

## Habit 2: expect duplicates and disorder

Stripe retries any delivery that doesn't get a `2xx` response, for up to three days in live mode. Even successful deliveries can occasionally arrive twice. And Stripe says plainly that event order isn't guaranteed: `invoice.paid` may arrive before `customer.subscription.created`.

So:

- **Record each event ID you've processed**, with a unique constraint, and skip repeats.
- **Write handlers as upserts of current state**, not as "add one month." EstateIQ's handlers follow this: they read the subscription's status and write it, so running twice gives the same result.
- **Don't depend on order.** If an event refers to something you haven't seen yet, fetch it from Stripe. EstateIQ does this when a subscription event arrives before its local dj-stripe mirror exists.

**Pause and check:** an older `customer.subscription.updated` event saying `past_due` arrives after a newer one saying `active`. If your handler writes the event's status directly, what happens? (The organization is wrongly downgraded. That's why order-sensitive handlers should re-read the subscription from Stripe instead of trusting the event payload's snapshot.)

## Habit 3: Stripe owns the truth

For billing, Stripe is authoritative: it knows whether an invoice was paid. Your database holds a **mirror** of the parts you need for fast access checks, such as plan, status and period end. Mirrors drift when events are missed, so add a **reconciliation job**: periodically compare each organization's local status with Stripe's and fix differences. Treat any mismatch as a bug worth investigating.

## From status to access

Every subscription has a status. Your most important design decision is what each one means for access. Here's a mapping based on Stripe's definitions:

| Status | What it means | Access decision |
| --- | --- | --- |
| `trialing` | In a free trial | Grant |
| `active` | In good standing | Grant |
| `incomplete` | First payment not yet completed (up to 23 hours) | Don't grant yet |
| `incomplete_expired` | First payment never completed | No access; they need a new subscription |
| `past_due` | Latest payment failed; Stripe may retry | Grace period, then restrict. EstateIQ uses a configured number of grace days. |
| `unpaid` | Retries exhausted; invoices remain open | Revoke |
| `canceled` | Ended | Revoke; fall back to the free plan |
| `paused` | Trial ended without a payment method | Revoke until resumed |

Two good practices sit around this table. First, **never delete data on downgrade**: EstateIQ moves a canceled organization to Free and keeps its data, so paying again restores everything. Second, put the mapping in **one function** that every access check uses, so the rules live in one place. Stripe's **entitlements** feature is an alternative where Stripe tracks which features each customer has.

The events to listen for:

- `checkout.session.completed`: the customer finished checkout.
- `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`: status and plan changes.
- `invoice.paid`: a renewal succeeded.
- `invoice.payment_failed`: a payment failed. Tell the customer.

## A real lesson in API versions

Stripe evolves its API in dated versions, and your webhook events are shaped by your account's (or endpoint's) version. Here's a real example from your own code.

EstateIQ's handler stores the period end like this:

```python
"current_period_end": _parse_timestamp(stripe_subscription.get("current_period_end")),
```

In API version **2025-03-31.basil**, Stripe **removed** `current_period_end` from the Subscription object and moved it onto each **subscription item**. EstateIQ uses `stripe==11.3.0`, which predates that version, so today the field is present. But after an upgrade, `.get("current_period_end")` would quietly return `None`, with no error and no crash, and the organization's period end would be blank.

The version-safe read looks like this:

```python
items = stripe_subscription["items"]["data"]
period_end = items[0].get("current_period_end") if items else None
period_end = period_end or stripe_subscription.get("current_period_end")
```

The lessons generalize: **read the changelog before upgrading**, prefer `[...]` over `.get()` for fields you truly require (so a missing field fails loudly in tests), and test webhook handlers against fixtures from the version you're moving to.

## Modern patterns

**Acknowledge fast, process in the background.** Verify, record the event, enqueue a job, and return `200`, all in milliseconds. Stripe recommends this explicitly; a burst of renewals at the start of a month can otherwise overwhelm your servers.

**Event record and job in one transaction.** Save the event ID and enqueue the job atomically (the [outbox pattern](/guide/reliable-job-lifecycle)), so you never mark an event processed without the work being queued.

**Subscribe only to events you handle.** Fewer events, less load, less surface.

**Thin events for new integrations.** Stripe now recommends "thin" events for new integrations: small notifications that tell you *what* changed, after which you fetch the current object. It's habit 3 built into the format.

**Test locally with the Stripe CLI.** `stripe listen --forward-to localhost:8000/billing/webhook/` forwards test events to your laptop, and `stripe trigger invoice.payment_failed` fires specific scenarios on demand.

**Monitor billing health.** Alert on webhook failures, reconciliation mismatches and spikes in failed payments. Those alerts need an owner, as in [observability](/guide/observability-and-security-monitoring).

**Libraries like dj-stripe.** EstateIQ uses dj-stripe to mirror Stripe objects into Django models. It handles a lot, but your access rules and idempotency are still your responsibility.

## Mistakes to avoid

- **Skipping signature verification**, or verifying a re-serialized body.
- **Exempting the route from CSRF without verifying signatures.**
- **Slow work inside the webhook request**, causing timeouts and redeliveries.
- **Assuming events arrive once and in order.**
- **Granting access from the success page or the browser.**
- **Deleting a customer's data when they downgrade.**
- **Upgrading the API version without checking handlers** against the changelog.

## Let's build it

**Step 1: a verified, fast webhook view.**

```python
import stripe
from django.db import IntegrityError, transaction
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

@csrf_exempt  # Safe only because the signature is verified below
@require_POST
def stripe_webhook(request):
    try:
        event = stripe.Webhook.construct_event(
            request.body,
            request.headers.get("Stripe-Signature", ""),
            settings.STRIPE_WEBHOOK_SECRET,
        )
    except (ValueError, stripe.SignatureVerificationError):
        return HttpResponse(status=400)

    try:
        with transaction.atomic():
            ProcessedStripeEvent.objects.create(event_id=event["id"], type=event["type"])
            enqueue_job("process_stripe_event", event_id=event["id"])
    except IntegrityError:
        pass  # Already recorded: a duplicate delivery
    return HttpResponse(status=200)
```

`ProcessedStripeEvent.event_id` has a unique constraint. A duplicate delivery hits the constraint, and we still return `200` so Stripe stops retrying.

**Step 2: process by reading current state.**

```python
def process_stripe_event(event_id):
    event = stripe.Event.retrieve(event_id)
    if event["type"].startswith("customer.subscription."):
        subscription = stripe.Subscription.retrieve(event["data"]["object"]["id"])
        sync_org_subscription(subscription)
```

Because the job re-reads the subscription from Stripe, event order stops mattering. Whatever arrives last, you write the subscription's *current* state.

**Step 3: one place for access rules.**

```python
def has_paid_access(org_subscription) -> bool:
    if org_subscription.status in {"trialing", "active"}:
        return True
    if org_subscription.status == "past_due":
        return org_subscription.past_due_since + GRACE_PERIOD > timezone.now()
    return False
```

**Checkpoint:** use the Stripe CLI to send the same event twice; exactly one job runs. Send an invalid signature; the view returns `400`.

## Your turn

In test mode:

1. Implement the webhook view with signature verification and event deduplication.
2. Process subscription events by re-reading the subscription from Stripe.
3. Write `has_paid_access` and use it in every paid-feature check.
4. Add a nightly reconciliation job that compares local statuses with Stripe and logs mismatches.
5. Make your period-end read version-safe, and test it with a basil-shaped fixture.

**You're done when:** duplicate events run once, a forged event is rejected, `stripe trigger invoice.payment_failed` moves an organization into its grace period, and reconciliation reports no mismatches.

## Check your understanding

1. Why must signature verification use the raw request body?
2. Why is it safe to exempt the webhook route from CSRF?
3. How do you make a handler safe against duplicate deliveries?
4. Events can arrive out of order. What design makes that harmless?
5. Why would `stripe_subscription.get("current_period_end")` silently return `None` after an API upgrade?

## Answer key

1. The signature is computed over the exact bytes Stripe sent. Parsing and re-serializing can change whitespace or key order, so the recomputed signature wouldn't match.
2. CSRF protection stops browsers from being tricked into sending forged requests. Stripe isn't a browser, and the signature check proves the request came from Stripe, which is a stronger guarantee for this route.
3. Record each event ID under a unique constraint and skip repeats, and write handlers as upserts of current state, so running twice changes nothing.
4. Treat events as notifications and re-read the current object from Stripe before writing, so the latest truth wins regardless of arrival order.
5. API version 2025-03-31.basil moved `current_period_end` from the Subscription onto subscription items, and `.get()` returns `None` for a missing key instead of raising an error.

## Recap

- Webhooks are certified mail: check the seal, expect repeats and disorder, and verify with the source.
- Raw body plus signing secret; CSRF exemption only alongside verification.
- Record event IDs, enqueue work, return `200` fast.
- One function maps subscription status to access; downgrades never delete data.
- Read the changelog before upgrading API versions, and reconcile regularly.

That completes the Financial libraries course. Go back to the [course introduction](/guide/financial-libraries) to review the six shared rules; you've now seen every one of them in practice.

## Go deeper

- [Stripe: receive webhook events](https://docs.stripe.com/webhooks)
- [Stripe: how subscriptions work](https://docs.stripe.com/billing/subscriptions/overview)
- [Stripe changelog: subscription billing periods moved to items](https://docs.stripe.com/changelog/basil/2025-03-31/deprecate-subscription-current-period-start-and-end)

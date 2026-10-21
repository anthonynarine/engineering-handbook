<!-- content/finance/stripe-fundamentals.md — Teach Stripe's core objects, keys, Checkout and idempotent requests. -->
---
title: "How Stripe works: objects, keys, and Checkout"
slug: stripe-fundamentals
section: finance
summary: "Learn Stripe's core objects, which key goes where, how Checkout keeps card data off your servers, and why every payment request needs an idempotency key."
order: 5
tags: [finance, stripe, payments, checkout, payment intents, customers, prices, api keys, idempotency, pci, concepts, education]
status: established-pattern
lastReviewed: "2026-10-21"
sources: [reference_sources/financial-libraries-review.md]
related: [financial-libraries, stripe-webhooks-and-subscriptions, subscriptions-and-feature-gates, tenant-isolation, caching-and-rate-limiting]
lesson:
  level: Intermediate
  duration: 60 minutes
  prerequisites: [financial-libraries]
  objectives:
    - Name Stripe's core objects and how they relate
    - Put each kind of Stripe key in the right place, in the right mode
    - Start a subscription with Checkout, linked back to the right organization
    - Use idempotency keys so a retried request never charges twice
    - Explain why a success page is not proof of payment
---

## Why this matters

EstateIQ charges organizations for Starter and Pro plans. When that works, nobody thinks about it. When it doesn't, you get the worst kind of bug: a customer charged twice, a paying customer locked out, or a canceled customer still using paid features.

Stripe handles the hard parts of payments: cards, banks, fraud checks, receipts, retries. But it can only do its job if your app uses it correctly. This lesson covers the foundation, and [lesson 5](/guide/stripe-webhooks-and-subscriptions) covers keeping access in step with payments.

## The big idea

Think of Stripe as a **payment terminal you rent**, the card reader at a shop counter. The customer's card goes into the terminal, never into the shopkeeper's hands. The shopkeeper just learns "approved" or "declined."

That's the most important property of a good Stripe integration: **card numbers never touch your servers.** Stripe's hosted pages and frontend components collect them directly. That shrinks your security burden enormously, including your share of PCI compliance, the card industry's security standard.

## The objects you'll meet

Stripe models payments as a set of objects. You don't need all of them, but these come up constantly:

| Object | What it represents | EstateIQ example |
| --- | --- | --- |
| **Customer** | Someone you bill | One per organization |
| **Product** | What you sell | "EstateIQ Pro" |
| **Price** | How much and how often | $X per month, or per year |
| **Checkout Session** | A hosted payment page for one purchase | Upgrading to Pro |
| **Subscription** | An ongoing billing relationship | The organization's Pro plan |
| **Invoice** | A bill for one period | October's charge |
| **PaymentIntent** | One attempt to collect money | Charging October's invoice |
| **Event** | A record that something happened | `invoice.paid` |

Notice the split between Product and Price. The product is "Pro"; prices are "monthly" and "annual." Changing a price means creating a new Price object, so existing subscribers keep theirs until you move them.

**Pause and check:** EstateIQ adds a yearly option for Pro. New Product or new Price? (A new Price on the same Product.)

## Keys: which one goes where

Stripe gives you several kinds of keys, and putting one in the wrong place is a serious mistake:

| Key | Starts with | Where it lives | Can do |
| --- | --- | --- | --- |
| Publishable | `pk_` | Browser, safely | Start client-side flows only |
| Secret | `sk_` | Server only | Everything: charges, refunds, customer data |
| Restricted | `rk_` | Server only | Only the permissions you grant it |
| Webhook signing secret | `whsec_` | Server only | Verify that events came from Stripe |

Every one of these has a **test** and a **live** version (`sk_test_…` versus `sk_live_…`). Test mode moves no real money and uses test card numbers. EstateIQ's settings choose the secret key from a single `STRIPE_LIVE_MODE` switch, so code never hard-codes which mode it's in. That's the same "separate test and live completely" rule from the [course introduction](/guide/financial-libraries).

Prefer restricted keys for anything that doesn't need full power, such as a reporting script.

## Money in the smallest unit

Stripe counts money in the **smallest currency unit**: cents for US dollars. So `amount=1999` means $19.99. Integers avoid floating-point rounding entirely. Keep amounts as integers or `Decimal` all the way through your code, and only format them for display.

## Idempotency keys: never charge twice

Here's a scenario. Your server asks Stripe to create a subscription. The network drops before the response arrives. Did Stripe create it or not? You can't tell. Retry, and you might create a second one. Don't retry, and you might have created nothing.

**Idempotency keys** solve this. You send a unique key with the request (the `Idempotency-Key` header, or `idempotency_key=` in the Python library). If Stripe sees the same key again, it returns the saved result of the first request instead of doing the work again. Retrying becomes completely safe.

A few rules: use a random, unique value per logical operation (a UUID works), never put personal data in it, and reuse the exact same parameters on retry. Stripe rejects a reused key with different parameters, which protects you from bugs. Keys can be forgotten after 24 hours, so retries belong within that window.

## Checkout: the hosted payment page

For subscriptions, the simplest safe path is **Stripe Checkout**: you create a Checkout Session on your server, send the customer to Stripe's hosted page, and Stripe handles card entry, authentication, taxes if configured, and receipts.

Two parts of the session matter most for you:

- **Linking back to your data.** Stripe doesn't know what an EstateIQ organization is. You tell it, by putting your organization's ID in the subscription's `metadata`. When events come back later, that metadata is how you find the right organization. EstateIQ does exactly this.
- **The success URL.** After paying, the customer returns to your success page.

Now the critical lesson: **the success page is not proof of payment.** A user can visit that URL directly, close the tab before arriving, or arrive before the payment has fully settled. Grant access from verified **webhook events**, never from the redirect. That's [lesson 5](/guide/stripe-webhooks-and-subscriptions).

**Pause and check:** a customer reaches `/billing/success`. Should the page immediately upgrade their organization? (No. It should show "Payment received, activating your plan…" and let webhook processing do the upgrade.)

## Modern patterns

**Hosted or embedded Stripe UI for card entry.** Checkout or Stripe's Payment Element keep card data off your servers.

**One Customer per tenant, created once.** Store the Stripe customer ID on your organization and reuse it, so all of an organization's billing history stays together.

**The Customer Portal for self-service.** Let customers update cards, change plans and cancel on a Stripe-hosted page instead of building those screens yourself.

**Idempotency keys on every write**, tied to your own operation, such as a checkout attempt ID.

**Pin and upgrade your API version deliberately.** Stripe's API changes in dated versions. Know which one your account and SDK use, read the changelog before upgrading, and test. Lesson 5 shows a real example of why.

**Configuration-driven prices.** Keep Price IDs in settings, as EstateIQ does, rather than scattered through code.

## Mistakes to avoid

- **A secret key in frontend code**, or committed to Git.
- **Test and live keys mixed**, such as a live secret with a test webhook secret.
- **Granting access on the success page** instead of from verified events.
- **Retrying payment requests without idempotency keys.**
- **Floats for money.** Use integer minor units or `Decimal`.
- **No metadata linking the subscription to your tenant**, leaving events you can't route.
- **Building card forms yourself.** It widens your PCI scope for no benefit.

## Let's build it

**Step 1: create a Checkout Session for an upgrade.**

```python
import stripe

def start_upgrade(org, price_id, attempt_id):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=org.stripe_customer_id,
        line_items=[{"price": price_id, "quantity": 1}],
        client_reference_id=str(org.id),
        subscription_data={"metadata": {"organization_id": str(org.id)}},
        success_url=f"{settings.APP_URL}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.APP_URL}/billing",
        idempotency_key=f"checkout-{attempt_id}",
    )
    return session.url
```

Let's read it:

- `mode="subscription"` makes Checkout set up recurring billing.
- `customer` reuses the organization's existing Stripe customer.
- `subscription_data.metadata` stamps the organization ID onto the subscription itself, so every future subscription event carries it.
- `{CHECKOUT_SESSION_ID}` is a placeholder Stripe fills in. The doubled braces are only Python f-string escaping.
- `idempotency_key` ties the request to one upgrade attempt, so a retry after a network error returns the same session instead of creating another.

**Step 2: redirect the browser to `session.url`.** The customer pays on Stripe's page.

**Step 3: make the success page honest.** Show "activating," then poll your own API for the organization's plan until webhook processing updates it.

**Checkpoint:** in test mode, complete a checkout with Stripe's test card `4242 4242 4242 4242`, and confirm the new subscription in the Stripe Dashboard shows `organization_id` in its metadata.

## Your turn

In Stripe test mode:

1. Create a Product with monthly and annual Prices, and put the Price IDs in settings.
2. Implement `start_upgrade` with metadata and an idempotency key.
3. Call it twice with the same attempt ID and confirm only one session is created.
4. Make the success page show a pending state instead of granting access.
5. Enable the Customer Portal and link to it from your billing page.

**You're done when:** a test checkout creates exactly one subscription carrying your organization ID, and the success page alone never changes the plan.

## Check your understanding

1. Which Stripe key can safely appear in browser code?
2. Why are Product and Price separate objects?
3. What problem does an idempotency key solve, and what happens if you reuse a key with different parameters?
4. How does EstateIQ connect a Stripe subscription back to an organization?
5. Why isn't reaching the success URL proof that someone paid?

## Answer key

1. Only the publishable key, `pk_…`. Secret, restricted and webhook keys stay on the server.
2. A product is what you sell; a price is one way of charging for it. You can offer several prices for one product and change pricing without disturbing existing subscribers.
3. It makes retries safe when you can't tell whether a request succeeded: Stripe returns the original result instead of repeating the action. Reusing a key with different parameters returns an error.
4. It stores `organization_id` in the subscription's metadata when creating the Checkout Session, and reads it back from subscription events.
5. Anyone can open that URL, users can close the tab before arriving, and payments can still be processing. Verified webhook events are the reliable signal.

## Recap

- Stripe is a rented payment terminal: card data never touches your servers.
- Customer → Subscription → Invoice → PaymentIntent, with Products and Prices describing what's sold.
- Publishable keys in the browser; everything else on the server; test and live kept apart.
- Integer cents, idempotency keys on every write, metadata that links back to your tenant.
- The success page shows status; webhooks grant access.

Next up: [Lesson 5, Stripe webhooks and subscriptions](/guide/stripe-webhooks-and-subscriptions).

## Go deeper

- [Stripe: idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [Stripe Checkout](https://docs.stripe.com/payments/checkout)

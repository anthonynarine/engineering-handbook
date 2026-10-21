<!-- content/finance/financial-libraries.md — Introduce the Plaid and Stripe course and the rules every money integration shares. -->
---
title: "Financial libraries: Plaid, Stripe, and the rules of money integrations"
slug: financial-libraries
section: finance
summary: "Start here: what Plaid and Stripe each do, the rules every money integration shares, and the order to learn them."
order: 1
tags: [finance, plaid, stripe, payments, banking, webhooks, idempotency, integrations, course]
status: established-pattern
lastReviewed: "2026-10-21"
sources: [reference_sources/financial-libraries-review.md]
related: [plaid-fundamentals, stripe-fundamentals, caching-and-rate-limiting, observability-and-security-monitoring, subscriptions-and-feature-gates]
---

## Start here

Two of your apps depend on outside financial services. Moneta reads people's bank data through **Plaid**. EstateIQ charges subscriptions through **Stripe**. They solve opposite problems:

| | Plaid | Stripe |
| --- | --- | --- |
| Direction | Money **data** flows **in** | Money itself **moves** |
| The question it answers | "What's in this household's accounts?" | "Has this customer paid, and are they still subscribed?" |
| Your app's job | Store, sync and show financial data safely | Grant and remove access based on payment state |
| Your project | Moneta | EstateIQ |

Neither one is "just an SDK call." Each comes with secrets that unlock real money or real bank data, events that arrive on their own schedule, and failures that happen halfway through. This course teaches you to handle all of that deliberately.

## The rules every money integration shares

Before the details, here are six rules that apply to both services. Each lesson comes back to them.

**1. The provider's secrets are the keys to the vault.** A Plaid access token reads someone's bank history. A Stripe secret key can issue refunds. Keep them on the server only, encrypted at rest where you store them, and never in the browser, logs or Git.

**2. Keep test and live completely separate.** Both services give you a sandbox. Mixing sandbox and production credentials, data or webhooks causes some of the most confusing bugs there are. Moneta learned this firsthand when a production Plaid secret ended up in the sandbox slot.

**3. Webhooks are messages from outside: verify them.** Anyone can send a request to your webhook URL. Check the signature before you believe a single field.

**4. Expect every message twice, and out of order.** Providers retry deliveries, so duplicates are normal. Design every handler so running it twice gives the same result. That's called being **idempotent**.

**5. Know who owns the truth.** Stripe owns whether a subscription is paid; your app mirrors it. Your app owns its own ledger and categories; Plaid supplies raw transactions. Write down which system wins for each piece of data.

**6. Money is never a float.** `0.1 + 0.2` isn't exactly `0.3` in floating point. Use `Decimal` in Python, or integer cents. Stripe already counts in the smallest currency unit; Plaid sends decimal amounts that you should convert carefully.

## The course

| # | Lesson | You'll learn to |
| --- | --- | --- |
| 1 | [How Plaid works](/guide/plaid-fundamentals) | Connect a bank account safely with Link and the token exchange |
| 2 | [Syncing transactions and webhooks](/guide/plaid-transaction-sync) | Keep transactions accurate with cursors, and trust only verified webhooks |
| 3 | [Plaid security and failure handling](/guide/plaid-security-and-failures) | Protect tokens, repair broken connections, and disconnect cleanly |
| 4 | [How Stripe works](/guide/stripe-fundamentals) | Take payments with Checkout, idempotency keys and the right keys per mode |
| 5 | [Stripe webhooks and subscriptions](/guide/stripe-webhooks-and-subscriptions) | Turn subscription events into correct, durable access decisions |

Take the Plaid lessons in order, and the Stripe lessons in order. The two tracks are independent, so start with whichever project you're working on.

## Helpful background

These lessons build on a few others in the handbook:

- [Tenant isolation](/guide/tenant-isolation): every financial record belongs to exactly one household or organization.
- [Reliable job lifecycle](/guide/reliable-job-lifecycle): webhook work belongs in background jobs.
- [Caching and rate limiting](/guide/caching-and-rate-limiting): idempotency keys and safe retries.
- [Observability and security monitoring](/guide/observability-and-security-monitoring): sync freshness and payment failures need alerts and owners.

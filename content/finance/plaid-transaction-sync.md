<!-- content/finance/plaid-transaction-sync.md — Teach cursor-based Plaid transaction sync and verified webhooks. -->
---
title: "Syncing transactions and webhooks with Plaid"
slug: plaid-transaction-sync
section: finance
summary: "Keep a household's transactions accurate with cursor-based sync, handle pending and removed records, and trust only verified webhooks."
order: 3
tags: [finance, plaid, transactions, sync, cursor, pagination, pending, webhooks, jwt, idempotency, concepts, education]
status: established-pattern
lastReviewed: "2026-10-21"
sources: [reference_sources/financial-libraries-review.md]
related: [financial-libraries, plaid-fundamentals, plaid-security-and-failures, reliable-job-lifecycle, postgres-performance]
lesson:
  level: Intermediate
  duration: 75 minutes
  prerequisites: [plaid-fundamentals, reliable-job-lifecycle]
  objectives:
    - Explain how a sync cursor works and why it must only advance after a full success
    - Apply added, modified and removed changes, including pending-to-posted replacement
    - Recover correctly from a mutation during pagination
    - Verify a Plaid webhook's signature, age and body hash before acting on it
---

## Why this matters

Bank data isn't a snapshot you fetch once. It changes constantly. New purchases appear, pending charges settle into different amounts, and banks occasionally correct or remove transactions. If your copy drifts from reality, a household's budget is wrong, and they stop trusting the app.

Plaid gives you a precise way to stay in step: a **sync cursor**. This lesson teaches you to use it so your data is never half-updated, and to react to Plaid's notifications without letting a forged one in.

## The big idea

Imagine a shared notebook that the bank keeps writing in. Each time you visit, you don't want to reread the whole notebook; you want "everything that changed since I last looked." So you leave a **bookmark**. Next visit, you hand Plaid your bookmark and get back only the changes after it, plus a new bookmark.

That bookmark is the **cursor**. Each call to `/transactions/sync` returns three lists:

- **`added`**: new transactions.
- **`modified`**: transactions whose details changed.
- **`removed`**: transactions that no longer exist.

Plus `next_cursor` (the new bookmark) and `has_more` (whether there are more pages of changes to fetch right now). With no cursor at all, you get the full history.

## Pending and posted

When you pay at a restaurant, the bank first places a **pending** hold, often for the pre-tip amount. A day or two later the real charge **posts**, maybe with a different amount. In Plaid's data, that usually means the pending transaction is **removed** and a new posted one is **added**, carrying a `pending_transaction_id` that points back to the pending one.

So you don't need special pending logic. If you apply `removed` and `added` faithfully, pending-to-posted works automatically. Not every bank reports pending transactions, so your app must also work when none appear.

**Pause and check:** your ledger shows a pending $42.00 dinner, and then it disappears. Is that a bug? (Probably not. Look for a newly added posted transaction, perhaps $50.40 with the tip, whose `pending_transaction_id` matches.)

## The golden rule: the cursor moves only after everything succeeds

Here's where most sync bugs come from. Say there are three pages of changes. You fetch page 1, save it, and store its cursor. Page 2 fails. Now your stored cursor says "I've seen everything up to page 1," but you may have applied only part of a logical update. Or worse, you store the final cursor even though page 2's changes were never saved, and those transactions are skipped forever.

The rule: **keep the original cursor until every page has been fetched and every change saved. Then save all the changes and the new cursor together, in one database transaction.** If anything fails, nothing changes, and the next attempt starts again from the original bookmark.

There's one special failure to know by name. If the data changes on Plaid's side *while* you're paging, you get `TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION`. The fix is the same rule: throw away the partial pages and restart the whole loop from the original cursor.

## Webhooks: being told when to sync

Rather than syncing on a timer, you can let Plaid tell you. When new transactions are ready for an Item, Plaid sends a **`SYNC_UPDATES_AVAILABLE`** webhook to the URL you gave when creating the link token. Your app then runs a sync.

But a webhook URL is public. Anyone can send it a request that *looks* like Plaid. So before you trust a webhook, you verify it. Plaid signs each one:

1. The request has a **`Plaid-Verification`** header containing a signed JWT.
2. Its header names a key ID (`kid`). You fetch that public key from Plaid's `/webhook_verification_key/get` endpoint, and cache it.
3. You check the signature using that key, and accept only the **ES256** algorithm.
4. You check the token's issued-at time (`iat`) and reject anything **older than 5 minutes**, which stops replays of old captured webhooks.
5. You hash the **raw request body** with SHA-256 and compare it, in constant time, to the `request_body_sha256` claim. That proves the body wasn't altered.

Only if all of that passes do you act, and even then, the webhook only says "something changed." You still fetch the actual data from Plaid's API with your access token.

## Modern patterns

**Webhook as a trigger, API as the truth.** The webhook tells you *when* to look; the sync API tells you *what* changed. Never update financial data from webhook contents alone.

**Acknowledge fast, work later.** Verify the webhook, record a durable job, and return `200` right away. Do the sync in a [background job](/guide/reliable-job-lifecycle).

**Idempotent upserts.** Store each transaction by (connection, Plaid transaction ID). Applying the same change twice leaves the same result, so retries and duplicate webhooks are harmless.

**Tombstones for removals.** Mark removed transactions as removed instead of deleting the row. Your ledger hides them, but you keep an audit trail of what happened.

**Network calls outside locks.** Fetch pages from Plaid *before* opening a database transaction. Then lock the connection row, recheck that nothing changed (cursor, credentials, disconnected status), and commit everything at once. A slow Plaid response never holds your database locks.

**Bound the work.** Decide how many pages one run may fetch. If an update is bigger, fail cleanly without advancing the cursor, and handle large backfills with a resumable job.

**A scheduled safety net.** Webhooks can be missed. A periodic sync for each active Item catches anything that slipped through.

## Mistakes to avoid

- **Saving the cursor page by page.** A failure mid-way skips or splits changes.
- **Ignoring `removed`.** Pending charges pile up as duplicates next to their posted versions.
- **Trusting an unverified webhook.** A forged one could trigger work, or worse if your handler trusts its contents.
- **Parsing and re-serializing the body before hashing it.** The hash must be computed over the exact raw bytes received.
- **Doing the sync inside the webhook request.** Slow responses cause timeouts and redeliveries.
- **Using floats for amounts.** Convert to `Decimal` and round deliberately.

## Let's build it

**Step 1: fetch every page, keeping the original cursor.**

```python
import plaid
from plaid.model.transactions_sync_request import TransactionsSyncRequest

def fetch_changes(access_token, original_cursor, max_pages=3):
    for _attempt in range(3):
        cursor, pages = original_cursor, []
        try:
            for _page in range(max_pages):
                kwargs = {"access_token": access_token, "count": 500}
                if cursor:
                    kwargs["cursor"] = cursor
                page = plaid_client.transactions_sync(TransactionsSyncRequest(**kwargs))
                pages.append(page)
                cursor = page["next_cursor"]
                if not page["has_more"]:
                    return pages, cursor
            raise UpdateTooLarge()
        except plaid.ApiException as error:
            if plaid_error_code(error) != "TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION":
                raise
            # Data changed mid-pagination: restart from the original cursor
    raise SyncKeptChanging()
```

Nothing is saved here. The function either returns every page plus the final cursor, or raises.

**Step 2: apply everything and the cursor in one transaction.**

```python
def sync_connection(connection_id):
    connection = Connection.objects.get(id=connection_id)
    pages, next_cursor = fetch_changes(decrypt(connection.access_token), connection.cursor)

    with transaction.atomic():
        locked = Connection.objects.select_for_update().get(id=connection_id)
        if locked.cursor != connection.cursor or locked.disconnected_at:
            return  # Another sync or a disconnect got there first
        for page in pages:
            for item in page["added"] + page["modified"]:
                upsert_transaction(locked, item)
            for item in page["removed"]:
                mark_removed(locked, item["transaction_id"])
        locked.cursor = next_cursor
        locked.save(update_fields=["cursor"])
```

The recheck under the lock matters. If a concurrent sync already advanced the cursor, or the household disconnected the bank while you were fetching, this run quietly stands down instead of overwriting newer state.

**Step 3: verify the webhook, then enqueue.**

```python
import hashlib, hmac, time, jwt

def verify_plaid_webhook(raw_body: bytes, token: str) -> bool:
    header = jwt.get_unverified_header(token)
    if header.get("alg") != "ES256":
        return False
    key = get_cached_verification_key(header["kid"])  # /webhook_verification_key/get
    claims = jwt.decode(token, jwt.PyJWK(key).key, algorithms=["ES256"])
    if time.time() - claims["iat"] > 5 * 60:
        return False
    body_hash = hashlib.sha256(raw_body).hexdigest()
    return hmac.compare_digest(body_hash, claims["request_body_sha256"])
```

In the Django view, pass `request.body` (the raw bytes) and the `Plaid-Verification` header. If verification passes and the type is `SYNC_UPDATES_AVAILABLE`, enqueue `sync_connection` for that Item and return `200`. Treat any exception during verification as a failed verification.

Moneta currently syncs on demand and has no webhook receiver yet. This step is how you'd add one.

**Checkpoint:** simulate a failure on page 2 and confirm the stored cursor and transactions are unchanged.

## Your turn

1. Implement `fetch_changes` and `sync_connection` against a sandbox Item.
2. Write a test where page 2 raises an error: nothing is saved and the cursor doesn't move.
3. Write a test where a pending transaction is removed and a posted one is added: the ledger shows only the posted one.
4. Implement webhook verification and test it with a tampered body, an old `iat` and a wrong algorithm.

**You're done when:** all three failure tests pass, and a real sandbox webhook triggers a background sync.

## Check your understanding

1. Why must the cursor be saved in the same transaction as the changes?
2. What should happen after `TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION`?
3. How does pending-to-posted replacement usually appear in sync results?
4. Name the three checks you make on a Plaid webhook's JWT besides the algorithm.
5. Why fetch from Plaid before opening the database transaction?

## Answer key

1. So they always match. If the changes saved but the cursor didn't, you'd reapply them (harmless if idempotent, but wasteful). If the cursor saved but changes didn't, those transactions would be skipped forever.
2. Discard all pages fetched in that run and restart the entire loop from the original cursor.
3. The pending transaction appears in `removed`, and a new posted transaction appears in `added`, usually with `pending_transaction_id` pointing to the pending one.
4. The signature is valid for the public key matching its `kid`; the `iat` is no more than 5 minutes old; and the SHA-256 of the raw body matches `request_body_sha256`.
5. Network calls can be slow. Holding row locks while waiting on Plaid would block other requests. Fetch first, then lock briefly, recheck and commit.

## Recap

- The cursor is a bookmark. It moves only after every page succeeds, together with the changes.
- Apply `added`, `modified` and `removed`; pending-to-posted takes care of itself.
- On mutation-during-pagination, restart from the original cursor.
- Webhooks say *when*; the API says *what*. Verify signature, age and body hash first.
- Fetch outside locks, recheck under the lock, commit once.

Next up: [Lesson 3, Plaid security and failure handling](/guide/plaid-security-and-failures).

## Go deeper

- [Plaid Transactions API](https://plaid.com/docs/api/products/transactions/)
- [Plaid webhook verification](https://plaid.com/docs/api/webhooks/webhook-verification/)

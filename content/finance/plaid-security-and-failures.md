<!-- content/finance/plaid-security-and-failures.md — Teach Plaid token protection, reconnect, disconnect and failure handling. -->
---
title: "Plaid security and failure handling"
slug: plaid-security-and-failures
section: finance
summary: "Protect access tokens, repair broken bank connections, disconnect cleanly, and plan for the failures in between."
order: 4
tags: [finance, plaid, security, encryption, fernet, update mode, item removal, failures, privacy, consent, concepts, education]
status: established-pattern
lastReviewed: "2026-10-21"
sources: [reference_sources/financial-libraries-review.md]
related: [financial-libraries, plaid-fundamentals, plaid-transaction-sync, observability-and-security-monitoring, security-boundaries]
lesson:
  level: Intermediate
  duration: 60 minutes
  prerequisites: [plaid-fundamentals, plaid-transaction-sync]
  objectives:
    - Encrypt access tokens at rest and rotate the encryption key safely
    - Repair a broken connection with update mode instead of creating a duplicate
    - Disconnect in the right order so local access stops even if Plaid is unreachable
    - Recognize the failure that can orphan an Item, and design around it
    - Collect, keep and share only the financial data a feature needs
---

## Why this matters

Lessons 1 and 2 got data flowing. This lesson is about what happens on the bad days: a database backup leaks, a bank login expires, Plaid is down, a household wants to disconnect, or a request crashes at exactly the wrong moment.

In a finance app, how you handle the bad days is what earns trust. Nobody notices a smooth sync. Everybody notices "my bank disconnected and now my numbers are wrong," or "they still had my data after I removed it."

## The big idea

Here's the mental model for this lesson: **your app holds keys to other people's financial lives, and every key has a lifecycle**. It's created (lesson 1), used (lesson 2), protected while stored, repaired when it breaks, and destroyed when the household says so. Each stage has a way to go wrong. We'll walk through them in order.

## Protecting tokens at rest

The access token is the valet key from lesson 1, and it never expires on its own. If your database leaked tomorrow, every plain-text access token in it would be a working key to a household's bank history.

So encrypt access tokens before saving them, with a key stored *outside* the database (an environment variable or a secrets manager). Then a database leak alone gives an attacker ciphertext they can't use. Moneta uses **Fernet** from Python's `cryptography` library, a well-reviewed format that handles the encryption details correctly for you:

```python
from cryptography.fernet import Fernet, MultiFernet

def token_cipher():
    keys = [Fernet(key) for key in settings.TOKEN_ENCRYPTION_KEYS]
    return MultiFernet(keys)  # first key encrypts; all keys can decrypt

def encrypt_token(access_token: str) -> str:
    return token_cipher().encrypt(access_token.encode()).decode()

def decrypt_token(ciphertext: str) -> str:
    return token_cipher().decrypt(ciphertext.encode()).decode()
```

`MultiFernet` is what makes **key rotation** possible. Put the new key first and keep the old one second: new writes use the new key, and old ciphertext still decrypts. Then re-encrypt every stored token with the new key (`MultiFernet.rotate` does this), verify, and only then remove the old key. Moneta did exactly this when rotating credentials.

The single most dangerous move is the opposite: **generating a new key and deleting the old one.** Every stored token becomes undecryptable at once, and every household must reconnect. Never reset the encryption key to "fix" something.

**Pause and check:** the database and the encryption key are both in the same environment variables file that leaked. Does encryption still help? (Not against that leak. Encryption protects data only when the key lives somewhere the attacker can't reach. That's why the key is kept separate from the database and its backups.)

## When a connection breaks: update mode

Bank connections break for ordinary reasons. The user changed their bank password, a new multi-factor step was added, or their consent expired. Plaid reports this as an Item error, most commonly **`ITEM_LOGIN_REQUIRED`**, and syncs stop working until the user fixes it.

The tempting fix is to send them through Link again as a brand-new connection. Don't. That creates a *second* Item for the same bank: duplicate accounts, duplicate transactions, and often an extra cost.

Instead, use **update mode**: create a link token *for the existing Item*, by passing its access token instead of products. The user re-authenticates inside Link, the same Item is repaired, and your existing access token keeps working. There's no new public token to exchange. Update-mode link tokens expire after 30 minutes.

Moneta adds two safeguards worth copying: only the member who originally linked the bank can repair it, and repairs are bound to the same kind of short-lived, single-use attempt as new links.

## Disconnecting: order matters

When a household removes a bank, two things must happen: your app must stop using the connection, and Plaid must be told to revoke it (`/item/remove`). The order matters, because the second step can fail. Plaid might be unreachable.

So:

1. **Locally first, in one transaction:** mark the connection disconnected, stop syncs, cancel pending repair attempts, and remove any downstream access, such as AI features that used the account. This step can't fail because of Plaid.
2. **Then revoke upstream.** If it succeeds, delete the stored access token. If it fails, record "revocation pending," keep the encrypted token *only* so you can retry, and show the user the truth: removed from your app, and revocation with the bank still in progress.

Never resume syncing a connection just because revocation failed. And decide deliberately what happens to history: Moneta keeps past balances and transactions, clearly labeled as from a disconnected bank, which is a product choice you should make explicitly and explain to users.

## The failure that can orphan an Item

Here's a subtle one. The token exchange happens at Plaid, and saving the token happens in your database. Those are two separate systems with no shared transaction. If your process crashes *after* Plaid created the Item but *before* your database saved the token, Plaid has a live Item your app doesn't know about. It's orphaned.

You can't make the two systems commit together, but you can make the gap small and visible:

- Mark the attempt as "exchanging" in your database *before* calling Plaid.
- Save the encrypted token immediately after the exchange returns, before doing any other work, such as the first sync.
- Any attempt stuck in "exchanging" is a signal to investigate, not to blindly retry. A retry creates a second Item.

Moneta documents this as a known limit. That honesty is a pattern too: write down the failure modes you haven't fully solved.

## Modern patterns

**Encryption with a rotation path from day one.** `MultiFernet`, or your cloud provider's key management service.

**Least data.** Request only the products you use, store only the fields a feature needs, and don't keep raw provider responses. Moneta stores a defined set of fields and never logs raw Plaid responses.

**Consent that stays specific.** If a feature, such as an AI assistant, wants to use financial data, ask for that use explicitly, and don't silently widen it when you add new data types. Moneta's AI consent is per account, and adding transactions didn't extend it.

**Timeouts, backoff and honest status.** Give every Plaid call a timeout, back off on failures, and show users accurate states: "syncing," "needs reconnect," "last updated two days ago." Watch [Plaid's status page](https://status.plaid.com/) during incidents.

**Freshness as a metric.** Alert when a connection hasn't synced successfully within its expected window. That belongs in your [operational monitoring](/guide/observability-and-security-monitoring).

**A strict content security policy.** Allow Plaid's Link script and frames by exact origin, and nothing broader.

## Mistakes to avoid

- **Plain-text access tokens** in the database, backups or logs.
- **The encryption key stored next to the data**, such as in the same database.
- **Resetting the encryption key** instead of rotating it.
- **A new Link flow to fix `ITEM_LOGIN_REQUIRED`**, which creates duplicate Items.
- **Revoking upstream first** and leaving local access running when it fails.
- **Blind retries after a crashed exchange**, which can create duplicate Items.
- **Feeding financial data to new features** without fresh, specific consent.

## Let's build it

**Step 1: store tokens encrypted** with the `encrypt_token` and `decrypt_token` helpers above. Add a test asserting that the database column never contains the raw token.

**Step 2: offer repair through update mode.**

```python
def start_repair(member, connection):
    if connection.linked_by_id != member.id:
        raise PermissionDenied()
    response = plaid_client.link_token_create(LinkTokenCreateRequest(
        user=LinkTokenCreateRequestUser(client_user_id=str(member.id)),
        client_name="Moneta",
        country_codes=[CountryCode("US")],
        language="en",
        access_token=decrypt_token(connection.access_token),
    ))
    return response["link_token"]
```

No `products` and no exchange afterward: the existing Item is repaired in place.

**Step 3: disconnect locally first.**

```python
def disconnect(connection_id):
    with transaction.atomic():
        connection = Connection.objects.select_for_update().get(id=connection_id)
        connection.disconnected_at = timezone.now()
        connection.revocation_status = "pending"
        connection.save()
        LinkAttempt.objects.filter(connection=connection, consumed_at__isnull=True).delete()
        disable_ai_access(connection)
    transaction.on_commit(lambda: revoke_upstream.delay(connection_id))
```

`revoke_upstream` calls `/item/remove`. On success it clears the stored token and marks revocation complete; on failure it leaves the status pending for a retry.

**Checkpoint:** with Plaid unreachable (mock the call to fail), disconnect still succeeds locally, syncing stops, and the user sees "revocation pending."

## Your turn

1. Encrypt stored access tokens with `MultiFernet`, and write a rotation command that re-encrypts every token under a new key.
2. Force an Item into `ITEM_LOGIN_REQUIRED` in sandbox and repair it with update mode. Confirm no second Item was created.
3. Implement local-first disconnect with upstream revocation and a retry.
4. Add a freshness alert for any connection that hasn't synced within its window.

**You're done when:** rotation works without any household reconnecting, repair keeps the same Item, and disconnect works with Plaid down.

## Check your understanding

1. Why encrypt access tokens if the database already requires a password?
2. How does `MultiFernet` make key rotation safe?
3. A user changed their bank password. Why use update mode instead of a new Link flow?
4. Why mark a connection disconnected locally before calling `/item/remove`?
5. What causes an orphaned Item, and why is an automatic retry dangerous?

## Answer key

1. Database access isn't the only way data leaks: backups, snapshots, logs and misconfigured replicas leak too. Encryption with a separately stored key means leaked rows alone are useless.
2. It decrypts with any listed key but encrypts with the first. You can add a new key, re-encrypt everything, verify, and then retire the old key, without any moment where tokens are unreadable.
3. Update mode repairs the same Item. A new flow creates a duplicate Item with duplicate accounts, transactions and often cost.
4. So the household's intent takes effect immediately and can't be blocked by a Plaid outage. Upstream revocation can then be retried safely.
5. A crash after Plaid created the Item but before your database saved its token. Plaid and your database can't commit together. Retrying the link creates a second Item instead of recovering the first.

## Recap

- Access tokens are long-lived keys: encrypt them with a separately stored key, and rotate, never reset.
- Repair broken connections with update mode, never a new link.
- Disconnect locally first, revoke upstream second, retry honestly.
- Know where your system can't be atomic, keep that gap small, and write it down.
- Collect, keep and share only what each feature needs, with specific consent.

That completes the Plaid track. Next: [Lesson 4, how Stripe works](/guide/stripe-fundamentals).

## Go deeper

- [Plaid update mode](https://plaid.com/docs/link/update-mode/)
- [Plaid Item removal](https://plaid.com/docs/api/items/#itemremove)
- [Fernet in the cryptography library](https://cryptography.io/en/latest/fernet/)

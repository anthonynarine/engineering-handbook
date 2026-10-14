<!-- content/system/recipe-private-document.md — Practical build recipe and verification guidance. -->
---
title: "Recipe: retrieve a private document"
slug: "recipe-private-document"
section: "system"
summary: "Keep file authorization on the server and clean up the browser preview."
order: 72
tags: ["recipe", "building", "checklist"]
status: "established-pattern"
lastReviewed: "2026-10-13"
sources: ["reference_sources/build-recipes.md"]
related: ["private-document-lifecycle", "security-boundaries", "estateiq-tenant-boundary"]
---

## Before you start

Your backend must implement an authenticated file endpoint that resolves the document through the caller's authorized scope. The following browser excerpt assumes that endpoint streams approved bytes. Do not replace it with a public storage URL.

## File and integration excerpt

```typescript
// frontend/src/features/documents/api.ts — Retrieve an authorized PDF preview through the API.
import { api } from '../../api/client';
export async function loadDocumentPreview(documentId: string, signal?: AbortSignal) {
  const response = await api.get<Blob>(`documents/${encodeURIComponent(documentId)}/file/`, {
    responseType: 'blob', signal,
  });
  if (response.data.type.split(';')[0] !== 'application/pdf') {
    throw new Error('Expected a PDF preview');
  }
  const url = URL.createObjectURL(response.data);
  return { url, dispose: () => URL.revokeObjectURL(url) };
}
```

Adapt the URL to your actual API contract. The caller owns `dispose`: call it when replacing a preview, closing it, switching organizations or unmounting. Cancel outstanding loads, and dispose a late result if its preview owner has already closed. Impose server-side type and size limits; MIME metadata alone does not establish file safety.

## Server checklist

Verify identity, active membership, document permission and scoped record lookup before opening storage. Keep the bucket private. If using signed URLs instead of streaming, define their lifetime and revocation limitations explicitly; they are a different delivery contract.

## Verify

Test a foreign document ID, removed membership, missing storage object, expired credentials, close during loading and repeated preview opening. Confirm private data and Blob URLs are cleared on a workspace change. Follow the [document lifecycle](/guide/private-document-lifecycle) for the full server workflow.

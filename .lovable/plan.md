

## Diagnosis & Plan

### 1. Melhor Envio 401 "Unauthenticated" Error

**Root cause:** The Melhor Envio API uses OAuth2 authentication. The user created an app in the Melhor Envio Sandbox panel and got a **Client ID** and **Client Secret**, but these are NOT the Bearer token. An OAuth2 authorization flow is required:

1. User visits: `https://sandbox.melhorenvio.com.br/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={CALLBACK}&response_type=code&scope=shipping-calculate&state=test`
2. After authorizing, Melhor Envio redirects back with a `?code=XXXXX` parameter
3. That `code` must be exchanged for an access token via `POST /oauth/token` with `grant_type=authorization_code`, `client_id`, `client_secret`, `redirect_uri`, and `code`

**Solution:** Create a backend edge function to handle the OAuth2 flow, or guide the user through generating the token manually. The simplest approach for sandbox:

- Create an edge function `melhor-envio-auth` that handles the OAuth callback (receives the `code` and exchanges it for a token, storing it)
- OR provide the user with the exact authorization URL to visit, then have them paste back the `code`, and we exchange it server-side and store the resulting token

**Recommended approach:** Create a simple OAuth callback page + edge function:
- Edge function `melhor-envio-auth`: accepts `code`, `client_id`, `client_secret` and calls Melhor Envio's `/oauth/token` endpoint to get the Bearer token
- Store the resulting access token as the `MELHOR_ENVIO_TOKEN` secret
- Need to also store `MELHOR_ENVIO_CLIENT_ID` and `MELHOR_ENVIO_CLIENT_SECRET` as secrets for token refresh

**Files to create/edit:**
- `supabase/functions/melhor-envio-auth/index.ts` — new edge function to exchange OAuth code for token and handle refresh
- `supabase/functions/melhor-envio-quote/index.ts` — update to use proper token (may need to call refresh if expired)
- Add secrets: `MELHOR_ENVIO_CLIENT_ID`, `MELHOR_ENVIO_CLIENT_SECRET`

### 2. CPF Validation

**Current state:** The checkout page (`src/app/checkout/page.tsx`) only formats the CPF but never validates it. Any 11 digits are accepted.

**Solution:** Add a `isValidCPF()` function using the standard checksum algorithm (verifying digits, rejecting all-same-digit sequences like 111.111.111-11). Validate on the `completeCurrentStep` function before proceeding.

**File to edit:**
- `src/app/checkout/page.tsx` — add validation function and call it at step completion

### 3. Rename Status for Juma Button

**Current state:** The Juma dispatch button appears when status is `"separating"` (label: "Separando Pedido").

**Requested change:** Rename the label to "Envio Pronto" (keep the value `"separating"` or change to match). The button text stays "Chamar Juma" / "Chamar Motoboy Juma".

**Files to edit:**
- `src/app/admin/page.tsx` — change label from "Separando Pedido" to "Envio Pronto"
- `src/app/caixa/page.tsx` — same change
- `src/app/meus-pedidos/page.tsx` — same change for customer-facing view

### Summary of Changes

| Task | Files |
|------|-------|
| Fix Melhor Envio OAuth2 auth | New edge function + update quote function + new secrets |
| CPF validation | `src/app/checkout/page.tsx` |
| Rename status label | `admin/page.tsx`, `caixa/page.tsx`, `meus-pedidos/page.tsx` |


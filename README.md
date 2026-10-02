# DWD Checkout — Cloudflare Pages

Standalone, framework-free production frontend for the De Website Dokters B2B order flow.

## Architecture
- Frontend: Cloudflare Pages
- Backend/data: existing Supabase Edge Functions
- Payments: Mollie
- Transactional email: Resend
- Intended custom domain: `opdracht.dewebsitedokters.nl`

## Cloudflare Pages deployment (Git integration)
1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Select this repository.
3. Framework preset: **None**.
4. Build command: leave empty.
5. Build output directory: `/` (repository root).
6. Deploy.
7. In Pages → Custom domains add `opdracht.dewebsitedokters.nl`.
8. Wait until SSL is Active.

## After custom domain is live
Update Supabase Edge Function `dwd-create-payment` constant `FRONTEND_URL` to:
`https://opdracht.dewebsitedokters.nl`

Then run a fresh Mollie test order end-to-end.

## Important
- Raw backend error codes are mapped to Dutch customer-facing messages.
- The corrupted Supabase wave asset is only rendered after successful decode; otherwise it is hidden.
- No Lovable runtime or badge is included.
- No customer account/login/cookies/analytics are used.
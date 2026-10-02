# DWD Checkout — pre-deploy QA report

## Code checks completed
- `app.js` passes syntax validation.
- Checkout uses only the existing Supabase Edge Function API base.
- All POST calls send `Content-Type: application/json`.
- No Lovable runtime, dependency, badge or build-credit dependency remains.
- No customer account, analytics or cookies are used.

## Checkout-state checks
- `SENT` / `VIEWED` → Opdracht screen.
- Customer step is editable only before acceptance.
- `ACCEPTED` / `PAYMENT_PENDING` → Bevestigen screen.
- Locked customer state does not expose `order_locked`.
- `PAID` → final confirmed screen.
- Return from Mollie polls every 1.5 seconds, max ~15 seconds.
- Payment button is duplicate-click protected while requests are running.
- The UI never claims payment succeeded unless order status is `PAID`.

## Design checks
- DWD colors: mint `#DDF3EC`, ink `#101B17`, forest `#245D49`, muted `#526B61`, pearl `#F4FBF7`.
- Arial/Helvetica/sans-serif only.
- Offer surfaces are near-white for stronger contrast.
- Website section has disclosure chevron.
- Website Care has matching disclosure treatment.
- Primary CTA uses darker forest gradient and bold text.
- View / Download actions use consistent secondary treatment.
- Mobile breakpoint at 720px.
- Reduced-motion support included.

## Document checks
- Terms page keeps hashes in collapsed metadata.
- No debug text is rendered.
- Order confirmation hides hashes behind a disclosure.
- Invoice refuses to invent missing seller legal address.
- PDF links point to existing canonical Supabase PDF functions.

## Security / hosting checks
- Cloudflare `_headers` includes no-sniff, referrer policy, frame denial, permissions policy and CSP.
- Cloudflare `_redirects` supports SPA routes.
- HTML is `noindex,nofollow`.
- No secret API keys are present in frontend files.

## Still requires live Cloudflare validation
1. Mobile visual inspection.
2. CORS against Pages/custom-domain origin.
3. Custom-domain SSL.
4. Update `FRONTEND_URL` in `dwd-create-payment`.
5. Full fresh Mollie test payment using order `DWD-2026-00003`.
6. Webhook → PAID → invoice/document creation.
7. Resend paid-confirmation email end-to-end.
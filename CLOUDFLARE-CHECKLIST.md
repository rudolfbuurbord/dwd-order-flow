# Cloudflare handoff checklist

1. Open Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Create a Pages project from this Git repository.
4. Preset: **None**; no build command; output = repository root.
5. Deploy and test the temporary `*.pages.dev` URL.
6. Add custom domain **opdracht.dewebsitedokters.nl**.
7. Wait until SSL is Active.
8. Update Mollie redirect in `dwd-create-payment` to the custom domain.
9. Run fresh test order DWD-2026-00003 through all four screens and Mollie test payment.
10. Verify paid screen, invoice, terms PDF, order confirmation PDF and Resend confirmation email.
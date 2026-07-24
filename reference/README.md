# Reference — current site of record (pre-rebuild)

This folder is the **permanent reference** captured before rebuilding the marketing site
(see the plan in `/root/.claude/plans/`). It exists so the rebuild doesn't lose content,
structure, pricing, or brand details.

## Note on screenshots
Pixel screenshots of the live site could **not** be captured from the build environment —
its network policy blocks outbound access to `www.thepaybureau.com` and `*.vercel.app`.
The **content + design inventories below are the reference of record** instead. If a visual
archive is wanted, drop PNGs into `reference/screenshots/` (homepage, pricing, roadmap,
security, about, contact — mobile 375 + desktop 1280).

## Files
- `current-live-site.md` — the live marketing site (`www.thepaybureau.com`, the newer Next.js one): full page structure, verbatim copy, pricing, FAQ, nav/footer, brand tokens.
- `old-vite-site.md` — the old Vite/HTML site in this repo (the design the client likes): brand palette, product catalogue, copy, pricing, roadmap, form endpoint, design patterns.

## Content precedence (from the plan — do not violate)
1. Current live site  →  2. Approved pricing (verify vs app/Stripe)  →  3. Existing repo  →  4. Rewrite fresh (flag for sign-off).

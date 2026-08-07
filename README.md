# BureauFlow website

Marketing website for **BureauFlow** — the UK payroll CRM, operated by BureauFlow Limited (registered in England and Wales, company number 17378706).

Built with [Astro](https://astro.build) as a static site, deployed on Vercel.

## Commands

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server at `localhost:4321` |
| `npm run build` | Build the production site to `./dist/` |
| `npm run preview` | Preview the production build locally |

## Structure

- `src/layouts/BaseLayout.astro` — shared header, footer, meta tags, Organization JSON-LD
- `src/pages/` — all pages (home, pricing, roadmap, security, about, contact, privacy, terms, 404)
- `src/pages/compare/` — competitor comparison hub and the `[slug]` template that renders every comparison
- `src/data/comparisons.ts` — the only source of competitor facts. Read the header comment before editing it: claims are governed by an evidence rule enforced at build time
- `src/styles/global.css` — design tokens and site-wide styles (no CSS framework)
- `scripts/check-compare.mjs` — post-build assertions for the comparison pages (`npm run check`)
- `public/` — static assets and `robots.txt` (the sitemap is generated at build time by `@astrojs/sitemap`)
- `reference/` — content archive of previous versions of the site (not built or shipped)

## Notes

- The canonical site URL is set in `astro.config.mjs` (`site`) and `src/layouts/BaseLayout.astro` (`const site`); the sitemap (`/sitemap-index.xml`) is generated from `site` at build time, but the `Sitemap:` URL in `public/robots.txt` must be kept in sync manually.
- Image assets in `public/` (logo, og-image, screenshots) still carry the previous ThePayBureau artwork and are pending replacement with BureauFlow branding.
- The contact form posts to Web3Forms; the access key in `src/pages/contact.astro` must route to the current support inbox.
- Comparison pages make claims about named competitors. Anything we say about another product must come from that company's own published material, read and dated — never from a search-result summary. Unverified means "Not stated", not a cross. `src/data/comparisons.ts` enforces this at build time: a `false` or qualified cell with no cited source fails `npm run build`. Comparisons marked `provisional` render a draft banner, are `noindex`, and are kept out of the sitemap automatically.

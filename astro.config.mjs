// @ts-check
import { defineConfig } from 'astro/config';

// Static (SSG) output — every page is rendered to HTML at build time.
// No SSR, no client-side rendering of page content (see plan §0).
// NOTE: @astrojs/sitemap to be re-added once the full page set exists.
export default defineConfig({
  site: 'https://thepaybureau.com',
  build: { format: 'directory' },
  compressHTML: true,
  // Preserve old URLs / SEO (see plan §12)
  redirects: {
    '/pro': '/pricing',
  },
});

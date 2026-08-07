// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { noindexPaths } from './src/data/comparisons.ts';

// Comparison pages are noindexed while provisional, so they must not be
// advertised in the sitemap either — that would send crawlers a mixed signal.
// Derived from the data file, so flipping a comparison to 'verified' adds it
// to the sitemap automatically with no config change.
const excluded = new Set(noindexPaths());

// Static (SSG) output — every page is rendered to HTML at build time.
// No SSR, no client-side rendering of page content (see plan §0).
export default defineConfig({
  site: 'https://www.bureauflow.co.uk',
  integrations: [
    sitemap({
      filter: (page) => !excluded.has(new URL(page).pathname),
    }),
  ],
  build: { format: 'directory' },
  compressHTML: true,
  // Preserve old URLs / SEO (see plan §12)
  redirects: {
    '/pro': '/pricing',
  },
});

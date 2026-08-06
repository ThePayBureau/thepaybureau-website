// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static (SSG) output — every page is rendered to HTML at build time.
// No SSR, no client-side rendering of page content (see plan §0).
export default defineConfig({
  site: 'https://www.bureauflow.co.uk',
  integrations: [sitemap()],
  build: { format: 'directory' },
  compressHTML: true,
  // Preserve old URLs / SEO (see plan §12)
  redirects: {
    '/pro': '/pricing',
  },
});

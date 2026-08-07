#!/usr/bin/env node
/**
 * Post-build assertions for the comparison pages.
 *
 * The data file already fails the build on unsourced competitor claims
 * (assertValid in src/data/comparisons.ts). This script checks the things that
 * can only be seen in the rendered output: that provisional pages really are
 * noindexed, that verified pages don't leak draft language, and that every
 * JSON-LD graph parses.
 *
 * Run after `npm run build` — `npm run check` does both.
 */
import { readFileSync, existsSync } from 'node:fs';

const DIST = 'dist';
const failures = [];
const notes = [];
const fail = (m) => failures.push(m);

// Read the data file directly rather than importing it — this script runs
// under plain node, and the source is TypeScript.
const src = readFileSync('src/data/comparisons.ts', 'utf8');

// Slug + status pairs, in file order.
const entries = [...src.matchAll(/slug:\s*'([^']+)',\s*\n\s*status:\s*'(provisional|verified)'/g)]
  .map((m) => ({ slug: m[1], status: m[2] }));

if (!entries.length) fail('Could not parse any comparison slug/status pairs from src/data/comparisons.ts');

const pages = [
  { file: `${DIST}/compare/index.html`, slug: '(hub)', status: entries.every((e) => e.status === 'provisional') ? 'provisional' : 'verified' },
  ...entries.map((e) => ({ file: `${DIST}/compare/${e.slug}/index.html`, ...e })),
];

for (const { file, slug, status } of pages) {
  if (!existsSync(file)) { fail(`${slug}: expected build output at ${file}`); continue; }
  const html = readFileSync(file, 'utf8');

  // A. noindex must match status, in both directions.
  const noindexed = /name="robots" content="noindex/.test(html);
  if (status === 'provisional' && !noindexed) {
    fail(`${slug}: provisional but NOT noindexed — a draft comparison must not be indexable.`);
  }
  if (status === 'verified' && noindexed) {
    fail(`${slug}: verified but still noindexed — it will never rank.`);
  }

  // D. A verified page must not leak provisional language.
  if (status === 'verified') {
    for (const phrase of ['Draft — not yet verified', 'not yet verified', 'Not yet verified', 'PROVISIONAL', 'provisional and have not been confirmed']) {
      if (html.includes(phrase)) fail(`${slug}: verified page still contains draft language: "${phrase}"`);
    }
    if (html.includes('Not stated')) {
      notes.push(`${slug}: verified page still shows "Not stated" cells — fine if genuinely unverifiable, worth a look otherwise.`);
    }
  }

  // E. Every JSON-LD graph must parse.
  const graphs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!graphs.length) fail(`${slug}: no JSON-LD found (expected at least Organization + BreadcrumbList).`);
  for (const [, body] of graphs) {
    try { JSON.parse(body); }
    catch (e) { fail(`${slug}: JSON-LD failed to parse — ${e.message}`); }
  }
  const types = graphs.map(([, b]) => { try { return JSON.parse(b)['@type']; } catch { return '?'; } });
  if (!types.includes('BreadcrumbList')) fail(`${slug}: missing BreadcrumbList JSON-LD.`);

  // The visible breadcrumb must exist wherever BreadcrumbList is claimed.
  if (!/class="crumbs"/.test(html)) fail(`${slug}: emits BreadcrumbList but renders no visible breadcrumb.`);

  // No superlatives that would need substantiating next to a named competitor.
  for (const banned of [/UK.s first/i, /\bthe best\b/i, /\bcheapest\b/i, /only platform/i]) {
    if (banned.test(html)) fail(`${slug}: contains an unsubstantiated superlative matching ${banned}`);
  }
}

// B. A noindexed page must not be advertised in the sitemap.
const sitemap = existsSync(`${DIST}/sitemap-0.xml`) ? readFileSync(`${DIST}/sitemap-0.xml`, 'utf8') : '';
for (const { slug, status } of entries) {
  const inSitemap = sitemap.includes(`/compare/${slug}/`);
  if (status === 'provisional' && inSitemap) fail(`${slug}: provisional but listed in the sitemap.`);
  if (status === 'verified' && !inSitemap) fail(`${slug}: verified but missing from the sitemap.`);
}

// Canonical must carry the trailing slash so it matches the sitemap form.
for (const { slug } of entries) {
  const html = existsSync(`${DIST}/compare/${slug}/index.html`) ? readFileSync(`${DIST}/compare/${slug}/index.html`, 'utf8') : '';
  if (!html.includes(`rel="canonical" href="https://www.bureauflow.co.uk/compare/${slug}/"`)) {
    fail(`${slug}: canonical URL missing or lacks the trailing slash (must match the sitemap form).`);
  }
}

for (const n of notes) console.log(`note  ${n}`);

if (failures.length) {
  console.error(`\n✗ ${failures.length} comparison check(s) failed:\n`);
  for (const f of failures) console.error(`  • ${f}`);
  console.error('');
  process.exit(1);
}

console.log(`✓ comparison checks passed (${pages.length} page(s))`);

/* ═══════════════════════════════════════════════════════════════════════════
   COMPETITOR COMPARISONS — single source of truth for /compare/*
   ═══════════════════════════════════════════════════════════════════════════

   SEEDING RULE (read before editing)
   ----------------------------------
   No matrix cell may be populated from a search-result snippet alone. Snippets
   may identify *candidate sources*; `true`, `false` and any non-trivial string
   require the underlying page or document to have been READ. If the source does
   not establish the claim, use `null`.

       search snippet → identify source → OPEN AND READ IT → record → assign

   What earns each state:

       Competitor explicitly says they offer it .............. true
       Competitor explicitly says they DON'T offer it ........ false
       Feature list omits it ................................. null
       Documentation doesn't mention it ...................... null
       Source doesn't establish it either way ................ null
       "Coming soon" / roadmap ............ false or a qualified string,
                                            depending on how they present it
       A real qualification ("Bureau plan only") ............. string

   "Positively evidenced absence" means more than *I couldn't find it*.
   Not finding something is `null`. A wrong ✕ is the classic comparative-
   advertising breach; "Not stated" cannot be wrong.

   Every `false` or free-text competitor cell MUST cite a source id in
   `themSources`. Enforced by assertValid() at build time — a violation fails
   `npm run build`, it is not a lint warning.

   SOURCE HIERARCHY
   ----------------
     1. Competitor's official website
     2. Competitor's official documentation / help centre
     3. Competitor's terms, privacy or security documentation
     4. Reputable third-party source, only where necessary

   Do NOT use a third-party source to establish that a competitor HAS a feature
   when the competitor's own material is silent.

   THREE CLASSES OF CONTENT — keep them distinct
   ---------------------------------------------
     A. Competitor facts (externally verifiable): `competitor`, `matrix[].them`,
        `pricing.them`, `costExample.them`. Source-backed, dated.
     B. BureauFlow facts (our own product): `matrix[].bureauflow`,
        `pricing.bureauflow`. Must match src/pages/pricing.astro and
        src/pages/roadmap.astro.
     C. Editorial (interpretation and marketing): `hubBlurb`, `atAGlance`,
        `reasons`, `credit`, `bestFor`, `migration`, `faqs`. Must NOT assert
        facts about the competitor beyond what class A establishes.

   Editing a class C field must never smuggle in a class A claim. That is the
   most likely way this file goes wrong six months from now.

   ON TONE
   -------
   These pages argue for BureauFlow. That is legitimate: lead with what we do
   well, order the matrix so our strengths land first, and put the price
   difference in front of the reader in cash terms. What it does NOT license is
   bending a fact. The `credit` and `bestFor.them` sections stay, and stay real
   — a comparison a reader can catch out is worth less than no comparison, and
   a competitor page with no honest counterweight reads as an advert.

   ADDING A COMPETITOR
   -------------------
   Only where there is meaningful category overlap AND demonstrable search or
   sales demand — a competitor we actually lose deals to, or a query we can
   evidence. Each one is a permanent re-verification commitment.

   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * A matrix cell.
 *   true   → offered
 *   false  → positively evidenced absence (requires a source)
 *   null   → not publicly stated / could not verify — the safe default
 *   string → sourced qualification, e.g. 'Bureau plan and above'
 */
export type CellValue = boolean | string | null;

export interface MatrixRow {
  label: string;
  /** Class B — must match pricing.astro / roadmap.astro. */
  bureauflow: CellValue;
  /** Class A — subject to the seeding rule. */
  them: CellValue;
  /** REQUIRED when `them` is false or a string. Ids from `sources`. */
  themSources?: string[];
  /** Small caption under the label. Qualifiers only, never arguments. */
  note?: string;
}

export interface MatrixSection {
  category: string;
  rows: MatrixRow[];
}

export interface Source {
  id: string;
  url: string;
  /** YYYY-MM-DD — the date this page was actually read. */
  accessed: string;
  description: string;
  kind: 'official' | 'third-party';
}

export interface Comparison {
  slug: string;
  /** 'provisional' → page is noindexed and renders a draft banner. */
  status: 'provisional' | 'verified';
  /** YYYY-MM-DD. Rendered as "Facts checked", not "Updated". */
  factsChecked: string;

  /** Class A. */
  competitor: {
    name: string;
    legalName: string;
    /** Held for the audit trail. Deliberately NOT rendered. */
    companyNumber?: string;
    website: string;
    /** Their own words, quoted verbatim. Never paraphrase a rival's pitch. */
    positioning: string;
    /** Source id for `positioning`. Required once verified. */
    positioningSource?: string;
    pricingModel: 'published' | 'on-request' | 'unknown';
  };

  meta: { title: string; description: string };

  /** Emit FAQPage JSON-LD? Opt-in — only where the FAQs are genuinely
   *  user-facing rather than marketing copy. See BaseLayout notes. */
  faqSchema: boolean;

  /* ── Class C — editorial ────────────────────────────────────────────── */
  hubBlurb: string;
  atAGlance: { bureauflow: string[]; them: string[] };
  /** What they genuinely do well. Keep it real — this is what makes the
   *  rest of the page believable. */
  credit: string[];
  /** Why bureaus pick BureauFlow. `icon` is raw SVG path data, same
   *  convention as security.astro's cards[].i */
  reasons: { title: string; body: string; icon: string }[];
  /** The honest "who each suits". `them` needs ≥2 entries to go verified. */
  bestFor: { bureauflow: string[]; them: string[] };
  migration: { title: string; body: string }[];
  faqs: { q: string; a: string }[];

  /* ── Class A/B — the matrix ─────────────────────────────────────────── */
  matrix: MatrixSection[];
  pricing: { bureauflow: string; them: string; note: string };
  /** Optional cash comparison. Omit where the competitor doesn't publish. */
  costExample?: {
    intro: string;
    rows: { label: string; bureauflow: string; them: string }[];
    footnote: string;
  };

  sources: Source[];
}

/** Facts shared by every comparison page. One place to edit. */
export const SHARED = {
  correctionEmail: 'support@bureauflow.co.uk',
  signupUrl: 'https://app.bureauflow.co.uk/signup',
  categoryNote:
    'Neither BureauFlow nor the products on this page calculate payroll or file ' +
    'with HMRC. Both sit alongside the payroll engine you already run. This ' +
    'comparison is about how you run the practice around it — not about which ' +
    'one does your RTI.',
  trademarkNote:
    'All product names, trade marks and company names are the property of their ' +
    'respective owners and are used here for identification purposes only. ' +
    'BureauFlow is not affiliated with, endorsed by or sponsored by any company ' +
    'named on this page.',
  correctionNote:
    'Think we’ve got something wrong or out of date? Email us and we’ll correct it.',
  // TODO(pricing-verify): keep in step with src/pages/pricing.astro.
  bureauflowPricing:
    'Free £0 forever (unlimited clients, up to 50 active payrolls) · Unlimited ' +
    '£24/user/mo (£19 billed annually) · Bureau £35/user/mo (£29 annually) · ' +
    'Enterprise on application. Prices exclude VAT.',
} as const;

/**
 * BureauFlow cells still `null` because our own public site doesn't establish
 * them. These are OUR product — someone internal can answer them definitively,
 * and until they do, our column reads evasive next to a competitor's ✓.
 * Resolve before flipping either comparison to 'verified'.
 */
export const BUREAUFLOW_TODO = [
  'Structured payroll change capture — is there an intake for mid-period changes?',
  'Cut-off / pay-cycle scheduling — beyond deadline alerts, is there cycle scheduling?',
  'Workflow & task management — do checklists cover this, or is it a separate gap?',
  'Prioritised work queue across all payrolls — do we order work by urgency?',
  'Client portal — anything client-facing today, or is White Labelling (Enterprise, planned) the nearest thing?',
  'Client helpdesk / query ticketing — any query inbox, or is that out of scope?',
  'Client invoicing & billing — Advanced Fee Management (Enterprise) is fee management; does it raise invoices?',
  'Document storage — can clients or staff attach payroll files to a client record?',
  'Payroll manuals / process documentation — is there a per-client knowledge base?',
  'Contact directory — is there a shared client contact list?',
  'Integrations with payroll systems — any today, or is CSV the only route in?',
  'API access — is there a public API on any tier?',
] as const;

/** A competitor's answers, keyed by row id. Anything not listed stays `null`. */
export type ThemCells = Record<string, { them: CellValue; themSources?: string[] }>;

/**
 * The matrix. BureauFlow's column is defined once here; each comparison supplies
 * only its competitor column, keyed by row id.
 *
 * Category order is deliberate. Sections where BureauFlow is strongest come
 * first — a reader who stops halfway should have seen our best case. Sections
 * where the competitor leads still appear, in full, further down.
 */
const buildMatrix = (t: ThemCells): MatrixSection[] => {
  const row = (id: string, label: string, bureauflow: CellValue, note?: string): MatrixRow => ({
    label,
    bureauflow,
    them: t[id]?.them ?? null,
    themSources: t[id]?.themSources,
    ...(note ? { note } : {}),
  });

  return [
    {
      category: 'Category & fit',
      rows: [
        row('rti', 'Calculates payroll / files RTI with HMRC', false,
          'Both products are practice layers, not payroll engines.'),
        row('alongside', 'Sits alongside your existing payroll software', true),
        row('anyengine', 'Works with any payroll engine (Sage, BrightPay, IRIS…)', true),
        row('ukbureau', 'Built for UK payroll bureaus', true),
      ],
    },
    {
      category: 'Getting started & what it costs',
      rows: [
        row('free', 'Free plan', 'Free forever, up to 50 active payrolls'),
        row('trial', 'Free trial', 'Not needed — the free plan has no time limit'),
        row('selfserve', 'Sign up without talking to sales', true),
        row('pubprice', 'Pricing published on the website', 'All tiers except Enterprise'),
        row('entrylevel', 'Entry paid plan, per user, billed annually', '£19/user/mo'),
        row('unlimitedclients', 'Unlimited clients', true),
      ],
    },
    {
      category: 'AI',
      rows: [
        row('ai', 'Natural-language assistant across your whole book',
          'Unlimited plan and above', 'BureauFlow calls this Penny.'),
      ],
    },
    {
      category: 'Bureau commercials',
      rows: [
        row('mrr', 'MRR & revenue per payroll', 'Bureau plan and above'),
        row('churn', 'Churn-risk scoring', 'Enterprise plan'),
        row('revforecast', 'Revenue forecasting', 'Enterprise plan'),
        row('benchmarking', 'Peer benchmarking against other bureaus', 'Enterprise plan'),
        row('clienthealth', 'Client-health insights', 'Bureau plan and above'),
        row('invoicing', 'Client invoicing & billing', null),
      ],
    },
    {
      category: 'Running the practice',
      rows: [
        row('register', 'Client & payroll register', true),
        row('deadlines', 'HMRC deadline tracking & alerts', true),
        row('pension', 'Pension declarations', true),
        row('checklists', 'Payroll checklists', true),
        row('csv', 'CSV import & export', true),
        row('reminders', 'Automated email reminders', 'Unlimited plan and above'),
        row('visibility', 'Real-time status across every payroll', true),
        row('teamdash', 'Team dashboard & workload view', 'Bureau plan and above'),
        row('capacity', 'Capacity & service-delivery insights', 'Bureau plan and above'),
        row('reporting', 'Data reporting', true),
        row('audit', 'Audit trail', 'Basic on Free, full on Unlimited and above'),
        row('scheduling', 'Cut-off & pay-cycle scheduling', null),
        row('tasks', 'Workflow & task management', null),
        row('priorityqueue', 'Prioritised work queue across all payrolls', null),
        row('changecapture', 'Structured payroll change capture', null),
        row('docs', 'Document storage', null),
        row('manuals', 'Payroll manuals / process documentation', null),
        row('directory', 'Client contact directory', null),
      ],
    },
    {
      category: 'Working with your clients',
      rows: [
        row('portal', 'Client portal for submitting changes', null),
        row('helpdesk', 'Client helpdesk / query ticketing', null),
        row('clientmsg', 'Two-way client messaging', null),
        row('whitelabel', 'White-labelling', 'Planned — Enterprise'),
        row('feedback', 'Client feedback / reviews', 'Planned — client surveys & NPS'),
      ],
    },
    {
      category: 'Integrations',
      rows: [
        row('integrations', 'Integrations with payroll systems', null),
        row('api', 'API access', null),
      ],
    },
    {
      category: 'Transparency',
      rows: [
        row('roadmap', 'Public product roadmap', true),
        row('pubpricing', 'Public pricing page', true),
      ],
    },
  ];
};

const REASONS_SHARED = [
  {
    title: 'Free to start, and it stays free',
    body:
      'Unlimited clients and up to 50 active payrolls at £0, with no card, no ' +
      'trial clock and no onboarding call. You can have your book loaded and your ' +
      'first deadlines tracked in the time it takes to get a demo in the diary.',
    icon: '<path d="M11 3l2.4 5.2 5.6.7-4.1 3.9 1.1 5.6L11 15.7 5.9 18.4 7 12.8 2.9 8.9l5.6-.7z"/>',
  },
  {
    title: 'Ask Penny, don’t go digging',
    body:
      '“Which clients are due this week?” in plain English, answered across your ' +
      'whole book. Available on Unlimited and above — no report builder, no export ' +
      'to a spreadsheet to find out what you already half-knew.',
    icon: '<circle cx="11" cy="11" r="7.5"/><path d="M8.6 9a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.4"/><path d="M11 16.4h.01"/>',
  },
  {
    title: 'The commercials, not just the workflow',
    body:
      'MRR, revenue per payroll, capacity and client health on the Bureau plan. ' +
      'Churn-risk scoring, revenue forecasting and peer benchmarking on Enterprise. ' +
      'Most tools in this category tell you what’s late. We also tell you what it’s worth.',
    icon: '<path d="M4 18V9M9.7 18V4.5M15.3 18v-6M21 18V7"/>',
  },
];

const MIGRATION_SHARED = [
  {
    title: 'Keep your payroll software',
    body:
      'Nothing to rip out. BureauFlow runs the practice around whatever engine you ' +
      'already file with, so there’s no parallel run and no cutover weekend.',
  },
  {
    title: 'Bring your book across',
    body:
      'Import clients and payrolls by CSV, or add them by hand if you’d rather. ' +
      'Deadlines generate themselves once the payrolls are in.',
  },
  {
    title: 'Run both for as long as you like',
    body:
      'The free tier covers up to 50 active payrolls indefinitely, so you can run ' +
      'BureauFlow alongside your current setup with no clock ticking and no pressure ' +
      'to decide.',
  },
];

const SHARED_FAQ_METHOD = {
  q: 'How did you put this comparison together?',
  a: 'From publicly available information on each company’s own website, on the date shown at the top of the page. Where their material doesn’t establish something either way, we mark it “Not stated” rather than guessing — so a blank is a gap in our research, not a claim about their product. If we’ve got something wrong, email support@bureauflow.co.uk and we’ll correct it.',
};

export const comparisons: Comparison[] = [
  /* ───────────────────────────────────────── Changepen ─────────────────── */
  {
    slug: 'bureauflow-vs-changepen',
    status: 'provisional',
    factsChecked: '2026-08-07',

    competitor: {
      name: 'Changepen',
      legalName: 'Changepen Ltd',
      companyNumber: '12578539', // audit trail only — not rendered
      website: 'https://www.changepen.co.uk',
      positioning: 'Changepen manages the operation around payroll, not the payroll itself.',
      positioningSource: 'cp-bureaus',
      pricingModel: 'published',
    },

    meta: {
      // Deliberate deviation from the site's "X — BureauFlow" title pattern:
      // the brand already leads the title, so repeating it wastes pixels on a
      // query where "BureauFlow vs Changepen" is the exact match. Don't "fix".
      title: 'BureauFlow vs Changepen — an honest comparison',
      description:
        'BureauFlow vs Changepen for UK payroll bureaus: free plan, pricing from ' +
        '£19/user/mo, AI assistant and bureau commercials, compared side by side ' +
        'with sources.',
    },

    faqSchema: false,

    hubBlurb:
      'Both run the practice around your payroll engine rather than replacing it. ' +
      'BureauFlow is free to start, cheaper per user and gives you the commercial ' +
      'picture of your bureau. Changepen is demo-led and paid-only, with a deeper ' +
      'client-facing layer.',

    atAGlance: {
      bureauflow: [
        'Free forever for up to 50 active payrolls — no trial clock',
        'From £19/user/mo, £6 a month cheaper per seat',
        'Penny, an AI assistant across your whole book',
        'MRR, churn risk, revenue forecasting and peer benchmarking',
      ],
      them: [
        'No free plan — a one-month trial, then from £25/user/mo',
        'Demo-led: “we always start with a quick demo”',
        'Client portal, helpdesk and white-labelling on the Business plan',
        'Structured change capture to replace email instructions',
      ],
    },

    credit: [
      'Their client-facing layer is genuinely deeper than ours. Customer portals, a ' +
        'structured client helpdesk, customer reviews and white-labelling all ship on ' +
        'the Business plan. BureauFlow has no equivalent today.',
      'Structured change capture is the heart of their product — replacing email as ' +
        'the channel clients send starters, leavers and salary changes through, with ' +
        'validation and plain-English feedback to the client.',
      'They publish a named customer outcome: Martyn Cheney of Cheney Payroll ' +
        'Services says the firm took on 200 additional payrolls without adding staff.',
      'They’ve been at this since January 2020, they publish their pricing, and ' +
        'they’re explicit about working alongside Sage, BrightPay, IRIS, Star and ' +
        'Moneysoft rather than replacing them.',
    ],

    reasons: REASONS_SHARED,

    bestFor: {
      bureauflow: [
        'You want to try it properly today, without a sales call or a trial clock',
        'You’re a solo consultant or small bureau under 50 active payrolls',
        'You want the commercial picture — revenue per payroll, churn risk, forecasting',
        'You’d use an AI assistant to answer questions across your book',
        'You want a lower per-seat cost as the team grows',
      ],
      them: [
        'Client instructions arriving by email are your single biggest source of risk',
        'You want clients submitting changes through a structured, validated portal',
        'You need a helpdesk with an audit trail for client payroll queries',
        'You want to white-label the client-facing experience under your own brand',
        'You need an API and multi-office support at enterprise scale',
      ],
    },

    migration: MIGRATION_SHARED,

    faqs: [
      {
        q: 'Do I have to stop using my payroll software?',
        a: 'No. Neither BureauFlow nor Changepen calculates payroll or files with HMRC. Both sit alongside the engine you already run — BrightPay, IRIS, Sage, Staffology, whatever it is. You keep filing exactly as you do now.',
      },
      {
        q: 'Which one is cheaper?',
        a: 'BureauFlow. Our Free plan covers unlimited clients and up to 50 active payrolls at £0 with no time limit; Changepen’s published plans start at £25 per user per month billed annually after a one-month trial. On paid plans we’re £19 per user per month billed annually against their £25 — for a three-person bureau that’s £684 a year versus £900.',
      },
      {
        q: 'Can I try BureauFlow without a demo call?',
        a: 'Yes. Sign up and import your book without speaking to anyone. Changepen state that they always start with a demo.',
      },
      {
        q: 'Does BureauFlow have a client portal like Changepen?',
        a: 'No. Changepen’s Business plan includes customer portals, a client helpdesk and white-labelling, and that client-facing layer is deeper than ours today. If getting clients off email and into a portal is the problem you’re solving, that’s a fair reason to choose them. BureauFlow focuses on the bureau side — deadlines, checklists, and the commercial picture across your book.',
      },
      {
        q: 'What does BureauFlow cost?',
        a: SHARED.bureauflowPricing,
      },
      SHARED_FAQ_METHOD,
    ],

    // Every non-null cell traces to a source id listed at the end of this entry.
    matrix: buildMatrix({
      rti: { them: false, themSources: ['cp-faq', 'cp-bureaus'] },
      alongside: { them: true, themSources: ['cp-bureaus', 'cp-guide'] },
      anyengine: { them: true, themSources: ['cp-integrations', 'cp-faq'] },
      ukbureau: { them: true, themSources: ['cp-faq', 'cp-bureaus'] },

      free: { them: false, themSources: ['cp-pricing'] },
      trial: { them: 'One month', themSources: ['cp-pricing'] },
      selfserve: { them: 'Demo-led — “we always start with a quick demo”', themSources: ['cp-pricing'] },
      pubprice: { them: 'Team and Business published; Enterprise custom', themSources: ['cp-pricing'] },
      entrylevel: { them: '£25/user/mo (Team)', themSources: ['cp-pricing'] },
      unlimitedclients: { them: 'Unlimited usage limits on Enterprise', themSources: ['cp-pricing'] },

      register: { them: 'Payroll Overviews (Team plan and above)', themSources: ['cp-pricing'] },
      visibility: { them: true, themSources: ['cp-bureaus', 'cp-scheduling'] },
      capacity: { them: true, themSources: ['cp-scheduling', 'cp-bureaus'] },
      reporting: { them: true, themSources: ['cp-pricing'] },
      audit: { them: 'Full time-stamped audit trail', themSources: ['cp-guide', 'cp-helpdesk'] },
      scheduling: { them: true, themSources: ['cp-scheduling', 'cp-pricing'] },
      tasks: { them: true, themSources: ['cp-tasks', 'cp-pricing'] },
      changecapture: { them: true, themSources: ['cp-changes', 'cp-guide'] },
      docs: { them: true, themSources: ['cp-docs'] },
      manuals: { them: true, themSources: ['cp-manuals'] },
      directory: { them: true, themSources: ['cp-directory'] },

      invoicing: { them: true, themSources: ['cp-pricing', 'cp-guide'] },

      portal: { them: 'Business plan and above — optional', themSources: ['cp-pricing', 'cp-portals', 'cp-faq'] },
      helpdesk: { them: 'Business plan and above', themSources: ['cp-pricing', 'cp-helpdesk'] },
      clientmsg: { them: true, themSources: ['cp-helpdesk'] },
      whitelabel: { them: 'Business plan and above', themSources: ['cp-pricing', 'cp-whitelabel'] },
      feedback: { them: 'Business plan and above', themSources: ['cp-pricing', 'cp-feedback'] },

      integrations: { them: true, themSources: ['cp-integrations'] },
      api: { them: 'Open API; API access on Enterprise', themSources: ['cp-integrations', 'cp-pricing'] },

      pubpricing: { them: true, themSources: ['cp-pricing'] },
    }),

    pricing: {
      bureauflow: SHARED.bureauflowPricing,
      them:
        'Team £25/user/mo billed annually (£35 monthly) · Business £35/user/mo ' +
        'annually (£45 monthly) · Enterprise custom. One-month free trial, no setup ' +
        'fee, support and onboarding included. No free plan.',
      note:
        'Both exclude VAT. Changepen figures are from their published pricing page ' +
        'and FAQ.',
    },

    costExample: {
      intro:
        'Entry paid plan, billed annually, excluding VAT — BureauFlow Unlimited at ' +
        '£19 per user per month against Changepen Team at £25.',
      rows: [
        { label: 'Solo consultant (1 user)', bureauflow: '£228/yr', them: '£300/yr' },
        { label: 'Small bureau (3 users)', bureauflow: '£684/yr', them: '£900/yr' },
        { label: 'Growing bureau (5 users)', bureauflow: '£1,140/yr', them: '£1,500/yr' },
      ],
      footnote:
        'And BureauFlow’s Free plan covers unlimited clients and up to 50 active ' +
        'payrolls at £0 indefinitely — Changepen’s free period is a one-month trial. ' +
        'Compare like for like on the client-facing tier and it’s BureauFlow Bureau ' +
        '(£29) against Changepen Business (£35), though the features in each differ — ' +
        'see the table above.',
    },

    sources: [
      { id: 'cp-pricing', url: 'https://www.changepen.co.uk/pricing', accessed: '2026-08-07', description: 'Changepen — Pricing', kind: 'official' },
      { id: 'cp-faq', url: 'https://www.changepen.co.uk/faq', accessed: '2026-08-07', description: 'Changepen — FAQ', kind: 'official' },
      { id: 'cp-bureaus', url: 'https://www.changepen.co.uk/solutions/payroll-bureaus', accessed: '2026-08-07', description: 'Changepen — Payroll bureau software', kind: 'official' },
      { id: 'cp-guide', url: 'https://www.changepen.co.uk/payroll-operations-management', accessed: '2026-08-07', description: 'Changepen — Payroll operations management guide', kind: 'official' },
      { id: 'cp-portals', url: 'https://www.changepen.co.uk/customer-portals', accessed: '2026-08-07', description: 'Changepen — Customer portals', kind: 'official' },
      { id: 'cp-changes', url: 'https://www.changepen.co.uk/payroll-changes', accessed: '2026-08-07', description: 'Changepen — Payroll change capture', kind: 'official' },
      { id: 'cp-scheduling', url: 'https://www.changepen.co.uk/scheduling', accessed: '2026-08-07', description: 'Changepen — Payroll scheduling', kind: 'official' },
      { id: 'cp-helpdesk', url: 'https://www.changepen.co.uk/payroll-helpdesk', accessed: '2026-08-07', description: 'Changepen — Payroll helpdesk', kind: 'official' },
      { id: 'cp-tasks', url: 'https://www.changepen.co.uk/task-management', accessed: '2026-08-07', description: 'Changepen — Task management', kind: 'official' },
      { id: 'cp-docs', url: 'https://www.changepen.co.uk/document-storage', accessed: '2026-08-07', description: 'Changepen — Document storage', kind: 'official' },
      { id: 'cp-manuals', url: 'https://www.changepen.co.uk/payroll-manuals', accessed: '2026-08-07', description: 'Changepen — Payroll manuals', kind: 'official' },
      { id: 'cp-directory', url: 'https://www.changepen.co.uk/contact-directory', accessed: '2026-08-07', description: 'Changepen — Contact directory', kind: 'official' },
      { id: 'cp-integrations', url: 'https://www.changepen.co.uk/integrations', accessed: '2026-08-07', description: 'Changepen — Integrations and API', kind: 'official' },
      { id: 'cp-whitelabel', url: 'https://www.changepen.co.uk/white-labelling', accessed: '2026-08-07', description: 'Changepen — White-labelling', kind: 'official' },
      { id: 'cp-feedback', url: 'https://www.changepen.co.uk/customer-feedback', accessed: '2026-08-07', description: 'Changepen — Customer feedback', kind: 'official' },
    ],
  },

  /* ───────────────────────────────────────── Payflow ───────────────────── */
  {
    slug: 'bureauflow-vs-payflow',
    status: 'provisional',
    factsChecked: '2026-08-07',

    competitor: {
      name: 'Payflow',
      legalName: 'NewOrbit Ltd',
      companyNumber: '04990082', // audit trail only — not rendered
      website: 'https://www.payflow.io',
      positioning: 'If payroll is what you do, Payflow is how you do it.',
      positioningSource: 'pf-home',
      pricingModel: 'on-request',
    },

    meta: {
      title: 'BureauFlow vs Payflow — an honest comparison',
      description:
        'BureauFlow vs Payflow for UK payroll bureaus: published pricing and a free ' +
        'plan against rates on request, compared side by side with sources.',
    },

    faqSchema: false,

    hubBlurb:
      'Payflow is built for scale — BDO, Forvis Mazars and an 85-person payroll team ' +
      'at Liberata. BureauFlow is built for the other end of the market: start free ' +
      'today, see the price before you talk to anyone, and get the commercial picture ' +
      'of your own bureau.',

    atAGlance: {
      bureauflow: [
        'Free forever for up to 50 active payrolls',
        'Published pricing — £19/user/mo billed annually',
        'Sign up today; no demo, no rates-on-request',
        'Penny, an AI assistant across your whole book',
      ],
      them: [
        'Rates on request — no price published',
        'Billed monthly in arrears on the month’s peak user count',
        'Engage Portal for client tasks, files and messaging',
        'Built for BPOs, shared service centres and large firms',
      ],
    },

    credit: [
      'They operate at a scale we don’t. Public customers include BDO, All3Media, ' +
        'Forvis Mazars and BNP Paribas Real Estate, and their Liberata case study ' +
        'describes 200+ payrolls and 1.1 million payslips a year across an 85-person ' +
        'payroll team.',
      'Their scheduling model is more sophisticated than ours. Pay-date rules ' +
        '(“last Friday unless bank holiday”) generate future work automatically, and ' +
        'the system presents it as one prioritised queue across every payroll rather ' +
        'than payroll by payroll.',
      'Workload forecasting is a first-class feature — future task volumes expose ' +
        'peaks and resourcing collisions, which is exactly what you need when you’re ' +
        'planning holiday cover across a large team.',
      'They’ve been in this category since at least 2016, when they were a finalist ' +
        'for Payroll Software Product of the Year, and the Engage Portal gives clients ' +
        'their own tasks, deadlines and secure file exchange.',
    ],

    reasons: REASONS_SHARED,

    bestFor: {
      bureauflow: [
        'You want to know the price without booking a call',
        'You’re a solo consultant or small bureau, not a BPO',
        'You want to start free today and decide later',
        'You want bureau commercials — MRR, churn risk, revenue forecasting',
        'You’d use an AI assistant to answer questions across your book',
      ],
      them: [
        'You’re a BPO, shared service centre or large accountancy firm',
        'You run a big enough team that workload forecasting drives your staffing',
        'You want automatic task generation from pay-date rules across many payrolls',
        'You need per-person management information on who did what and when',
        'You want clients holding their own tasks and deadlines in a portal',
      ],
    },

    migration: MIGRATION_SHARED,

    faqs: [
      {
        q: 'Do I have to stop using my payroll software?',
        a: 'No. Neither BureauFlow nor Payflow calculates payroll or files with HMRC. Both sit alongside the engine you already run, and both are deliberately payroll-system agnostic.',
      },
      {
        q: 'What does Payflow cost?',
        a: 'Payflow don’t publish a price. Their terms of service state that subscription rates are provided on request, quoted in pounds sterling excluding VAT, and billed monthly in arrears — with the monthly charge based on the highest number of users at any point during that month. BureauFlow publishes every tier except Enterprise, and starts at £0.',
      },
      {
        q: 'Can I try BureauFlow without a demo call?',
        a: 'Yes. The Free plan covers unlimited clients and up to 50 active payrolls, forever, with no card required. You can sign up and import your book without speaking to anyone.',
      },
      {
        q: 'Is Payflow a better fit for a large operation?',
        a: 'Quite possibly. Their published customers include BDO and Forvis Mazars, and their Liberata case study describes an 85-person payroll team running 200+ payrolls. If you’re operating at that scale — particularly if workload forecasting and per-person management information drive your staffing decisions — they’re built for it in a way we currently aren’t.',
      },
      {
        q: 'What does BureauFlow cost?',
        a: SHARED.bureauflowPricing,
      },
      SHARED_FAQ_METHOD,
    ],

    matrix: buildMatrix({
      rti: { them: false, themSources: ['pf-home', 'pf-why'] },
      alongside: { them: true, themSources: ['pf-home', 'pf-tool'] },
      anyengine: { them: true, themSources: ['pf-tool', 'pf-liberata'] },
      ukbureau: { them: 'Also BPOs, shared service centres and in-house teams', themSources: ['pf-ssc', 'pf-awards'] },

      pubprice: { them: false, themSources: ['pf-terms'] },
      selfserve: { them: 'Sales-led — rates on request', themSources: ['pf-terms'] },
      entrylevel: { them: 'On request', themSources: ['pf-terms'] },
      unlimitedclients: { them: true, themSources: ['pf-home', 'pf-tool'] },

      visibility: { them: true, themSources: ['pf-home'] },
      capacity: { them: true, themSources: ['pf-home'] },
      reporting: { them: true, themSources: ['pf-home'] },
      audit: { them: 'Task timeline with timestamps', themSources: ['pf-home'] },
      scheduling: { them: 'Pay-date rules generate future schedules', themSources: ['pf-tool'] },
      tasks: { them: true, themSources: ['pf-home', 'pf-tool'] },
      priorityqueue: { them: true, themSources: ['pf-tool', 'pf-optimise'] },
      checklists: { them: true, themSources: ['pf-tool'] },
      teamdash: { them: 'MyPeople — per-person reporting', themSources: ['pf-home'] },

      portal: { them: 'Engage Portal', themSources: ['pf-home'] },
      clientmsg: { them: true, themSources: ['pf-home'] },

      integrations: { them: true, themSources: ['pf-tool'] },
      api: { them: true, themSources: ['pf-terms'] },
    }),

    pricing: {
      bureauflow: SHARED.bureauflowPricing,
      them:
        'Rates on request. Billed monthly in arrears, per user licence, in pounds ' +
        'sterling excluding VAT. The monthly charge is based on the highest number of ' +
        'users at any point in that month, so adding a user mid-month charges that ' +
        'user for the whole month.',
      note:
        'From Payflow’s published terms of service. No numerical price appears in ' +
        'their public material, so there is nothing to compare in cash terms.',
    },

    sources: [
      { id: 'pf-home', url: 'https://www.payflow.io/', accessed: '2026-08-07', description: 'Payflow — Homepage', kind: 'official' },
      { id: 'pf-terms', url: 'https://www.payflow.io/uploads/payflow-terms-of-service.pdf', accessed: '2026-08-07', description: 'Payflow — Terms of service (PDF)', kind: 'official' },
      { id: 'pf-tool', url: 'https://www.payflow.io/blog/The-right-tool-for-the-job/', accessed: '2026-08-07', description: 'Payflow — Payroll: the right tool for the job', kind: 'official' },
      { id: 'pf-why', url: 'https://www.payflow.io/blog/payflow-why-how-what/', accessed: '2026-08-07', description: 'Payflow — Why, how and what', kind: 'official' },
      { id: 'pf-optimise', url: 'https://www.payflow.io/blog/5-ways-optimise-payroll/', accessed: '2026-08-07', description: 'Payflow — 5 ways to optimise payroll', kind: 'official' },
      { id: 'pf-ssc', url: 'https://www.payflow.io/blog/payroll-management-shared-service-centres/', accessed: '2026-08-07', description: 'Payflow — Payroll management for shared service centres', kind: 'official' },
      { id: 'pf-liberata', url: 'https://www.payflow.io/img/liberata-case-study.pdf', accessed: '2026-08-07', description: 'Payflow — Liberata case study (PDF)', kind: 'official' },
      { id: 'pf-awards', url: 'https://www.payflow.io/awards/', accessed: '2026-08-07', description: 'Payflow — Awards', kind: 'official' },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Build-time validation. Called from getStaticPaths() so a violation FAILS THE
   BUILD rather than shipping a claim we can't stand behind.
   ═══════════════════════════════════════════════════════════════════════════ */

export function assertValid(c: Comparison): void {
  const where = `comparisons.ts [${c.slug}]`;
  const ids = new Set(c.sources.map((s) => s.id));

  for (const sec of c.matrix) {
    for (const r of sec.rows) {
      const needsEvidence = r.them === false || typeof r.them === 'string';
      if (!needsEvidence) continue;

      const kind = r.them === false ? 'negative' : 'qualified';
      if (!r.themSources?.length) {
        throw new Error(
          `${where}: row "${r.label}" makes a ${kind} claim about ` +
            `${c.competitor.name} with no source. Cite a source id in ` +
            `themSources, or set the cell to null.`,
        );
      }
      for (const id of r.themSources) {
        if (!ids.has(id)) {
          throw new Error(
            `${where}: row "${r.label}" cites unknown source id "${id}".`,
          );
        }
      }
    }
  }

  for (const s of c.sources) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.accessed)) {
      throw new Error(`${where}: source "${s.id}" has a malformed accessed date.`);
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.factsChecked)) {
    throw new Error(`${where}: factsChecked must be YYYY-MM-DD.`);
  }

  if (c.status === 'verified') {
    if (!c.sources.length) {
      throw new Error(`${where}: marked verified with no sources.`);
    }
    if (!c.competitor.positioningSource) {
      throw new Error(
        `${where}: verified requires positioningSource — the positioning must ` +
          `be a verbatim quote from a cited source.`,
      );
    }
    if (!ids.has(c.competitor.positioningSource)) {
      throw new Error(
        `${where}: positioningSource "${c.competitor.positioningSource}" is not ` +
          `in sources.`,
      );
    }
    if (c.bestFor.them.length < 2) {
      throw new Error(
        `${where}: verified requires at least two concrete reasons a buyer might ` +
          `reasonably choose ${c.competitor.name} over BureauFlow. Found ` +
          `${c.bestFor.them.length}. If you can't write two, the page isn't ready.`,
      );
    }
    if (c.credit.length < 2) {
      throw new Error(
        `${where}: verified requires at least two things ${c.competitor.name} does ` +
          `genuinely well. A comparison with no counterweight reads as an advert.`,
      );
    }
    if (c.competitor.pricingModel === 'unknown') {
      throw new Error(`${where}: verified requires a known pricingModel.`);
    }
  }
}

export function assertAllValid(list: Comparison[] = comparisons): void {
  const seen = new Set<string>();
  for (const c of list) {
    if (seen.has(c.slug)) {
      throw new Error(`comparisons.ts: duplicate slug "${c.slug}".`);
    }
    seen.add(c.slug);
    assertValid(c);
  }
}

/**
 * Paths that render with `noindex` and must therefore be excluded from the
 * sitemap. Consumed by astro.config.mjs — keep the two in step by deriving,
 * never by hand-listing. Mirrors the `allDraft` rule in compare/index.astro.
 */
export function noindexPaths(): string[] {
  const paths = comparisons
    .filter((c) => c.status === 'provisional')
    .map((c) => `/compare/${c.slug}/`);
  if (comparisons.every((c) => c.status === 'provisional')) paths.push('/compare/');
  return paths;
}

/** The other comparisons, for the reader-facing cross-link. */
export const others = (slug: string): Comparison[] =>
  comparisons.filter((c) => c.slug !== slug);

/** en-GB long date for display, e.g. "7 August 2026". */
export const formatDate = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

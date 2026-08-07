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
   `themSources`. This is enforced by assertValid() at build time — a violation
   fails `npm run build`, it is not a lint warning.

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
        `pricing.them`. Source-backed, dated, subject to the rules above.
     B. BureauFlow facts (our own product): `matrix[].bureauflow`,
        `pricing.bureauflow`. Must match src/pages/pricing.astro and
        src/pages/roadmap.astro.
     C. Editorial (interpretation and marketing): `hubBlurb`, `atAGlance`,
        `reasons`, `credit`, `bestFor`, `migration`, `faqs`. Must NOT assert
        facts about the competitor beyond what class A establishes.

   Editing a class C field must never smuggle in a class A claim. That is the
   most likely way this file goes wrong six months from now.

   ADDING A COMPETITOR
   -------------------
   Only where there is meaningful category overlap AND demonstrable search or
   sales demand — a competitor we actually lose deals to, or a query we can
   evidence. Not every payroll-adjacent product deserves a page. Each one is a
   permanent re-verification commitment.

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
  /** What they genuinely do well. */
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

/* ═══════════════════════════════════════════════════════════════════════════
   BureauFlow's own column (class B).

   Derived strictly from src/pages/pricing.astro and src/pages/roadmap.astro.
   `null` here means our own published material doesn't establish it either —
   see BUREAUFLOW_TODO below. Do not fill these from memory; either the site
   says it or it's null.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * BureauFlow cells currently `null` because the public site doesn't establish
 * them. These are OUR product — someone internal can answer them definitively.
 * Resolve before flipping either comparison to 'verified'.
 */
export const BUREAUFLOW_TODO = [
  'Structured payroll change capture — is there an intake for mid-period changes?',
  'Cut-off / pay-cycle scheduling — beyond deadline alerts, is there cycle scheduling?',
  'Workflow & task management — do checklists cover this, or is it a separate gap?',
  'Client portal — anything client-facing today, or is White Labelling (Enterprise, planned) the nearest thing?',
  'Client helpdesk / ticketing — any query inbox, or is that out of scope?',
  'Client invoicing & billing — Advanced Fee Management (Enterprise) is fee management; does it raise invoices?',
  'Integrations with payroll systems — any today, or is CSV the only route in?',
  'API access — is there a public API on any tier?',
] as const;

/** A competitor's answers, keyed by row id. Anything not listed stays `null`. */
export type ThemCells = Record<string, { them: CellValue; themSources?: string[] }>;

/**
 * The matrix. BureauFlow's column is defined once here; each comparison supplies
 * only its own competitor column, keyed by row id. Rows neither side can
 * evidence are omitted rather than shown as a double "Not stated" — an empty
 * row helps nobody and reads as padding.
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
      category: 'Getting started & pricing',
      rows: [
        row('free', 'Free plan', 'Free forever, up to 50 active payrolls'),
        row('selfserve', 'Sign up without talking to sales', true),
        row('pubprice', 'Pricing published on the website', 'All tiers except Enterprise'),
        row('unlimitedclients', 'Unlimited clients', true),
        row('entrylevel', 'Entry price per user, billed annually', 'Free, then £19/user/mo'),
      ],
    },
    {
      category: 'Running the practice',
      rows: [
        row('register', 'Client & payroll register', true),
        row('deadlines', 'HMRC deadline tracking & alerts', true),
        row('scheduling', 'Cut-off & pay-cycle scheduling', null),
        row('checklists', 'Payroll checklists', true),
        row('tasks', 'Workflow & task management', null),
        row('changecapture', 'Structured payroll change capture', null),
        row('pension', 'Pension declarations', true),
        row('csv', 'CSV import & export', true),
        row('audit', 'Audit trail', 'Basic on Free, full on Unlimited and above'),
        row('reminders', 'Automated email reminders', 'Unlimited plan and above'),
        row('visibility', 'Real-time status across every payroll', true),
      ],
    },
    {
      category: 'Working with clients',
      rows: [
        row('portal', 'Client portal for submitting changes', null),
        row('helpdesk', 'Client helpdesk / query ticketing', null),
        row('whitelabel', 'White-labelling', 'Planned — Enterprise'),
        row('feedback', 'Client feedback / reviews', 'Planned — client surveys & NPS'),
      ],
    },
    {
      category: 'Commercials & insight',
      rows: [
        row('dashboard', 'Live dashboard metrics', true),
        row('reporting', 'Data reporting', true),
        row('teamdash', 'Bureau & team dashboard', 'Bureau plan and above'),
        row('mrr', 'MRR & revenue per payroll', 'Bureau plan and above'),
        row('capacity', 'Capacity & service-delivery insights', 'Bureau plan and above'),
        row('churn', 'Churn-risk scoring', 'Enterprise plan'),
        row('forecasting', 'Capacity & revenue forecasting', 'Enterprise plan'),
        row('benchmarking', 'Peer benchmarking', 'Enterprise plan'),
        row('invoicing', 'Client invoicing & billing', null),
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
      category: 'AI',
      rows: [
        row('ai', 'Natural-language assistant over your own book', 'Unlimited plan and above',
          'BureauFlow calls this Penny.'),
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

/* ═══════════════════════════════════════════════════════════════════════════
   PROVISIONAL ENTRIES

   Every `them` cell below is `null`. That is not an oversight and not laziness:
   neither changepen.co.uk nor payflow.io was reachable from the build
   environment on 2026-08-07, so under the seeding rule above there is no
   admissible evidence for a single competitor claim. The alternative — seeding
   from search snippets — is exactly what the rule forbids.

   Both pages are therefore `status: 'provisional'`: noindexed, draft-bannered,
   and not fit to publish as content. The structure, styling and schema are
   complete and reviewable now.

   TO GO LIVE, per competitor:
     1. Read the sources. Add each to `sources` with a real accessed date.
     2. Fill `them` cells. `null` unless the source positively establishes it.
        Every `false` or string needs a `themSources` entry — the build enforces
        this.
     3. Replace `positioning` with a verbatim quote and set `positioningSource`.
     4. Write ≥2 genuine reasons into `bestFor.them` (build-enforced).
     5. Resolve BUREAUFLOW_TODO above.
     6. Set `factsChecked` and flip `status` to 'verified'.
   Nothing outside this file needs to change. That's the design working.
   ═══════════════════════════════════════════════════════════════════════════ */

const REASONS_SHARED = [
  {
    title: 'Start free, today',
    body:
      'A free tier that stays free — unlimited clients and up to 50 active payrolls, ' +
      'with no card and no onboarding call. You can have your book loaded and your ' +
      'first deadlines tracked before anyone would have returned a demo request.',
    icon: '<path d="M11 3l2.4 5.2 5.6.7-4.1 3.9 1.1 5.6L11 15.7 5.9 18.4 7 12.8 2.9 8.9l5.6-.7z"/>',
  },
  {
    title: 'Penny answers, you don’t dig',
    body:
      'Ask “which clients are due this week?” in plain English and get an answer ' +
      'across your whole book. Available on Unlimited and above — no query builder, ' +
      'no exporting to a spreadsheet to find out what you already half-knew.',
    icon: '<circle cx="11" cy="11" r="7.5"/><path d="M8.6 9a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.4"/><path d="M11 16.4h.01"/>',
  },
  {
    title: 'The numbers that run the business',
    body:
      'MRR, revenue per payroll, capacity and client health on the Bureau plan; ' +
      'churn-risk scoring, forecasting and peer benchmarking on Enterprise. Practice ' +
      'commercials, not just task status.',
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
    title: 'Run both for a period',
    body:
      'The free tier covers up to 50 active payrolls indefinitely, so you can run ' +
      'BureauFlow alongside your current setup for as long as you want before deciding.',
  },
];

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
      // Verbatim, from their payroll bureau solution page.
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
        'A sourced, side-by-side comparison of BureauFlow and Changepen for UK ' +
        'payroll bureaus: features, pricing, free tier and who each one suits.',
    },

    faqSchema: false,

    hubBlurb:
      'Both run the practice around your payroll engine rather than replacing it. ' +
      'Changepen leans into the client-facing side — portals, helpdesk, ' +
      'white-labelling. BureauFlow leans into how you start and what the platform ' +
      'tells you about the commercials of your bureau.',

    atAGlance: {
      bureauflow: [
        'Free forever for up to 50 active payrolls',
        'Sign up and be running the same afternoon',
        'Bureau commercials — MRR, capacity, churn risk',
        'Penny, an AI assistant across your whole book',
      ],
      them: [
        'Client portal, helpdesk and white-labelling on the Business plan',
        'Structured change capture to replace email instructions',
        'From £25 per user per month billed annually — no free plan',
        'Demo-led: “we always start with a quick demo”',
      ],
    },

    credit: [
      'Their client-facing layer is genuinely deeper than ours. Customer portals, a ' +
        'structured client helpdesk, customer reviews and white-labelling all ship on ' +
        'the Business plan. BureauFlow has no equivalent today.',
      'Structured change capture is the heart of their product — replacing email as ' +
        'the channel clients send starters, leavers and salary changes through, with ' +
        'every submission logged, timestamped and linked to a payroll.',
      'They publish a named customer outcome: Cheney Payroll Services took on 200 ' +
        'additional payrolls without adding staff after adopting Changepen.',
      'They are explicit about working alongside Sage, BrightPay, IRIS and Moneysoft, ' +
        'and they publish their pricing — both rarer in this market than they should be.',
    ],

    reasons: REASONS_SHARED,

    bestFor: {
      bureauflow: [
        'You want to try it properly before you talk to anyone',
        'You’re a solo consultant or small bureau under 50 active payrolls',
        'You want the commercial picture — revenue per payroll, churn risk, capacity',
        'You’d use an AI assistant to answer questions across your book',
      ],
      them: [
        'Client instructions arriving by email are your single biggest source of risk',
        'You want clients submitting changes through a portal rather than emailing you',
        'You need a structured helpdesk with an audit trail for client payroll queries',
        'You want to white-label the client-facing experience under your own brand',
        'You’re a multi-office firm and need API access to your payroll systems',
      ],
    },

    migration: MIGRATION_SHARED,

    faqs: [
      {
        q: 'Do I have to stop using my payroll software?',
        a: 'No. Neither BureauFlow nor Changepen calculates payroll or files with HMRC. Both sit alongside the engine you already run — BrightPay, IRIS, Staffology, whatever it is. You keep filing exactly as you do now.',
      },
      {
        q: 'Can I try BureauFlow without a demo call?',
        a: 'Yes. The Free plan covers unlimited clients and up to 50 active payrolls, forever, with no card required. You can sign up and import your book without speaking to anyone. Changepen state that they start every engagement with a demo, and their published plans start at £25 per user per month billed annually.',
      },
      {
        q: 'Does BureauFlow have a client portal like Changepen?',
        a: 'No. Changepen’s Business plan includes customer portals, a client helpdesk and white-labelling, and that client-facing layer is deeper than ours today. If clients submitting changes through a portal is the problem you’re solving, that’s a fair reason to choose them. BureauFlow focuses on the bureau side — deadlines, checklists, and the commercial picture across your book.',
      },
      {
        q: 'What does BureauFlow cost?',
        a: SHARED.bureauflowPricing,
      },
      {
        q: 'How did you put this comparison together?',
        a: 'From publicly available information on each company’s own website, on the date shown at the top of the page. Where their material doesn’t establish something either way, we mark it “Not stated” rather than guessing. If we’ve got something wrong, email support@bureauflow.co.uk and we’ll fix it.',
      },
    ],

    // Every cell below traces to one of the four sources at the end of this
    // entry. Rows absent from this map stay `null` — that includes features
    // Changepen has a nav link for (document storage, payroll manuals, contact
    // directory) but whose page content we have not read. A nav label is not a
    // source.
    matrix: buildMatrix({
      rti: { them: false, themSources: ['cp-bureaus'] },
      alongside: { them: true, themSources: ['cp-bureaus', 'cp-guide'] },
      anyengine: { them: true, themSources: ['cp-bureaus', 'cp-guide'] },
      ukbureau: { them: true, themSources: ['cp-bureaus'] },

      free: { them: false, themSources: ['cp-pricing'] },
      selfserve: { them: 'Demo-led — “we always start with a quick demo”', themSources: ['cp-pricing'] },
      pubprice: { them: 'Team and Business published; Enterprise custom', themSources: ['cp-pricing'] },
      unlimitedclients: { them: 'Unlimited usage limits on Enterprise', themSources: ['cp-pricing'] },
      entrylevel: { them: '£25/user/mo (Team)', themSources: ['cp-pricing'] },

      register: { them: 'Payroll Overviews (Team plan and above)', themSources: ['cp-pricing'] },
      scheduling: { them: true, themSources: ['cp-pricing', 'cp-guide'] },
      tasks: { them: true, themSources: ['cp-pricing'] },
      changecapture: { them: true, themSources: ['cp-guide', 'cp-bureaus'] },
      audit: { them: 'Full time-stamped audit trail', themSources: ['cp-guide'] },
      visibility: { them: true, themSources: ['cp-bureaus'] },

      portal: { them: 'Business plan and above', themSources: ['cp-pricing', 'cp-guide'] },
      helpdesk: { them: 'Business plan and above', themSources: ['cp-pricing', 'cp-guide'] },
      whitelabel: { them: 'Business plan and above', themSources: ['cp-pricing'] },
      feedback: { them: 'Business plan and above', themSources: ['cp-pricing'] },

      reporting: { them: true, themSources: ['cp-pricing'] },
      capacity: { them: 'Team workload & capacity visibility', themSources: ['cp-bureaus'] },
      invoicing: { them: true, themSources: ['cp-pricing', 'cp-guide'] },

      integrations: { them: true, themSources: ['cp-guide'] },
      api: { them: 'Enterprise plan', themSources: ['cp-pricing'] },

      pubpricing: { them: true, themSources: ['cp-pricing'] },
    }),

    pricing: {
      bureauflow: SHARED.bureauflowPricing,
      them:
        'Team £25/user/mo billed annually (£35 monthly) · Business £35/user/mo ' +
        'annually (£45 monthly) · Enterprise custom. No free plan.',
      note:
        'Taken from Changepen’s published pricing page. Changepen state that they ' +
        'start every engagement with a demo.',
    },

    sources: [
      {
        id: 'cp-pricing',
        url: 'https://www.changepen.co.uk/pricing',
        accessed: '2026-08-07',
        description: 'Changepen — Pricing',
        kind: 'official',
      },
      {
        id: 'cp-bureaus',
        url: 'https://www.changepen.co.uk/solutions/payroll-bureaus',
        accessed: '2026-08-07',
        description: 'Changepen — Payroll bureau software',
        kind: 'official',
      },
      {
        id: 'cp-solutions',
        url: 'https://www.changepen.co.uk/solutions',
        accessed: '2026-08-07',
        description: 'Changepen — Solutions overview',
        kind: 'official',
      },
      {
        id: 'cp-guide',
        url: 'https://www.changepen.co.uk/payroll-operations-management',
        accessed: '2026-08-07',
        description: 'Changepen — Payroll operations management guide',
        kind: 'official',
      },
    ],
  },

  /* ───────────────────────────────────────── Payflow ───────────────────── */
  {
    slug: 'bureauflow-vs-payflow',
    status: 'provisional',
    factsChecked: '2026-08-07',

    competitor: {
      name: 'Payflow',
      legalName: 'Payflow',
      website: 'https://www.payflow.io',
      // PROVISIONAL — paraphrase from a search result, NOT a verified quote.
      // NOTE: confirm this is payflow.io. The name is also used by a Spanish
      // earned-wage-access fintech (payflow.es) and by PayPal's legacy Payflow
      // payment gateway. Comparing against the wrong company would be a
      // significant error.
      positioning:
        'Payroll service management for payroll service providers — BPOs, ' +
        'accounting firms and larger payroll bureaux.',
      pricingModel: 'unknown',
    },

    meta: {
      title: 'BureauFlow vs Payflow — an honest comparison',
      description:
        'A sourced, side-by-side comparison of BureauFlow and Payflow for UK ' +
        'payroll bureaus: features, pricing, free tier and who each one suits.',
    },

    faqSchema: false,

    hubBlurb:
      'Payflow is aimed at larger payroll operations and BPOs. BureauFlow is built ' +
      'for the smaller end of the market — the solo consultant and the growing ' +
      'bureau — and you can start on it without a sales conversation.',

    atAGlance: {
      bureauflow: [
        'Free forever for up to 50 active payrolls',
        'Self-serve — no demo required to get started',
        'Priced for solo consultants and small bureaus',
      ],
      them: [
        'Payroll service management for BPOs and larger firms',
        'Emphasis on management information and reporting',
        'Feature detail not yet verified — see the note above',
      ],
    },

    credit: [
      'Aimed at scale — BPOs and large payroll operations, a segment BureauFlow ' +
        'does not currently target.',
      'Strong emphasis on management information for payroll service delivery.',
      'Established reputation in the UK payroll services market.',
    ],

    reasons: REASONS_SHARED,

    bestFor: {
      bureauflow: [
        'You’re a solo consultant or a bureau of a handful of people',
        'You want to start today rather than book a demo',
        'You want published pricing you can budget against',
        'You want bureau commercials and an AI assistant over your book',
      ],
      // Build-enforced ≥2 before this page can go 'verified'.
      them: [
        'You’re a BPO or large payroll operation rather than a small bureau',
      ],
    },

    migration: MIGRATION_SHARED,

    faqs: [
      {
        q: 'Do I have to stop using my payroll software?',
        a: 'No. Neither BureauFlow nor Payflow calculates payroll or files with HMRC. Both sit alongside the engine you already run. You keep filing exactly as you do now.',
      },
      {
        q: 'Can I try BureauFlow without a demo call?',
        a: 'Yes. The Free plan covers unlimited clients and up to 50 active payrolls, forever, with no card required. You can sign up and import your book without speaking to anyone.',
      },
      {
        q: 'What does BureauFlow cost?',
        a: SHARED.bureauflowPricing,
      },
      {
        q: 'How did you put this comparison together?',
        a: 'From publicly available information on each company’s own website, on the date shown at the top of the page. Where their material doesn’t establish something either way, we mark it “Not stated” rather than guessing. If we’ve got something wrong, email support@bureauflow.co.uk and we’ll fix it.',
      },
    ],

    // No admissible sources yet — every competitor cell stays null.
    matrix: buildMatrix({}),

    pricing: {
      bureauflow: SHARED.bureauflowPricing,
      them: 'Not yet verified.',
      note:
        'Pricing for Payflow has not been verified against their own published ' +
        'material and is deliberately left blank rather than estimated.',
    },

    sources: [],
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

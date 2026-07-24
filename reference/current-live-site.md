# Current live marketing site — www.thepaybureau.com (Next.js)

Captured pre-rebuild. This is precedence source #1.

## Meta / SEO
- **Title:** `ThePayBureau — The Payroll CRM That Runs Your Bureau For You`
- **Description:** `Professional payroll bureau management for UK specialists. Track HMRC deadlines, manage client checklists, auto-enrolment tracking, and pension compliance. Free forever for individuals.`
- **Canonical:** `https://www.thepaybureau.com` · locale `en_GB` · robots `index, follow` · Twitter `summary_large_image`
- **OG image:** `/og-image.png` (1200×630)
- **Legal entity:** Intelligent Payroll Limited T/A The Pay Bureau. Registered in England and Wales.

## Page structure (in order)
Cookie bar → sticky header/nav → hero → hero dashboard mockup → problem ("Sound Familiar?") → how it works (3 steps) → features → pricing → FAQ → footer (with newsletter) → final CTA band → copyright.

## Copy (verbatim)
**Hero:** eyebrow `For Bureau Owners & Specialists`; H1 `The Payroll CRM That Runs / Your Bureau For You`; sub `Stop juggling spreadsheets. Track every HMRC deadline, manage every client, and tick off every checklist — all from one dashboard. Set up in 60 seconds.`; CTAs `Start Free in 60 Seconds` / `See how it works`.

**Hero dashboard mockup:** `Payroll Status Dashboard` · `March 2026` · `All Systems Live`; stat tiles `12 Complete / 3 In Progress / 2 Due Soon / 1 Overdue`; sample rows: Miller & Associates (OVERDUE, Yesterday!), Brighton Care (DUE SOON, Tomorrow), Clearview Dental (PROCESSING, Today), Johnson Engineering (COMPLETE, Done), Thompson Logistics (ON TRACK, 31st Jan).

**Trust stat strip:** `60s Setup time · 0 Deadlines missed · UK Built & hosted · Free Forever for individuals`.

**Problem — "Sound Familiar?"** sub `You know the feeling.`:
- Spending 3 hours updating spreadsheets that should take 10 minutes
- Waking up at 3am wondering if you missed an RTI submission
- Your manager asks for an update — and you're scrambling through 15 spreadsheets
- Racing against HMRC deadlines with no single view of what's due
- Closing: `There's a better way.`

**How It Works — "Up and running in 3 steps":**
1. Sign up in 60 seconds — Create your account. No credit card, no complex setup.
2. Add your clients — Import via CSV or add one by one. Deadlines auto-generate.
3. Never miss a deadline — Checklists, deadlines, and pension tracking — all handled.

**Features — "Built for how you actually work"** sub `Purpose-built for payroll professionals. No bloat, no complexity — just the tools that matter.`:
1. Payroll Checklists (badge *Popular*) — pre-built templates for every payroll cycle — monthly, weekly, year-end, new starters.
2. HMRC Deadline Tracking — every RTI, FPS, EPS deadline auto-calculated from pay dates.
3. Client Management — one place for every client: contacts, PAYE refs, pension status, billing.
4. Pension & Auto-Enrolment — track AE status, postponement, re-enrolment; alerts before missed declarations.
5. Audit Trail — every change logged; export audit reports in one click.
6. AI Assistant — "Which clients are due this week?" instant answers.

**Final CTA:** `Ready to simplify your payroll bureau?` / `Free forever for individuals. No credit card required.` / `Get started free`.

**Footer:** tagline `Built by payroll professionals, for payroll professionals.`; newsletter `Weekly payroll insights` — input `you@company.com`, `Subscribe`, note `Friday payroll tips & product updates. Unsubscribe anytime.`

## Pricing — "Simple, transparent pricing"
Sub: `Start free. Upgrade when you need more. Paid plans are billed per active team member.`
| Plan | Price | Detail | Note | CTA |
|---|---|---|---|---|
| Free — individual consultants | £0/mo | Free forever · up to 50 active payrolls | — | Start with Free |
| Unlimited (*Most Popular*) — Payroll Pros | £24/user/mo | or £19/user/mo annually (£228/yr) | Less than one missed HMRC penalty · 14-day trial | Try Unlimited Free |
| Bureau — multi-person bureaux | £35/user/mo | or £29/user/mo annually (£348/yr) | Billed per active team member | Start with Bureau |
| Enterprise — larger firms | On application | — | Forecasting, risk scoring, benchmarking & team reviews | Contact us (mailto) |

**Comparison table** (Free / Unlimited / Bureau): Active payrolls (Up to 50 / Unlimited / Unlimited); Payroll tracking & status ✓✓✓; Deadline mgmt with alerts ✓✓✓; CSV import & export ✓✓✓; AI Payroll Assistant ✓✓✓; Training & CPD tracking ✓✓✓; Automated email reminders ✓✓✓; Audit trail (Basic/✓/✓); Advanced team dashboard ✓✓✓; Financial & client health insights ✓✓✓; Priority support ✓✓✓. Footnote: all plans include pension declarations and payroll checklists; Enterprise pricing on application.

> ⚠️ TODO(pricing-verify): reconcile against the running app + Stripe before production cutover. Bureau tier flagged as evolving.

## FAQ (10 questions; answer bodies were client-rendered, not in capture — recover/rewrite + confirm)
What is ThePayBureau? · How is this different from payroll software? · Is it really free? · How long does setup take? · Can I import my existing clients? · What HMRC deadlines do you track? · Is my data secure? · Can my whole bureau use this? · What if I want to leave? · Can I cancel anytime?

## Navigation
Top nav: Features (#features) · Pricing (#pricing) · FAQ (#faq) · Roadmap (/roadmap) · Security (/security) · Log in · Start Free.
Footer — Product: Features, Pricing, Roadmap · Legal: Terms of Service (/terms), Privacy Policy (/privacy), Security (/security) · Company: Support (mailto:support@thepaybureau.com), Log in, Sign up.

## Brand / design tokens
- Fonts: `--font-display` = **DM Serif Display**; `--font-body` = **Plus Jakarta Sans**; `--font-inter` = **Inter** (buttons/pricing/FAQ).
- CSS vars: `--mkt-bg/-alt/-surface/-border/-footer-bg`, `--mkt-text/-2/-3`, `--mkt-purple/-l`, `--mkt-pink`, `--mkt-peach`, `--mkt-success/-bg`, `--mkt-warning`, `--mkt-error/-strong`, `--brand-purple`.
- Hex inline: `#401D6C` (brand purple), `#5B2D99`, `#D4BFF0`, `#1a1a2e`; mockup traffic-lights `#FF5F57 / #FEBC2E / #28C840`.
- Gradients: buttons `linear-gradient(135deg, var(--mkt-purple), var(--mkt-pink))`; hero wash `linear-gradient(180deg, --mkt-bg, --mkt-bg-alt)`; mockup glow `radial-gradient(ellipse, --mkt-purple, transparent 70%)`.
- Icons: **Lucide** (inline SVG). No photography; hero = CSS dashboard mockup. Skip-to-content present.

## CTAs / conversion
- All signup CTAs currently → `https://thepaybureau-kappa.vercel.app/signup` (a raw preview URL — **standardise to `app.thepaybureau.com/signup`** in rebuild). No `?plan=` params.
- Log in → `.../login`. Enterprise → `mailto:support@thepaybureau.com?subject=Enterprise%20plan%20enquiry`. Footer Support → `mailto:support@thepaybureau.com`.
- Newsletter POST (endpoint not exposed). No testimonials/logos (dashboard client names are sample data).
- Stack: Next.js App Router, Radix UI accordion, Tailwind, Lucide.

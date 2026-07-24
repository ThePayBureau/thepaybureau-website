# Old Vite/HTML site (this repo, pre-rebuild) — the design the client likes

Precedence source #3 (use for content the live site lacks: Flow suite, detailed roadmap, form). Design/aesthetic is a reference the client rates highly.

## Pages
- `index.html` — root "Something Big is Coming" bureau-owner waitlist landing.
- `public/pro.html` (`/pro`) — "For Payroll Specialists" product page.
- `public/roadmap.html` (`/roadmap`) — roadmap + pricing.
Routing via `vercel.json`: `/pro`→pro.html, `/roadmap`→roadmap.html.

## Brand palette (the non-negotiable core)
| Role | Hex | Usage |
|------|-----|-------|
| Primary purple | `#401D6C` | logos, headings, primary buttons, links, focus |
| Secondary pink | `#EC385D` | gradient partner, ::selection |
| Accent peach | `#FF8073` | 3rd gradient stop, badges |
| Light wash | `#F8F4FF` | section backgrounds, hero |
Status: success `#22C55E` (+`#16A34A/#15803D`), warning `#F59E0B`. Full gray scale `#F9FAFB`→`#111827` (footer uses `#111827`).
**Signature gradient:** `linear-gradient(135deg, #401D6C, #EC385D)`; 3-stop `#401D6C 0% → #EC385D 50% → #FF8073 100%`. Animated hero title variant with `background-size:300%` + 8s `gradientShift`.

## Typography
Single family **Inter** (300–900), Google Fonts. Stack `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. Display = weight (800) + gradient text-clip, no second typeface. Hero 4.5rem/800, letter-spacing −0.02/−0.03em, line-height 1.1.

## Logo & assets
No image logo — text wordmark + emoji (🏢 index/roadmap, ✅ pro). Favicons = inline SVG emoji data-URIs. Only asset files are default Vite/React SVGs (unused). **Emoji iconography throughout** (🚀🎯🤝🔄📊⏰🔔👥💷🛡️🤖🎓). No OG image asset.

## Product catalogue — "Flow suite" (from src/utils/constants.js)
BRAND = { name: 'The Pay Bureau', tagline: 'Complete Compliance Solutions for Payroll Professionals' }.
| Product | Tagline | Status |
|---|---|---|
| TPRFlow | Pension Re-enrolment & Compliance | live |
| HMRCFlow | HMRC Registration Tracking | development |
| TeamFlow | Employee Onboarding | development |
| EngagementFlow | Client Contract Management | planned |
| AMLFlow | Anti-Money Laundering | planned |
| InvoiceFlow | Automated Billing | planned |
Plus **Penny — Payroll AI Assistant** (Unlimited-tier feature). Section heading: "Complete Flow Suite — Six powerful products that work together."

## Key copy
- index H1: `Something Revolutionary is Coming to Payroll Bureaus`; badge 🚀 "Built by Bureau Owners, for Bureau Owners"; waitlist CTA `Secure My Founding Member Access`; stats `100+ Bureau Owners · 2,100+ UK Bureaus · £0 Free to Start`.
- Problem trio: Fragmented Operations / Flying Blind / Time Drain (60%+ time on admin).
- pro.html H1: `Never Miss Another Payroll Deadline` (+ "And Impress Your Manager While You're At It"); "Free forever — up to 50 clients"; 60-second setup; testimonials (Sarah Mitchell, Jane Davies, Michael Singh, Rachel Thompson — illustrative).
- Voice: UK English, warm, peer-to-peer; footer "Built by payroll specialists, for payroll specialists."

## Pricing (roadmap.html) — "One account that grows with your bureau"
Free → Unlimited → Bureau → Enterprise; "every tier includes everything below it"; all prices exclude VAT.
- Free £0 forever, up to 50 clients — client mgmt, payroll, pension declarations, CSV import/export, bureau dashboard, roles/team invites, audit trail, email support.
- Unlimited from £19/mo — + unlimited clients, Penny AI, CPD/training log, automated scheduled emails.
- Bureau £29/user/mo — + priority support, advanced team dashboard, insights/analytics, org chart.
- Enterprise custom — + AML/KYC, deep analytics/forecasting, fee mgmt/referrals, white-labelling, benchmarking.
> Note: these older numbers differ from the live site (£24/£35 headline, £19/£29 annual). Live site + Stripe are authoritative.

## Roadmap (roadmap.html)
4 states: ✅ Available · 🔨 Coming next · 📋 Planned · 🔭 Future vision. Per-tier feature cards; "Metrics That Grow With You" (4 steps: live dashboard → headline numbers → bureau analytics → predictive). **Future Vision (21 pills):** Client Surveys, Client Health Scores, Client Onboarding, Forms, Custom Fields, Contracts & Engagement Letters, E-signatures, HMRC Auth Dashboard, Time Tracking, Invoicing, Contract Renewal Portal, Custom Workflow Builder, Recurring Task Templates, Anomaly Detection, Internal Team Messaging, Client Communication Log, Document Storage, HMRC API Direct, Multi-Bureau Groups, Accounting Integration, Open API Integrations. Disclaimer: "a direction, not a committed timeline."

## Form / integrations (index.html)
Waitlist "Founding Member" — fields: Full Name, Business Email, Bureau/Company Name.
POST (fetch, `mode:'no-cors'`, JSON, 10s timeout) to Google Apps Script:
`https://script.google.com/macros/s/AKfycbz99qqWV5i5eUn0ul5ho0tB_OExA-gXhmIodQz1xv2GlpraaxZ_Q6xKq830ucUhnQ-4/exec`
Payload: `{ name, email, company, source:'hero_form', timestamp(ISO), formType:'founding_member', userAgent, referrer, pageLoadTime }`. Success hides fields + shows message. GA `gtag` referenced defensively but **no measurement ID installed**.

## Design patterns (the "look" the client likes)
White base + soft lilac `#F8F4FF` washes; purple→pink(→peach) gradient throughline on wordmark/H1s/buttons/CTA bands. Pill everything (50px radius). Glassmorphism (`backdrop-filter: blur(20-30px)`) on header/form/stat cards. Full-width gradient CTA bands (white text). Card hover-lift (`translateY(-5→-10px)` + shadow), animated top-border reveal. Emoji icons. 3D dashboard mockup in pro.html (`perspective(1000px) rotateY(-5deg)`, straightens on hover; Monday.com-style status table). Soft large low-opacity shadows. Container max 1200px, 24px gutters. Sticky blur header (scroll-shrink), floating bottom-right CTA after 800px. CSS-only animations (fadeInUp, float, gradientShift) + IntersectionObserver reveal.

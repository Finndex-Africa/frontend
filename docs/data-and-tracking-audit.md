# Data, tracking and third-party audit

Last reviewed: 11 September 2026.

Scope: the Next.js frontend in this repository. The backend API
(`NEXT_PUBLIC_API_URL`) is a separate service and is not covered here.

Operating jurisdictions: Rwanda and Liberia. The controlling regime is Rwanda's
Law No. 058/2021 relating to the protection of personal data and privacy. GDPR
is not treated as applying, on the basis that the EU/UK is not a target market.
If that changes, this document and the Privacy Policy both need revisiting.

---

## 1. Analytics and tracking scripts

| Script | Loads when | What it collects | Where it goes |
|---|---|---|---|
| Google Analytics 4 (`@next/third-parties`) | Only after the visitor accepts **analytics** in the cookie banner | Page views, plus the custom events in `src/lib/analytics.ts`: searches, filters, listing views, bookmarks, shares, booking funnel steps, WhatsApp/contact clicks, sign-up and login, listing create/edit/unpublish, review submissions, pricing clicks, identity-verification funnel, scroll depth. Google additionally derives approximate location from IP. | Google LLC, United States |
| Sentry error reporting (`src/instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`) | Always | Exception type, stack trace, the route it happened on, browser and release metadata. `sendDefaultPii` is **off**, so IP address, request headers and cookies are not attached. | Functional Software, Inc. (sentry.io), United States |
| Sentry Session Replay | Only after **analytics** consent | A masked reconstruction of the page and interactions, for 10% of sessions and 100% of sessions with an error. `maskAllText`, `maskAllInputs` and `blockAllMedia` are set, so text, form fields and images are masked in the browser before upload. | Same as above |

### Enforcement points

- `src/lib/consent.ts` is the single source of truth. Consent lives in
  localStorage under `findafriq_cookie_consent`, versioned so the banner can be
  re-shown if categories change.
- `src/components/global/ConsentedAnalytics.tsx` refuses to render the GA
  component until `hasAnalyticsConsent()` is true, so gtag.js is never
  downloaded by visitors who decline.
- `src/lib/analytics.ts` re-checks consent inside `sendEvent`, so a stray call
  cannot bypass the gate.
- Session Replay is attached lazily and only after the same consent check.

### Known gaps

- The banner offers a **marketing** category, but nothing currently reads it.
  It is a forward-declaration, not a live control. Stated as such in the Cookie
  Policy.
- The **preferences** toggle is likewise not enforced: `NEXT_LOCALE` and
  `findafriq_currency` are written whenever the visitor changes language or
  currency, regardless of the toggle. Both are first-party, functional and
  low-risk, but the toggle currently promises more control than it delivers.
  Either enforce it or relabel it.

---

## 2. Third-party embeds and data recipients

| Service | Used for | Cookies / storage | Data transferred |
|---|---|---|---|
| **YouTube** (`src/components/ui/LiteYouTube.tsx`) | Video embeds | None until the visitor presses play. The iframe uses `youtube-nocookie.com`. | The preview thumbnail is fetched from `i.ytimg.com` on page load, which reveals the visitor's IP address to Google before any interaction. |
| **DigitalOcean Spaces** | Listing images | None | IP address, when images load |
| **Stream Chat** (`stream-chat-react`) | In-platform messaging | Sets its own storage once signed in | Message content, user ID and presence. A substantial processor: message bodies leave our infrastructure. |
| **OpenAI** (`src/app/api/assistant/route.ts`) | AI assistant | None (server-side) | The text of the assistant conversation, last `MAX_TURNS` messages. Called server-side, so the visitor's IP is not exposed. Users can paste anything into a chat box, so treat this as a route for unpredictable personal data. |
| **Nominatim / OpenStreetMap** (`src/app/api/geocode/route.ts`) | Address geocoding | None | Proxied through our own server, so OpenStreetMap receives the query but **not** the visitor's IP. Good pattern; keep it. |
| **Fonts** | Whitney, self-hosted via `next/font/local` | None | None. No font CDN is contacted. See the licensing note in section 4. |
| **Google Analytics / Sentry** | See section 1 | See section 1 | See section 1 |

Nothing loads from a CDN that was not deliberately chosen. There are no
advertising pixels, no Meta/TikTok/LinkedIn tags, no session-recording tools
beyond Sentry, and no tag manager.

---

## 3. Cookies and browser storage set by this site

Strictly necessary:

- `token` (cookie) and `token` / `user` (local and session storage): the signed-in
  session.
- `findafriq_cookie_consent` (local storage): the consent choice itself.

Preferences:

- `NEXT_LOCALE` (cookie, 1 year): language.
- `findafriq_currency` (cookie, 1 year, SameSite=Lax): USD or RWF.
- `testing-disclaimer-dismissed` (local storage): dismissal of the platform notice.

Analytics, only after consent:

- `_ga`, `_ga_*` (up to 2 years): Google Analytics.

These tables are mirrored in the user-facing Cookie Policy
(`/routes/cookie-policy`). **If you add a cookie, update both.**

---

## 4. Open risks

1. **Whitney font licensing.** `Whitney-Font/` holds 19 `.otf` files carrying
   "Copyright (C) 2004 Hoefler & Frere-Jones Typography, Inc." with no licence
   file in the repo. Whitney is a commercial retail typeface. Desktop licences
   normally forbid web embedding, and `next/font/local` serves these files to
   every visitor. Confirm a webfont licence exists, or replace the typeface.
   Monotype (which now owns the library) does pursue this.
2. **AI-generated imagery.** `public/images/properties/bg.jpeg` (the homepage
   hero) and `public/images/buysell/bg.jpeg` show clear generation artefacts.
   Both depict scenes presented as real.
3. **`legal.address` is "Kigali, Rwanda"** with no street address, and no
   company registration number is published anywhere. Rwandan consumer and
   e-commerce rules expect identifiable trader details.
4. **`footer.copyright` claims "FindAfriq, Inc."** Confirm that this is the
   actual registered entity and that "Inc." is accurate.
5. **Rwanda data-controller registration.** Law 058/2021 requires controllers
   processing personal data to register with the National Cyber Security
   Authority. Confirm this is done.
6. **Cross-border transfers.** GA4, Sentry, Stream Chat and OpenAI all process
   data outside Rwanda. Article 48 of Law 058/2021 conditions transfers abroad.
   The Privacy Policy's transfers section is currently generic and names no
   recipient; it should name them.

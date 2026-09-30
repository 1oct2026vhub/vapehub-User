# VapeHub User Frontend — Project Documentation

**Repository:** `vapehub-User`  
**Application path:** `front-end/`  
**Package name:** `vape-hub`  
**Branch baseline:** `staging-v5`  
**Document date:** 28 September 2026  

This document describes the full customer storefront project: architecture, features, routes, integrations, environment, and deployment.

---

## 1. Overview

VapeHub User Frontend is the **customer-facing e-commerce storefront** for VapeHub (UK online vape store). Customers browse products/categories/brands, manage cart and checkout, pay via Worldpay (default) or Viva Wallet, and manage their account (orders, addresses, loyalty, referrals).

It is a **Next.js App Router** application that talks to a separate **Backend API**. Content and catalogue are largely CMS-driven via Admin + Backend.

### Sibling systems

| System | Role |
|--------|------|
| **User FE** (this project) | Storefront UI, session, cart UX, checkout UX, SEO |
| **Backend** | REST API, orders, payments webhooks, stock, emails, ShipStation |
| **Admin** | CMS for products, categories, menus, blogs, deals, legal pages |

Default API base (code fallback): `https://api-staging.vapehub.co.uk`

---

## 2. Tech stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 15.1.9** (App Router, Turbopack in dev) |
| Language | **TypeScript** |
| UI | **React 19**, **NextUI**, **Tailwind CSS**, Framer Motion |
| Auth | **NextAuth v4** (Credentials provider → Backend login) |
| Forms / validation | React Hook Form resolvers, **Zod** |
| Toasts | Sonner |
| Carousels | react-slick / slick-carousel |
| Analytics | Google Analytics + Google Tag Manager |
| Maps / address | Google Places Autocomplete |
| SEO crawlers | **Prerender.io** (middleware) |
| Package manager | **npm** |
| Process manager (staging) | **PM2** (`Frontend`) |
| CI | **Jenkins** + **SonarQube** |

### Key scripts (`front-end/package.json`)

```bash
npm run dev      # next dev --turbopack
npm run build    # next build
npm run start    # next start
npm run lint     # next lint
```

---

## 3. Repository layout

```
vapehub-User/                          # Git repo root
├── Jenkinsfile                        # Sonar + staging deploy (staging-v5)
├── sonar-project.properties           # Sonar project: VapeHub User
├── README.md                          # Repo-level notes (legacy template may exist)
├── GOOGLE_PLACES_API_SERVICES.md
├── GOOGLE_PLACES_API_STATUS.md
└── front-end/                         # ← Next.js application
    ├── package.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── public/
    ├── README.md                      # Setup & deploy quick guide
    └── src/
        ├── app/                       # Routes (App Router)
        ├── components/                # Shared UI
        ├── lib/                       # API, auth, contexts, SEO, utils
        ├── providers/                 # Global React providers
        └── middleware.ts              # Auth, Prerender, slug redirects, edge cache
```

---

## 4. Application architecture

### 4.1 High-level flow

```
Browser
  → Next.js Middleware (Prerender bots | auth gate | slug-relation redirects | listing cache headers)
  → App Router pages (RSC + client components)
  → Server actions / fetch helpers (src/lib/server.actions.ts, services, cached.server.ts)
  → Backend REST API (NEXT_PUBLIC_VAPE_HUB_API_BASE_URL)
```

### 4.2 Global providers

`src/providers/GlobalProvider.tsx` wraps the app with:

1. **NextUIProvider** — UI system + client navigation  
2. **SessionProvider** — NextAuth session  
3. **AgeVerificationProvider** — 18+ gate UX  
4. **CartProvider** — cart state (guest + logged-in)  
5. **NotificationProvider** — in-app notifications  
6. **SubscriptionProvider** — mail subscription state  

Additional contexts used on specific flows: `CheckoutContext`, `AddressContext`, `ProductDataContext`, `ReviewContext`.

### 4.3 Store shell layout

`src/app/(store)/layout.tsx` loads shared chrome for all store pages:

- Header mega menu (`getHeaderMegaMenu`)
- Flash news
- Footer menu
- `Header`, `Footer`, `SitewideTrustStrip`
- Soft-404 aware metadata (`x-vapehub-soft404` header from middleware)

Root layout (`src/app/layout.tsx`): fonts (Oswald + Open Sans), GTM/GA, Sonner toaster, `GlobalProvider`.

### 4.4 Middleware responsibilities

File: `src/middleware.ts`

| Concern | Behaviour |
|---------|-----------|
| Skip | `/_next`, `/api`, static files, robots/sitemap |
| Prerender | Serve pre-rendered HTML to search/social/AI bots when token configured |
| Auth | Redirect unauthenticated users away from protected account routes |
| Slug relation | Call Backend slug API → **301/302** redirects or soft **404** rewrite to `/page-not-found` |
| Edge cache | Listing-friendly cache headers for eligible paths |

Protected path prefixes (must be logged in):

- `/my-account/orders`
- `/my-account/personal-info`
- `/my-account/referrals`
- `/my-account/addresses`
- `/my-account/security`
- `/my-account/loyalty-points`

### 4.5 Data / API layer

Central route map: **`src/lib/api-routes.ts`** (`API_ROUTES`).

Server-side calls typically go through:

- `src/lib/server.actions.ts` — server actions for pages/layouts  
- `src/lib/auth.actions.ts` — auth helpers  
- `src/lib/cached.server.ts` / `src/lib/cache/` — caching helpers  
- `src/lib/services/` — domain services  
- `src/lib/request.config.ts` — HTTP request helpers  

Frontend route constants: **`src/lib/routes.ts`** (`ROUTES`).

---

## 5. Feature map

### 5.1 Catalogue & browsing

| Feature | Routes / notes |
|---------|----------------|
| Home | `/` — carousel, deals, new products, blogs, trust/testimonials, home blocks |
| Shop / PLP / PDP | Catch-all `/(product-listing)/[...slug]` — category, product, CMS slugs |
| Brands list | `/brands` |
| Brand PLP | `/brand/[slug]` |
| New products | `/new-products` |
| Coming soon | `/coming-soon` |
| Deals hub | `/vapehub-deals` |
| Product deals | `/product-deals`, `/product-deals/[slug]` |
| Filters | Variant/attribute filters, price, sort (`ProductVariantFilter`, filter sidebars) |
| Buying guides | Category/brand buying guides + related guides/cards from Backend HTML |
| Related products | More like this, linked products, suggestions |

### 5.2 Cart & checkout

| Feature | Routes / notes |
|---------|----------------|
| Cart | `/shopping-cart` — guest + authenticated cart sync |
| Stock validation | Backend `check-stock` before payment |
| Coupons | Apply coupon (user + guest endpoints) |
| Guest deals | `calculate-guest-deals` |
| Checkout | `/checkout` — UK address/phone validation (Zod), age confirmation |
| Shipping methods | `/api/shipping-methods` BFF + Backend shipping APIs |
| Payments | **Worldpay** (default) or **Viva Wallet** via env toggle |
| Guest checkout | `GUEST_CHECKOUT_AND_ORDER` |
| Payment result | `/payment-success`, `/payment-failed` |
| Retry / continue payment | Backend order retry + stock check endpoints |

### 5.3 Account & loyalty

| Feature | Routes |
|---------|--------|
| Login / register | `/my-account` |
| Forgot / reset password | `/my-account/lost-password`, `/my-account/reset-password` |
| Email verify | `/my-account/verify-email` |
| Orders | `/my-account/orders` |
| Order details | `/order-details/[id]` |
| Personal info | `/my-account/personal-info` |
| Addresses | `/my-account/addresses` (+ Google Places) |
| Security / password | `/my-account/security` |
| Loyalty points | `/my-account/loyalty-points`, public `/loyalty-points` |
| Referrals | `/my-account/referrals`, `/refer-a-friend` |
| Notifications | Header notification actions via notification APIs |

### 5.4 Content & marketing

| Feature | Routes |
|---------|--------|
| Blogs | `/blogs` (+ author filter query) |
| FAQ | `/faq` |
| Contact | `/contact` |
| Social | `/social-media` |
| Legal pages | `/delivery-information`, `/privacy-policy`, `/returns-policy`, `/terms-conditions` (Backend legal-content) |
| Mail subscribe / unsubscribe | Subscribe APIs + `/unsubscribe` |
| Flash news / promo banners | Home + header |

### 5.5 SEO & discovery

| Feature | Implementation |
|---------|----------------|
| Metadata / canonical | Layouts + page-level metadata; soft-404 clears canonical |
| JSON-LD | `JsonLd`, `seo-schema.ts`, `src/lib/seo/` |
| Sitemaps | Proxied/generated under `/sitemap.xml`, `/sitemap/*.xml` |
| Robots | `/robots.txt` route |
| Prerender.io | Middleware bot detection → prerender service |
| Trailing slash | Enabled in `next.config.ts` |
| Images | `images.unoptimized: true` (serve uploaded formats as-is) |

---

## 6. Route reference (storefront pages)

### Public / marketing

| Path | Purpose |
|------|---------|
| `/` | Home dashboard |
| `/shop` | Shop entry |
| `/new-products` | New in |
| `/coming-soon` | Coming soon products |
| `/vapehub-deals` | Deals listing |
| `/product-deals`, `/product-deals/[slug]` | Deal detail / products |
| `/brands`, `/brand/[slug]` | Brands |
| `/blogs` | Blog listing / content |
| `/faq` | FAQs |
| `/contact`, `/social-media` | Contact |
| `/loyalty-points` | Loyalty info page |
| `/delivery-information`, `/privacy-policy`, `/returns-policy`, `/terms-conditions` | Legal |
| `/unsubscribe` | Email unsubscribe success/flow |
| `/page-not-found` | Soft 404 UI (middleware rewrite) |

### Commerce

| Path | Purpose |
|------|---------|
| `/[...slug]` (product-listing group) | Dynamic category / product / CMS slug pages |
| `/shopping-cart` | Cart |
| `/checkout` | Checkout |
| `/payment-success` | Payment OK |
| `/payment-failed` | Payment failed |

### Auth & account

| Path | Purpose |
|------|---------|
| `/my-account` | Login / account hub |
| `/my-account/lost-password` | Forgot password |
| `/my-account/reset-password` | Reset password |
| `/my-account/verify-email` | Verify email |
| `/my-account/orders` | Order history (protected) |
| `/my-account/personal-info` | Profile (protected) |
| `/my-account/addresses` | Addresses (protected) |
| `/my-account/security` | Password/security (protected) |
| `/my-account/loyalty-points` | Loyalty (protected) |
| `/my-account/referrals` | Referrals (protected) |
| `/order-details/[id]` | Order detail |
| `/refer-a-friend` | Referral flow |

### Next.js API routes (BFF / auth)

| Path | Purpose |
|------|---------|
| `/api/auth/[...nextauth]` | NextAuth |
| `/api/auth/complete-email-verification` | Email verification completion |
| `/api/places/details` | Google Places details proxy |
| `/api/shipping-methods` | Shipping methods helper |
| `/api/reviews` | Reviews helper |
| `/api/health` | Health check |
| `/api/debug/product-slug` | Debug (non-prod use) |
| `/api/stripo-token` | Stripo token (email builder related) |

---

## 7. Commerce & payment flow (frontend view)

```
Cart (guest or user)
  → Stock validation / guest deal calculation
  → Checkout form (UK phone/postcode, age 18+, shipping ± billing)
  → Place order via Backend checkout APIs
  → Redirect to Worldpay Smart Checkout OR Viva Wallet
  → Return to /payment-success or /payment-failed
  → Backend webhooks finalize payment, stock, emails (Backend responsibility)
```

Payment method selection:

- Env: `NEXT_PUBLIC_CHECKOUT_PAYMENT_METHOD=worldpay|vivawallet`
- Default: **Worldpay** (`src/lib/config/checkout.config.ts`)

Worldpay config keys: `NEXT_PUBLIC_WORLDPAY_*` in `src/lib/config/worldpay.config.ts`.

---

## 8. Product listing / PDP (catch-all)

Primary implementation:

- `src/app/(store)/(product-listing)/[...slug]/page.tsx`
- Helpers: `page.helpers.ts`
- Components under `(product-listing)/_components/` (filters, type cards, buying guide layout, etc.)

Responsibilities typically include:

- Resolve slug to category vs product vs CMS page (with Backend slug APIs)
- Filters, pagination, sorting
- Variant selection / discontinued handling
- Buying guide HTML / related collection cards
- SEO metadata and structured data
- Deals / notify-me / reviews

Brand listing has a parallel path under `(brand-list)/`.

---

## 9. Key `src/lib` modules

| Path | Role |
|------|------|
| `api-routes.ts` | All Backend URL builders |
| `routes.ts` | Frontend path constants |
| `server.actions.ts` | Server actions used by pages |
| `auth.actions.ts` / `config/auth.config.ts` | Session helpers, redirects |
| `context/*` | Cart, checkout, age gate, notifications, etc. |
| `config/*` | Domain configs (checkout, worldpay, brand, deals, header, …) |
| `prerender.ts` | Prerender.io integration |
| `edge-cache.ts` | Listing edge cache header helpers |
| `site-url.ts` | Resolve public site URL from env |
| `seo/`, `seo-schema.ts` | SEO helpers / schema |
| `carousel-image-url.ts`, `media-image-url.ts` | Absolute media URL resolution |
| `product/`, `product-*.ts` | Product card pricing, description, reviews |
| `validators/` | Shared validation |
| `hooks/` | Client hooks (e.g. Viva Wallet) |
| `services/` | Service-layer wrappers |
| `analytics/` | Analytics helpers |
| `cache/`, `cached.server.ts` | Caching |

---

## 10. Shared UI (`src/components`)

Major building blocks include:

- **Chrome:** `Header`, `MegaMenu`, `MobileMenu`, `Footer`, `FooterMobile`, trust strips  
- **Catalogue:** `ProductCard`, `CategoryCard`, `BrandCard`, `DealCard`, listing/filter components, sliders  
- **Cart:** `ShoppingCartCard`, drawer variants, `CouponForm`, `ShippingProgress`, `QuantitySelector`  
- **Reviews / social proof:** `ReviewCard`, `ReviewForm`, testimonials  
- **SEO:** `JsonLd`, `SEO/*`  
- **Integrations:** `GoogleAnalytics`, `GoogleTagManager`, `GoogleMapsScript`, `GooglePlacesAutocomplete`  
- **Forms:** `InputField`, `InputForm`, `FormCheckbox`, etc.  
- **UI primitives:** `components/ui`, `common`

---

## 11. Environment variables

Create `front-end/.env.local` (never commit secrets).

### Required

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_VAPE_HUB_API_BASE_URL` | Backend API base; **required** (middleware throws if missing) |

### Site / auth URLs

| Variable | Purpose |
|----------|---------|
| `NEXTAUTH_URL` | Canonical URL for NextAuth / server absolute links |
| `NEXT_PUBLIC_AUTH_URL` | Public storefront URL |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for SEO helpers |

### Payments

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CHECKOUT_PAYMENT_METHOD` | `worldpay` (default) or `vivawallet` |
| `NEXT_PUBLIC_WORLDPAY_TEST_MODE` | `true` / `false` |
| `NEXT_PUBLIC_WORLDPAY_MERCHANT_CODE` | Merchant code |
| `NEXT_PUBLIC_WORLDPAY_INSTALLATION_ID` | Installation id |
| `NEXT_PUBLIC_WORLDPAY_PAYMENT_URL` | Payment service URL |
| `NEXT_PUBLIC_WORLDPAY_SMART_CHECKOUT_URL` | Smart checkout URL |
| `NEXT_PUBLIC_WORLDPAY_SCRIPT_URL` | Checkout script URL |
| `VIVA_WALLET_API_BASE_URL` | Viva checkout base (optional demo default) |

### Analytics, maps, assets

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager |
| `NEXT_PUBLIC_MEASUREMENT_ID` | Google Analytics measurement id |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Places Autocomplete |
| `NEXT_PUBLIC_CAROUSEL_ASSET_BASE_URL` | Optional CDN for carousel/media |

### Prerender.io

| Variable | Purpose |
|----------|---------|
| `PRERENDER_TOKEN` | Production token |
| `PRERENDER_SERVICE_URL` | Optional override (default `https://service.prerender.io`) |
| `PRERENDER_ENABLED` | `true` to force enable outside production |

Exposed to Edge middleware via `next.config.ts` `env` block: `PRERENDER_*`, `NEXTAUTH_URL`, `NEXT_PUBLIC_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`.

### Debug (optional)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_DEBUG_PDP_REVIEWS` / `DEBUG_PDP_REVIEWS` | Extra PDP review logging |

---

## 12. Local development

```bash
git checkout staging-v5
cd front-end
npm install
# create .env.local with at least NEXT_PUBLIC_VAPE_HUB_API_BASE_URL + site URLs
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Prerequisites:** Node.js 20+, npm, reachable Backend API.

**Build locally:**

```bash
export NODE_OPTIONS=--max-old-space-size=4096   # recommended; matches Jenkins
npm run build
npm run start
```

---

## 13. Staging deployment (`staging-v5`)

Configured in repo-root **`Jenkinsfile`**:

1. **SonarQube Analysis** using `sonar-project.properties`  
2. **Deploy** only when `BRANCH_NAME == staging-v5`:
   - SSH to host
   - `cd /var/www/vapehub/User/ && git pull`
   - `cd front-end && npm install && NODE_OPTIONS=--max-old-space-size=4096 npm run build`
   - `pm2 restart 'Frontend'`

Other branches skip deploy.

### Manual equivalent on staging host

```bash
cd /var/www/vapehub/User/
git pull
cd front-end/
npm install
export NODE_OPTIONS=--max-old-space-size=4096
npm run build
pm2 restart 'Frontend'
```

Ensure PM2/host env has API URL, auth/site URLs, payment keys, Places key, and `PRERENDER_TOKEN`.

---

## 14. Configuration highlights (`next.config.ts`)

- `trailingSlash: true`
- Loads `.env` / `.env.local` via `loadEnvConfig` before reading Prerender vars
- Edge-visible `env` map for Prerender + site URLs
- `images.unoptimized: true` + permissive remote HTTPS patterns (incl. S3 host)
- Experimental: `scrollRestoration: false`, `authInterrupts: true`

---

## 15. Related documentation in this repo

| File | Contents |
|------|----------|
| `front-end/README.md` | Concise setup + deploy guide |
| `GOOGLE_PLACES_API_SERVICES.md` | Places API services notes |
| `GOOGLE_PLACES_API_STATUS.md` | Places API status notes |
| `Jenkinsfile` | CI/CD source of truth for staging-v5 |
| `sonar-project.properties` | Sonar project key/name |

---

## 16. Conventions & caveats

- **Do not commit** `.env` / `.env.local` or secrets.  
- Storefront depends on Backend being up; many pages degrade gracefully when optional fetches fail (e.g. layout `Promise.allSettled`).  
- Soft 404s are intentional: middleware rewrites unknown/invalid slugs to `/page-not-found` with HTTP 404.  
- Slug redirects must not be cached aggressively (middleware sets `no-store` on redirect responses).  
- Age verification is enforced in checkout schema and via `AgeVerificationProvider`.  
- Currency display defaults to **£** (`DEFAULT_CURRENCY_SYMBOL` in app config).  

---

## 17. Quick mental model

> **Next.js storefront** that renders CMS/API-driven catalogue pages, keeps cart/session client-side with Backend sync, runs checkout with UK validation, redirects to Worldpay/Viva for payment, and optimizes crawlers via Prerender + sitemaps — while Jenkins deploys **`staging-v5`** to PM2 on the staging host.

For day-to-day setup commands, see also `front-end/README.md`.

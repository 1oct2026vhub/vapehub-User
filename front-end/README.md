This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerender.io (SEO for crawlers)

This app proxies search, social, and AI crawlers to [Prerender.io](https://prerender.io/) via Next.js middleware.

1. Create a Prerender.io account and add your production domain.
2. Copy your token from **Security and Access → Prerender Token** in the [dashboard](https://dashboard.prerender.io/security/prerender-token).
3. Set on the production server (PM2 / hosting env):

```bash
PRERENDER_TOKEN=your_token_here
```

Prerender runs automatically when `NODE_ENV=production` and `PRERENDER_TOKEN` is set. For local testing, also set `PRERENDER_ENABLED=true`.

Verify after deploy ([testing guide](https://docs.prerender.io/docs/how-to-test-your-site-after-you-have-successfully-validated-your-prerender-integration)):

```bash
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1)" -I "https://your-domain.com/some-page/"
```

Look for `X-Redirected-From` in the response headers.

Implementation: `src/lib/prerender.ts`, wired in `src/middleware.ts`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

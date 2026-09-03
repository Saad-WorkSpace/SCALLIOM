# SCALLIOM

SCALLIOM is a polished concept storefront for the brand's First Edition heavyweight tees. It includes responsive product presentation, front/back garment views, detail photography, product specifications, a size guide, bag and checkout flows, brand storytelling, policies, and newsletter presentation.

## Live site

[scalliom-git-main-pr0ject-2026.vercel.app](https://scalliom-git-main-pr0ject-2026.vercel.app/)

[saad-workspace.github.io/SCALLIOM](https://saad-workspace.github.io/SCALLIOM/)

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Build

```bash
npm run build
```

GitHub Actions publishes the static output in `dist/client` to GitHub Pages whenever `main` is updated.

## Stripe checkout

The storefront creates Stripe Checkout Sessions through Vercel Functions. Add `STRIPE_SECRET_KEY` to the Vercel project's encrypted environment variables. Use a test-mode key until catalog, fulfillment, support, and legal policies are ready for real orders. Never add a real key to this repository.

## Storefront status

The bag and Stripe-hosted checkout are wired for test-mode validation. Account creation, newsletter delivery, reviews, inventory synchronization, carrier-calculated shipping, and fulfillment still require production services before launch.

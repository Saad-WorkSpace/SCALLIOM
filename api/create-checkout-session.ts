import Stripe from 'stripe';
import {
  corsHeaders,
  getReturnBase,
  getTrustedOrigin,
  jsonResponse,
} from './_shared.js';

const catalog = {
  'heavy-tee': {
    name: 'Heavy Tee',
    unitAmount: 5000,
    weight: '450 GSM',
    backLogoOptional: true,
    colors: [
      { color: 'Ink', displayName: 'Black', image: 'scallium-black-front.png' },
      { color: 'Dune', displayName: 'Dune', image: 'scallium-dune-front.png' },
      { color: 'Bone', displayName: 'Bone', image: 'scallium-bone-front.png' },
    ],
  },
  'baggy-sweatpants': {
    name: 'Baggy Sweatpants',
    unitAmount: 7500,
    weight: '500 GSM',
    backLogoOptional: false,
    colors: [
      {
        color: 'Black',
        displayName: 'Black',
        image: 'scallium-sweatpants-black-front-hd.webp',
      },
      {
        color: 'Brown',
        displayName: 'Brown',
        image: 'scallium-sweatpants-brown-front-hd.webp',
      },
      {
        color: 'Bone',
        displayName: 'Bone',
        image: 'scallium-sweatpants-bone-front-hd.webp',
      },
    ],
  },
  'relaxed-shorts': {
    name: 'Relaxed Shorts',
    unitAmount: 5000,
    weight: '450 GSM',
    backLogoOptional: false,
    colors: [
      {
        color: 'Black',
        displayName: 'Black',
        image: 'scallium-shorts-black-front-hd.webp',
      },
      {
        color: 'Brown',
        displayName: 'Brown',
        image: 'scallium-shorts-brown-front-hd.webp',
      },
      {
        color: 'Bone',
        displayName: 'Bone',
        image: 'scallium-shorts-bone-front-hd.webp',
      },
    ],
  },
} as const;

const validSizes = new Set(['S', 'M', 'L', 'XL']);
const validBackLogoChoices = new Set(['wordmark', 'plain']);
type ProductId = keyof typeof catalog;

type CartInput = {
  productId?: string;
  colorIndex?: number;
  size?: string;
  backLogo?: string;
  quantity?: number;
};

const checkoutHandler = {
  async fetch(request: Request) {
    const origin = getTrustedOrigin(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed.' }, 405, origin);
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return jsonResponse(
        { error: 'Stripe checkout is not configured yet.' },
        503,
        origin,
      );
    }

    try {
      const body = (await request.json()) as { items?: CartInput[] };
      if (
        !Array.isArray(body.items) ||
        body.items.length === 0 ||
        body.items.length > 12
      ) {
        return jsonResponse(
          { error: 'Your bag is empty or invalid.' },
          400,
          origin,
        );
      }

      let totalQuantity = 0;
      const normalizedItems = body.items.map((item) => {
        const productId = String(item.productId ?? 'heavy-tee') as ProductId;
        const colorIndex = Number(item.colorIndex);
        const quantity = Number(item.quantity);
        const size = String(item.size ?? '');
        const product = catalog[productId];
        const colorway = product?.colors[colorIndex];
        const backLogo = String(item.backLogo ?? 'wordmark');

        if (
          !product ||
          !colorway ||
          !validSizes.has(size) ||
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > 10 ||
          (product.backLogoOptional && !validBackLogoChoices.has(backLogo))
        ) {
          throw new Error('INVALID_CART');
        }

        totalQuantity += quantity;
        return { productId, product, colorway, quantity, size, backLogo };
      });

      if (totalQuantity > 20) {
        return jsonResponse(
          { error: 'Limit your checkout to 20 pieces.' },
          400,
          origin,
        );
      }

      const returnBase = getReturnBase(origin);
      const stripe = new Stripe(secretKey);
      const imageOrigin = new URL(request.url).origin;
      const canUseProductImages = imageOrigin.startsWith('https://');

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'payment',
        submit_type: 'pay',
        branding_settings: {
          display_name: 'SCALLIOM',
          background_color: '#f4efe6',
          button_color: '#171512',
          border_style: 'rectangular',
          font_family: 'raleway',
        },
        allow_promotion_codes: true,
        line_items: normalizedItems.map(
          ({ productId, product, colorway, quantity, size, backLogo }) => ({
            quantity,
            adjustable_quantity: { enabled: true, minimum: 1, maximum: 10 },
            price_data: {
              currency: 'usd',
              unit_amount: product.unitAmount,
              tax_behavior: 'exclusive',
              product_data: {
                name:
                  productId === 'heavy-tee'
                    ? `Classic ${colorway.displayName} ${product.name}`
                    : `${colorway.displayName} ${product.name}`,
                description: `${colorway.color} / Size ${size} / ${product.weight}${product.backLogoOptional ? ` / ${backLogo === 'plain' ? 'Plain back' : 'SCALLIOM back'}` : ''}`,
                tax_code: 'txcd_30011000',
                metadata: { productId, color: colorway.color, size, backLogo },
                ...(canUseProductImages
                  ? { images: [`${imageOrigin}/products/${colorway.image}`] }
                  : {}),
              },
            },
          }),
        ),
        metadata: {
          collection: 'SCALLIOM Edition 001',
          source: origin.includes('github.io') ? 'github-pages' : 'vercel',
        },
        success_url: `${returnBase}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnBase}?checkout=cancelled#shop`,
      };

      const session = await stripe.checkout.sessions.create(sessionParams);

      if (!session.url) {
        throw new Error('MISSING_CHECKOUT_URL');
      }

      return jsonResponse({ url: session.url }, 200, origin);
    } catch (error) {
      const isInvalidCart =
        error instanceof Error && error.message === 'INVALID_CART';
      if (!isInvalidCart) {
        const stripeError = error as {
          code?: string;
          message?: string;
          type?: string;
        };
        console.error('Stripe checkout session creation failed', {
          code: stripeError.code,
          message: stripeError.message,
          type: stripeError.type,
        });
      }
      return jsonResponse(
        {
          error: isInvalidCart
            ? 'One or more bag items are invalid.'
            : 'Checkout could not be started. Please try again.',
        },
        isInvalidCart ? 400 : 500,
        origin,
      );
    }
  },
};

export default checkoutHandler;

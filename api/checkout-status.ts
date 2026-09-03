import Stripe from 'stripe';
import { corsHeaders, getTrustedOrigin, jsonResponse } from './_shared.js';

const checkoutStatusHandler = {
  async fetch(request: Request) {
    const origin = getTrustedOrigin(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed.' }, 405, origin);
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return jsonResponse({ error: 'Stripe checkout is not configured yet.' }, 503, origin);
    }

    const sessionId = new URL(request.url).searchParams.get('session_id') ?? '';
    if (!/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) {
      return jsonResponse({ error: 'Invalid checkout session.' }, 400, origin);
    }

    try {
      const stripe = new Stripe(secretKey);
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return jsonResponse({
        amountTotal: session.amount_total,
        customerEmail: session.customer_details?.email ?? session.customer_email,
        orderNumber: `SC-${session.id.slice(-8).toUpperCase()}`,
        paymentStatus: session.payment_status,
        status: session.status,
      }, 200, origin);
    } catch {
      return jsonResponse({ error: 'Checkout session was not found.' }, 404, origin);
    }
  },
};

export default checkoutStatusHandler;

import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // Vercel's serverless Node runtime can fail outbound connections through
  // Stripe's default https-based client; the fetch-based client is reliable there.
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
}

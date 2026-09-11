import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const COMMISSION_RATE = 0.2;

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      await recordPurchase(stripe, checkoutSession);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscriptionPeriod(subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await cancelSubscriptionPurchase(subscription);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const periodEndSeconds = subscription.items.data[0]?.current_period_end;
  return periodEndSeconds ? new Date(periodEndSeconds * 1000) : null;
}

async function recordPurchase(
  stripe: Stripe,
  checkoutSession: Stripe.Checkout.Session
) {
  const { userId, productId, planId, referredById } =
    checkoutSession.metadata ?? {};

  if (!userId || !productId || !planId) return;

  const existing = await prisma.purchase.findFirst({
    where: { stripeCheckoutSessionId: checkoutSession.id },
  });
  if (existing) return;

  const amountPaidCents = checkoutSession.amount_total ?? 0;
  const subscriptionId =
    typeof checkoutSession.subscription === "string"
      ? checkoutSession.subscription
      : (checkoutSession.subscription?.id ?? null);

  let currentPeriodEnd: Date | null = null;
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    currentPeriodEnd = subscriptionPeriodEnd(subscription);
  }

  const purchase = await prisma.purchase.create({
    data: {
      userId,
      productId,
      planId,
      amountPaidCents,
      stripeCheckoutSessionId: checkoutSession.id,
      stripeSubscriptionId: subscriptionId,
      currentPeriodEnd,
      referredById: referredById ?? null,
    },
  });

  if (referredById) {
    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { ownerId: referredById },
    });
    if (affiliateLink) {
      await prisma.commission.create({
        data: {
          affiliateLinkId: affiliateLink.id,
          purchaseId: purchase.id,
          amountCents: Math.round(amountPaidCents * COMMISSION_RATE),
        },
      });
    }
  }
}

async function syncSubscriptionPeriod(subscription: Stripe.Subscription) {
  const purchase = await prisma.purchase.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!purchase) return;

  const currentPeriodEnd = subscriptionPeriodEnd(subscription);
  const isLive = subscription.status === "active" || subscription.status === "trialing";

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      currentPeriodEnd,
      status: isLive ? "ACTIVE" : "EXPIRED",
    },
  });
}

async function cancelSubscriptionPurchase(subscription: Stripe.Subscription) {
  const purchase = await prisma.purchase.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!purchase) return;

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { status: "CANCELED" },
  });
}

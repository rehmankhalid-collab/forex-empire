import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

const checkoutSchema = z.object({
  productId: z.string(),
  planId: z.string(),
  ref: z.string().optional(),
});

const intervalToStripe: Record<string, "day" | "week" | "month" | "year"> = {
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { productId, planId, ref } = parsed.data;

  const plan = await prisma.plan.findFirst({
    where: { id: planId, productId },
    include: { product: true },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  let referredById: string | null = null;
  if (ref) {
    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { code: ref },
    });
    if (affiliateLink && affiliateLink.ownerId !== session.user.id) {
      referredById = affiliateLink.ownerId;
    }
  }

  const existingPurchase = await prisma.purchase.findFirst({
    where: { userId: session.user.id, planId, status: "ACTIVE" },
  });
  if (existingPurchase) {
    return NextResponse.json({ url: "/dashboard" });
  }

  // Free plans skip Stripe entirely.
  if (plan.priceCents === 0) {
    await prisma.purchase.create({
      data: {
        userId: session.user.id,
        productId,
        planId,
        amountPaidCents: 0,
        referredById,
      },
    });
    return NextResponse.json({ url: "/dashboard?purchase=success" });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Payments aren't configured yet. Add STRIPE_SECRET_KEY to your environment to enable checkout.",
      },
      { status: 503 }
    );
  }

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const origin =
    headersList.get("origin") ??
    `${host.startsWith("localhost") ? "http" : "https"}://${host}`;

  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  let stripeCustomerId = dbUser.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      name: dbUser.name,
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { stripeCustomerId },
    });
  }

  const metadata: Record<string, string> = {
    userId: session.user.id,
    productId,
    planId,
    ...(referredById ? { referredById } : {}),
  };

  const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
    currency: "usd",
    unit_amount: plan.priceCents,
    product_data: {
      name: `${plan.product.name} — ${plan.name}`,
    },
  };

  const isSubscription = plan.interval in intervalToStripe;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    customer: stripeCustomerId,
    line_items: [
      {
        quantity: 1,
        price_data: isSubscription
          ? {
              ...priceData,
              recurring: { interval: intervalToStripe[plan.interval] },
            }
          : priceData,
      },
    ],
    metadata,
    subscription_data: isSubscription ? { metadata } : undefined,
    success_url: `${origin}/dashboard?purchase=success`,
    cancel_url: `${origin}/products/${plan.product.slug}`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}

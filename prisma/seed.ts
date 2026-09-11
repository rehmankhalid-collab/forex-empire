import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, PlanInterval, ProductType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const WEEKS_PER_MONTH = 52 / 12;

async function main() {
  const adminEmail = "admin@forexempire.com";
  const adminPasswordHash = await bcrypt.hash("admin12345", 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Forex Empire Admin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const signalsWeeklyCents = 1499;

  await prisma.product.upsert({
    where: { slug: "premium-forex-xauusd-signals" },
    update: {},
    create: {
      slug: "premium-forex-xauusd-signals",
      name: "Premium Forex & XAUUSD Signals",
      tagline: "Daily trade calls on majors and gold, straight to your phone.",
      description:
        "Real-time buy/sell alerts on forex majors and XAUUSD (gold), with entry, stop loss, and take-profit levels. Includes daily market breakdowns and a private members channel.",
      image: "/products/signals.svg",
      type: ProductType.SUBSCRIPTION,
      deliveryContent:
        "Your private signals channel invite: https://t.me/forexempire_signals_private\n\nNew members are added within a few minutes of purchase. Turn on notifications so you never miss an entry.",
      plans: {
        create: [
          {
            name: "Weekly",
            interval: PlanInterval.WEEK,
            priceCents: signalsWeeklyCents,
            isDefault: true,
          },
          {
            name: "Monthly",
            interval: PlanInterval.MONTH,
            priceCents: 2800,
            compareAtCents: Math.round(signalsWeeklyCents * WEEKS_PER_MONTH),
          },
          {
            name: "Yearly",
            interval: PlanInterval.YEAR,
            priceCents: 14999,
            compareAtCents: signalsWeeklyCents * 52,
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "tradingview-indicator-script" },
    update: {},
    create: {
      slug: "tradingview-indicator-script",
      name: "Tradingview indicator/script",
      tagline: "The exact indicator we use to time entries, for TradingView.",
      description:
        "A custom TradingView indicator that highlights supply/demand zones and momentum shifts. One-time payment, lifetime access to the script and future updates.",
      image: "/products/indicator.svg",
      type: ProductType.ONE_TIME,
      deliveryContent:
        "Add your TradingView username in the confirmation email and we'll grant you script access within 24 hours. In the meantime, here's the setup guide: https://forexempire.example/indicator-setup",
      plans: {
        create: [
          {
            name: "Lifetime access",
            interval: PlanInterval.ONE_TIME,
            priceCents: 19900,
            isDefault: true,
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "join-our-discord" },
    update: {},
    create: {
      slug: "join-our-discord",
      name: "Join Our Discord For Free",
      tagline: "Free trading community, market chat, and giveaways.",
      description:
        "Our free Discord community: market discussion, free setups, and the first place we post announcements.",
      image: "/products/discord.svg",
      type: ProductType.FREE,
      deliveryContent: "Your invite: https://discord.gg/forexempire",
      plans: {
        create: [
          {
            name: "Free",
            interval: PlanInterval.FREE,
            priceCents: 0,
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / admin12345`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

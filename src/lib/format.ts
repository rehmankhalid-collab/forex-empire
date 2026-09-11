import { PlanInterval } from "@/generated/prisma/client";

export function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });
}

export function intervalSuffix(interval: PlanInterval) {
  switch (interval) {
    case "WEEK":
      return "/ week";
    case "MONTH":
      return "/ month";
    case "YEAR":
      return "/ year";
    case "ONE_TIME":
      return "one-time";
    case "FREE":
      return "free";
  }
}

export function percentOff(priceCents: number, compareAtCents: number | null) {
  if (!compareAtCents || compareAtCents <= priceCents) return null;
  return Math.round((1 - priceCents / compareAtCents) * 100);
}

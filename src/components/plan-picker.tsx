"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCents, intervalSuffix, percentOff } from "@/lib/format";
import type { Plan } from "@/generated/prisma/client";

export function PlanPicker({
  productId,
  productSlug,
  plans,
  isAuthenticated,
  alreadyOwned,
}: {
  productId: string;
  productSlug: string;
  plans: Plan[];
  isAuthenticated: boolean;
  alreadyOwned: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? undefined;

  const [selectedPlanId, setSelectedPlanId] = useState(
    plans.find((p) => p.isDefault)?.id ?? plans[0]?.id
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFree = plans.every((p) => p.priceCents === 0);

  const onCheckout = async () => {
    if (!isAuthenticated) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(`/products/${productSlug}`)}`
      );
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, planId: selectedPlanId, ref }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  };

  if (alreadyOwned) {
    return (
      <a
        href="/dashboard"
        className="block w-full rounded-md bg-white/10 py-3 text-center font-medium text-zinc-200 transition hover:bg-white/15"
      >
        You own this — go to your library
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {plans.length > 1 && (
        <div className="flex flex-col gap-2">
          {plans.map((plan) => {
            const discount = percentOff(plan.priceCents, plan.compareAtCents);
            const selected = plan.id === selectedPlanId;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                  selected
                    ? "border-[#e8b23d] bg-[#e8b23d]/10"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <span className="text-sm text-zinc-200">{plan.name}</span>
                <span className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-zinc-100">
                    {formatCents(plan.priceCents)}{" "}
                    <span className="font-normal text-zinc-500">
                      {intervalSuffix(plan.interval)}
                    </span>
                  </span>
                  {discount && (
                    <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs text-emerald-400">
                      {discount}% off
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="button"
        onClick={onCheckout}
        disabled={loading}
        className="w-full rounded-md bg-[#e8b23d] py-3 font-medium text-black transition hover:bg-[#f0c360] disabled:opacity-60"
      >
        {loading ? "Redirecting..." : isFree ? "Join for free" : "Continue"}
      </button>
    </div>
  );
}

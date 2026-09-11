import Image from "next/image";
import Link from "next/link";
import type { Plan, Product } from "@/generated/prisma/client";
import { formatCents, intervalSuffix } from "@/lib/format";

export function ProductCard({
  product,
}: {
  product: Product & { plans: Plan[] };
}) {
  const defaultPlan =
    product.plans.find((p) => p.isDefault) ?? product.plans[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-[#e8b23d]/40 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-medium text-zinc-100">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-zinc-500">{product.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="font-semibold text-[#e8b23d]">
            {defaultPlan.priceCents === 0
              ? "Free"
              : formatCents(defaultPlan.priceCents)}
          </span>
          {defaultPlan.priceCents > 0 && (
            <span className="text-zinc-500">
              {intervalSuffix(defaultPlan.interval)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

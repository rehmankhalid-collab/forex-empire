import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    include: { plans: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(232,178,61,0.15),transparent_60%)]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
          <span className="rounded-full border border-[#e8b23d]/40 px-3 py-1 text-xs uppercase tracking-widest text-[#e8b23d]">
            Welcome to Forex Empire
          </span>
          <h1 className="max-w-2xl font-serif text-4xl leading-tight text-zinc-50 sm:text-5xl">
            Trade signals, tools, and a community built for XAUUSD &amp;
            forex traders.
          </h1>
          <p className="max-w-xl text-lg text-zinc-400">
            Daily gold and forex signals, the TradingView indicator behind
            our calls, and a free community of traders — all in one place.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/products"
              className="rounded-md bg-[#e8b23d] px-5 py-2.5 font-medium text-black transition hover:bg-[#f0c360]"
            >
              Browse products
            </Link>
            <Link
              href="/products/join-our-discord"
              className="rounded-md border border-white/15 px-5 py-2.5 font-medium text-zinc-200 transition hover:border-white/30"
            >
              Join free Discord
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-2xl text-zinc-100">Products</h2>
          <Link
            href="/products"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

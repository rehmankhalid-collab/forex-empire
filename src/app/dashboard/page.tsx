import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCents, intervalSuffix } from "@/lib/format";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: { product: true, plan: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-zinc-50">My library</h1>
          <p className="mt-1 text-zinc-500">
            Everything you&apos;ve purchased or joined.
          </p>
        </div>
        <Link
          href="/dashboard/affiliate"
          className="rounded-md border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:border-white/30"
        >
          Affiliate program
        </Link>
      </div>

      {purchases.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-white/15 p-10 text-center text-zinc-500">
          Nothing here yet.{" "}
          <Link href="/products" className="text-[#e8b23d] hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-zinc-100">
                    {purchase.product.name}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {purchase.plan.name} ·{" "}
                    {purchase.amountPaidCents === 0
                      ? "Free"
                      : formatCents(purchase.amountPaidCents)}{" "}
                    {purchase.amountPaidCents > 0 &&
                      intervalSuffix(purchase.plan.interval)}
                  </p>
                </div>
                <Link
                  href={`/products/${purchase.product.slug}`}
                  className="text-sm text-zinc-400 hover:text-zinc-200"
                >
                  View
                </Link>
              </div>
              <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-black/40 p-4 text-sm text-zinc-300">
                {purchase.product.deliveryContent}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

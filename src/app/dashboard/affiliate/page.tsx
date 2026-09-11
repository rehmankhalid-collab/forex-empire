import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { GenerateLinkButton } from "@/components/generate-link-button";

export default async function AffiliatePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/affiliate");

  const affiliateLink = await prisma.affiliateLink.findUnique({
    where: { ownerId: session.user.id },
    include: {
      commissions: {
        include: { purchase: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const totalEarnedCents =
    affiliateLink?.commissions.reduce((sum, c) => sum + c.amountCents, 0) ?? 0;
  const totalPaidCents =
    affiliateLink?.commissions
      .filter((c) => c.status === "PAID")
      .reduce((sum, c) => sum + c.amountCents, 0) ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-serif text-3xl text-zinc-50">Affiliate program</h1>
      <p className="mt-2 text-zinc-500">
        Earn 20% commission on every sale you refer.
      </p>

      <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        {affiliateLink ? (
          <>
            <p className="text-sm text-zinc-500">Your referral link</p>
            <p className="mt-1 break-all font-mono text-sm text-[#e8b23d]">
              /products/&lt;any-product&gt;?ref={affiliateLink.code}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Total earned</p>
                <p className="mt-1 text-xl font-semibold text-zinc-100">
                  {formatCents(totalEarnedCents)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Paid out</p>
                <p className="mt-1 text-xl font-semibold text-zinc-100">
                  {formatCents(totalPaidCents)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <GenerateLinkButton />
        )}
      </div>

      {affiliateLink && affiliateLink.commissions.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
            Commission history
          </h2>
          <div className="flex flex-col gap-2">
            {affiliateLink.commissions.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 text-sm"
              >
                <span className="text-zinc-300">{c.purchase.product.name}</span>
                <span className="flex items-center gap-3">
                  <span className="text-zinc-100">
                    {formatCents(c.amountCents)}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${
                      c.status === "PAID"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {c.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

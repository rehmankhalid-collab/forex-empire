import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { MarkPaidButton } from "@/components/mark-paid-button";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [purchases, products, members, pendingCommissions] =
    await Promise.all([
      prisma.purchase.findMany({ include: { product: true } }),
      prisma.product.findMany({
        include: { _count: { select: { purchases: true } } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.commission.findMany({
        where: { status: "PENDING" },
        include: {
          affiliateLink: { include: { owner: true } },
          purchase: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const totalRevenueCents = purchases.reduce(
    (sum, p) => sum + p.amountPaidCents,
    0
  );
  const totalCommissionsOwedCents = pendingCommissions.reduce(
    (sum, c) => sum + c.amountCents,
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="font-serif text-3xl text-zinc-50">Admin dashboard</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total revenue" value={formatCents(totalRevenueCents)} />
        <StatCard label="Total sales" value={String(purchases.length)} />
        <StatCard
          label="Commissions owed"
          value={formatCents(totalCommissionsOwedCents)}
        />
      </div>

      <section className="mt-12">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          Products
        </h2>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Product</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Sales</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-white/10">
                  <td className="px-4 py-2 text-zinc-200">{product.name}</td>
                  <td className="px-4 py-2 text-zinc-500">{product.type}</td>
                  <td className="px-4 py-2 text-zinc-200">
                    {product._count.purchases}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          Members ({members.length})
        </h2>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-white/10">
                  <td className="px-4 py-2 text-zinc-200">{member.name}</td>
                  <td className="px-4 py-2 text-zinc-500">{member.email}</td>
                  <td className="px-4 py-2 text-zinc-500">{member.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          Pending affiliate commissions
        </h2>
        {pendingCommissions.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing owed right now.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingCommissions.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 text-sm"
              >
                <span className="text-zinc-300">
                  {c.affiliateLink.owner.name} · {c.purchase.product.name}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-zinc-100">
                    {formatCents(c.amountCents)}
                  </span>
                  <MarkPaidButton commissionId={c.id} />
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

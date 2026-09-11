import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PlanPicker } from "@/components/plan-picker";

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { plans: { orderBy: { priceCents: "asc" } } },
  });

  if (!product) notFound();

  const session = await auth();

  const alreadyOwned = session?.user
    ? Boolean(
        await prisma.purchase.findFirst({
          where: {
            userId: session.user.id,
            productId: product.id,
            status: "ACTIVE",
          },
        })
      )
    : false;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          <h1 className="mt-6 font-serif text-3xl text-zinc-50">
            {product.name}
          </h1>
          <p className="mt-2 text-zinc-400">{product.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-zinc-500">
            {product.description}
          </p>

          {alreadyOwned && (
            <div className="mt-8 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <p className="text-sm font-medium text-emerald-400">
                Unlocked content
              </p>
              <pre className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">
                {product.deliveryContent}
              </pre>
            </div>
          )}
        </div>

        <div className="h-fit rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
            Choose your plan
          </h2>
          <Suspense fallback={null}>
            <PlanPicker
              productId={product.id}
              productSlug={product.slug}
              plans={product.plans}
              isAuthenticated={Boolean(session?.user)}
              alreadyOwned={alreadyOwned}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { plans: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-serif text-3xl text-zinc-100">Products</h1>
      <p className="mt-2 text-zinc-500">
        Everything Forex Empire offers, in one place.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

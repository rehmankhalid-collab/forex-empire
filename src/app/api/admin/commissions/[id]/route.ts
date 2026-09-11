import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _request: Request,
  ctx: RouteContext<"/api/admin/commissions/[id]">
) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;

  const commission = await prisma.commission.update({
    where: { id },
    data: { status: "PAID" },
  });

  return NextResponse.json(commission);
}

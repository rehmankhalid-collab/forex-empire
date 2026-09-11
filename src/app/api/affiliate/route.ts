import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const existing = await prisma.affiliateLink.findUnique({
    where: { ownerId: session.user.id },
  });
  if (existing) {
    return NextResponse.json(existing);
  }

  const code = randomBytes(4).toString("hex");
  const affiliateLink = await prisma.affiliateLink.create({
    data: { ownerId: session.user.id, code },
  });

  return NextResponse.json(affiliateLink);
}

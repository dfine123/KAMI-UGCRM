import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const method = searchParams.get("method");
  const creatorId = searchParams.get("creatorId");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir = searchParams.get("sortDir") || "desc";

  const where: any = {};
  if (status) where.status = status;
  if (method) where.method = method;
  if (creatorId) where.creatorId = creatorId;

  const payments = await prisma.payment.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, handle: true } },
      video: { select: { id: true, platform: true, postUrl: true } },
    },
    orderBy: { [sortBy]: sortDir },
  });

  return NextResponse.json(payments);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { ids, status, completedDate } = body;

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }

  await prisma.payment.updateMany({
    where: { id: { in: ids } },
    data: {
      status,
      completedDate: completedDate ? new Date(completedDate) : status === "COMPLETED" ? new Date() : undefined,
    },
  });

  return NextResponse.json({ success: true });
}

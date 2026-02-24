import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const where: any = { creatorId: params.id };
  if (type) where.type = type;

  const activities = await prisma.activity.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(activities);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const user = await prisma.user.findFirst();
  if (!user) {
    return NextResponse.json({ error: "No users exist" }, { status: 500 });
  }

  const activity = await prisma.activity.create({
    data: {
      creatorId: params.id,
      userId: user.id,
      type: body.type || "NOTE",
      content: body.content,
      metadata: body.metadata,
    },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(activity, { status: 201 });
}

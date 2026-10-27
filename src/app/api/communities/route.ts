import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") || "";
  const status = req.nextUrl.searchParams.get("status") || "";

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ];
  }

  const communities = await prisma.community.findMany({
    where,
    orderBy: { communitySize: "desc" },
  });

  return NextResponse.json(communities);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const community = await prisma.community.create({
    data: {
      name: body.name,
      communityPlatform: body.communityPlatform || "DISCORD",
      creatorPlatform: body.creatorPlatform || null,
      communitySize: Number(body.communitySize) || 0,
      creatorSize: body.creatorSize || null,
      status: body.status || "NOT_CONTACTED",
      askingDeal: body.askingDeal || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(community, { status: 201 });
}

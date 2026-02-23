import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const contentType = searchParams.get("contentType");
  const paymentStatus = searchParams.get("paymentStatus");
  const sortBy = searchParams.get("sortBy") || "postedAt";
  const sortDir = searchParams.get("sortDir") || "desc";
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: any = {};
  if (platform) where.platform = platform;
  if (contentType) where.contentType = contentType;
  if (paymentStatus) where.paymentStatus = paymentStatus;

  const videos = await prisma.video.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, handle: true, profileImageUrl: true } },
    },
    orderBy: { [sortBy]: sortDir },
    take: limit,
  });

  return NextResponse.json(videos);
}

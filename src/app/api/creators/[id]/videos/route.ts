import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const videos = await prisma.video.findMany({
    where: { creatorId: params.id },
    orderBy: { postedAt: "desc" },
  });

  return NextResponse.json(videos);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const video = await prisma.video.create({
    data: {
      creatorId: params.id,
      platform: body.platform,
      postUrl: body.postUrl,
      thumbnailUrl: body.thumbnailUrl,
      postedAt: new Date(body.postedAt),
      contentType: body.contentType,
      caption: body.caption,
      productFeatured: body.productFeatured,
      views: body.views || 0,
      likes: body.likes || 0,
      comments: body.comments || 0,
      shares: body.shares || 0,
      saves: body.saves || 0,
      estimatedReach: body.estimatedReach,
      impressions: body.impressions,
      amountPaid: body.amountPaid || 0,
      paymentStatus: body.paymentStatus || "PENDING",
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
    },
  });

  await prisma.activity.create({
    data: {
      creatorId: params.id,
      userId: session.user.id,
      type: "VIDEO_ADDED",
      content: `New ${body.platform} video added`,
      metadata: { videoId: video.id },
    },
  });

  return NextResponse.json(video, { status: 201 });
}

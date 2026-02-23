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

  const creator = await prisma.creator.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      videos: { orderBy: { postedAt: "desc" } },
      payments: { orderBy: { createdAt: "desc" } },
      activities: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      _count: { select: { videos: true, payments: true } },
    },
  });

  if (!creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  const totalViews = creator.videos.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = creator.videos.reduce((sum, v) => sum + v.likes, 0);
  const totalSpend = creator.videos.reduce((sum, v) => sum + v.amountPaid, 0);
  const totalPaid = creator.payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);
  const avgEngagement = creator.videos.length > 0
    ? creator.videos.reduce((sum, v) => {
        const eng = v.views > 0 ? ((v.likes + v.comments + v.shares + v.saves) / v.views) * 100 : 0;
        return sum + eng;
      }, 0) / creator.videos.length
    : 0;
  const bestVideo = creator.videos.length > 0
    ? creator.videos.reduce((best, v) => (v.views > best.views ? v : best), creator.videos[0])
    : null;

  return NextResponse.json({
    ...creator,
    stats: {
      totalViews,
      totalLikes,
      totalSpend,
      totalPaid,
      avgEngagement,
      avgViews: creator.videos.length > 0 ? totalViews / creator.videos.length : 0,
      cpv: totalViews > 0 ? totalSpend / totalViews : 0,
      bestVideo,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const existing = await prisma.creator.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Track status changes
  if (body.status && body.status !== existing.status) {
    await prisma.activity.create({
      data: {
        creatorId: params.id,
        userId: session.user.id,
        type: "STATUS_CHANGE",
        content: `Status changed from ${existing.status} to ${body.status}`,
        metadata: { oldStatus: existing.status, newStatus: body.status },
      },
    });
  }

  // Track rate changes
  if (body.ratePerVideo && body.ratePerVideo !== existing.ratePerVideo) {
    await prisma.activity.create({
      data: {
        creatorId: params.id,
        userId: session.user.id,
        type: "RATE_CHANGE",
        content: `Rate changed from $${existing.ratePerVideo || 0} to $${body.ratePerVideo}`,
        metadata: { oldRate: existing.ratePerVideo, newRate: body.ratePerVideo },
      },
    });
  }

  const updated = await prisma.creator.update({
    where: { id: params.id },
    data: {
      ...body,
      outreachDate: body.outreachDate ? new Date(body.outreachDate) : undefined,
      responseDate: body.responseDate ? new Date(body.responseDate) : undefined,
      closedDate: body.closedDate ? new Date(body.closedDate) : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.creator.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

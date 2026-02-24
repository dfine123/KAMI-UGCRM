import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalCreators,
    activeCreators,
    pipelineCreators,
    statusCounts,
    allVideos,
    recentVideos,
    completedPayments,
    recentActivities,
    topCreators,
  ] = await Promise.all([
    prisma.creator.count(),
    prisma.creator.count({ where: { status: "ACTIVE" } }),
    prisma.creator.count({
      where: {
        status: { in: ["LEAD", "CONTACTED", "RESPONDED", "NEGOTIATING", "AGREED", "ONBOARDING"] },
      },
    }),
    prisma.creator.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.video.aggregate({
      _sum: { views: true },
      _count: { id: true },
    }),
    prisma.video.aggregate({
      where: { postedAt: { gte: thirtyDaysAgo } },
      _sum: { views: true },
      _count: { id: true },
    }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.activity.findMany({
      include: {
        creator: { select: { id: true, name: true, handle: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.creator.findMany({
      where: { status: "ACTIVE" },
      include: {
        videos: {
          where: { postedAt: { gte: thirtyDaysAgo } },
          select: { views: true, amountPaid: true },
        },
        _count: {
          select: {
            videos: { where: { postedAt: { gte: thirtyDaysAgo } } },
          },
        },
      },
      take: 10,
    }),
  ]);

  const totalViews = allVideos._sum.views || 0;
  const recentViews = recentVideos._sum.views || 0;
  const totalSpend = completedPayments._sum.amount || 0;
  const totalVideoCount = allVideos._count.id || 0;

  // Pipeline funnel
  const pipelineStages = ["LEAD", "CONTACTED", "RESPONDED", "NEGOTIATING", "AGREED", "ONBOARDING", "ACTIVE"];
  const funnel = pipelineStages.map((stage) => ({
    stage,
    count: statusCounts.find((s) => s.status === stage)?._count.id || 0,
  }));

  // Conversion rate
  const everEntered = statusCounts.reduce((sum, s) => sum + s._count.id, 0);
  const conversionRate = everEntered > 0 ? ((activeCreators / everEntered) * 100) : 0;

  // Top performers
  const topPerformers = topCreators
    .map((c) => {
      const views30d = c.videos.reduce((sum, v) => sum + v.views, 0);
      const spend30d = c.videos.reduce((sum, v) => sum + v.amountPaid, 0);
      return {
        id: c.id,
        name: c.name,
        handle: c.handle,
        profileImageUrl: c.profileImageUrl,
        videosPosted: c._count.videos,
        totalViews: views30d,
        avgViews: c._count.videos > 0 ? Math.round(views30d / c._count.videos) : 0,
        totalSpend: spend30d,
        cpv: views30d > 0 ? spend30d / views30d : 0,
      };
    })
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 10);

  return NextResponse.json({
    summary: {
      totalCreators,
      activeCreators,
      pipelineCreators,
      conversionRate: Math.round(conversionRate * 10) / 10,
      totalViews,
      recentViews,
      totalSpend,
      avgCPV: totalViews > 0 ? totalSpend / totalViews : 0,
      totalVideos: totalVideoCount,
    },
    funnel,
    recentActivities,
    topPerformers,
  });
}

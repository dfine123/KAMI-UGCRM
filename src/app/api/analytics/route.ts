import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "30";
  const days = parseInt(period);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [creators, videos, payments, allCreators] = await Promise.all([
    prisma.creator.findMany({
      where: { status: "ACTIVE" },
      include: {
        videos: {
          where: days < 9999 ? { postedAt: { gte: since } } : undefined,
          select: { views: true, likes: true, comments: true, shares: true, saves: true, amountPaid: true, postedAt: true },
        },
        _count: {
          select: { videos: days < 9999 ? { where: { postedAt: { gte: since } } } : undefined },
        },
      },
    }),
    prisma.video.findMany({
      where: days < 9999 ? { postedAt: { gte: since } } : undefined,
      select: {
        id: true, platform: true, contentType: true, views: true,
        likes: true, comments: true, shares: true, saves: true,
        amountPaid: true, postedAt: true,
        creator: { select: { id: true, name: true, handle: true } },
      },
      orderBy: { views: "desc" },
    }),
    prisma.payment.findMany({
      where: {
        status: "COMPLETED",
        ...(days < 9999 ? { completedDate: { gte: since } } : {}),
      },
      select: { amount: true, completedDate: true, creatorId: true },
    }),
    prisma.creator.findMany({
      select: { id: true, status: true, source: true, createdAt: true, closedDate: true, outreachDate: true },
    }),
  ]);

  // Build standalone payment spend per creator
  const standaloneSpend: Record<string, number> = {};
  payments.filter((p) => !p.completedDate || true).forEach((p) => {
    standaloneSpend[p.creatorId] = (standaloneSpend[p.creatorId] || 0) + p.amount;
  });

  // Creator leaderboard
  const leaderboard = creators.map((c) => {
    const totalViews = c.videos.reduce((sum, v) => sum + v.views, 0);
    const videoSpend = c.videos.reduce((sum, v) => sum + v.amountPaid, 0);
    const totalSpend = videoSpend + (standaloneSpend[c.id] || 0);
    const totalEng = c.videos.reduce((sum, v) => sum + v.likes + v.comments + v.shares + v.saves, 0);
    return {
      id: c.id, name: c.name, handle: (c as any).handle,
      totalViews, totalSpend, videoCount: c._count.videos,
      cpv: totalViews > 0 ? totalSpend / totalViews : 0,
      engagementRate: totalViews > 0 ? (totalEng / totalViews) * 100 : 0,
    };
  }).sort((a, b) => b.totalViews - a.totalViews);

  // Content performance by type
  const contentByType: Record<string, { count: number; views: number; spend: number }> = {};
  videos.forEach((v) => {
    if (!contentByType[v.contentType]) contentByType[v.contentType] = { count: 0, views: 0, spend: 0 };
    contentByType[v.contentType].count++;
    contentByType[v.contentType].views += v.views;
    contentByType[v.contentType].spend += v.amountPaid;
  });

  // Content performance by platform
  const contentByPlatform: Record<string, { count: number; views: number; spend: number }> = {};
  videos.forEach((v) => {
    if (!contentByPlatform[v.platform]) contentByPlatform[v.platform] = { count: 0, views: 0, spend: 0 };
    contentByPlatform[v.platform].count++;
    contentByPlatform[v.platform].views += v.views;
    contentByPlatform[v.platform].spend += v.amountPaid;
  });

  // Top videos
  const topVideos = videos.slice(0, 20).map((v) => ({
    ...v,
    cpv: v.views > 0 ? v.amountPaid / v.views : 0,
    engagementRate: v.views > 0 ? ((v.likes + v.comments + v.shares + v.saves) / v.views) * 100 : 0,
  }));

  // Spend by creator
  const spendByCreator: Record<string, number> = {};
  payments.forEach((p) => {
    spendByCreator[p.creatorId] = (spendByCreator[p.creatorId] || 0) + p.amount;
  });

  // Source effectiveness
  const sourceStats: Record<string, { total: number; active: number }> = {};
  allCreators.forEach((c) => {
    if (!sourceStats[c.source]) sourceStats[c.source] = { total: 0, active: 0 };
    sourceStats[c.source].total++;
    if (c.status === "ACTIVE") sourceStats[c.source].active++;
  });

  return NextResponse.json({
    leaderboard,
    contentByType: Object.entries(contentByType).map(([type, data]) => ({
      type, ...data, cpv: data.views > 0 ? data.spend / data.views : 0,
    })),
    contentByPlatform: Object.entries(contentByPlatform).map(([platform, data]) => ({
      platform, ...data, cpv: data.views > 0 ? data.spend / data.views : 0,
    })),
    topVideos,
    spendByCreator: Object.entries(spendByCreator).map(([creatorId, amount]) => ({ creatorId, amount })),
    sourceStats: Object.entries(sourceStats).map(([source, data]) => ({
      source, ...data, conversionRate: data.total > 0 ? (data.active / data.total) * 100 : 0,
    })),
  });
}

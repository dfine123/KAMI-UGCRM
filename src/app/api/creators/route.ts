import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status")?.split(",").filter(Boolean) || [];
  const category = searchParams.get("category")?.split(",").filter(Boolean) || [];
  const platform = searchParams.get("platform")?.split(",").filter(Boolean) || [];
  const priority = searchParams.get("priority") || "";
  const assignedTo = searchParams.get("assignedTo") || "";
  const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir = searchParams.get("sortDir") || "desc";
  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { handle: { contains: search, mode: "insensitive" } },
      { tags: { hasSome: [search] } },
      { notes: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status.length > 0) where.status = { in: status };
  if (category.length > 0) where.category = { in: category };
  if (platform.length > 0) where.platform = { in: platform };
  if (priority) where.priority = priority;
  if (assignedTo) where.assignedToId = assignedTo;
  if (tags.length > 0) where.tags = { hasSome: tags };

  const [creators, total] = await Promise.all([
    prisma.creator.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true } },
        _count: { select: { videos: true, payments: true } },
        videos: {
          select: { views: true, amountPaid: true },
        },
      },
      orderBy: { [sortBy]: sortDir },
      skip: page * limit,
      take: limit,
    }),
    prisma.creator.count({ where }),
  ]);

  const creatorsWithStats = creators.map((c) => {
    const totalViews = c.videos.reduce((sum, v) => sum + v.views, 0);
    const totalSpend = c.videos.reduce((sum, v) => sum + v.amountPaid, 0);
    return {
      ...c,
      videos: undefined,
      totalViews,
      totalSpend,
      cpv: totalViews > 0 ? totalSpend / totalViews : 0,
      videoCount: c._count.videos,
    };
  });

  return NextResponse.json({ creators: creatorsWithStats, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    name, handle, email, phone, platform, category, followerCount,
    engagementRate, profileImageUrl, bio, status, source, outreachDate,
    responseDate, closedDate, ratePerVideo, rateType, revSharePercentage,
    contractNotes, paymentTerms, tags, priority, assignedToId, notes,
  } = body;

  const creator = await prisma.creator.create({
    data: {
      name, handle, email, phone, platform, category,
      followerCount: followerCount || 0,
      engagementRate: engagementRate || 0,
      profileImageUrl, bio, status: status || "LEAD",
      source: source || "OTHER",
      outreachDate: outreachDate ? new Date(outreachDate) : null,
      responseDate: responseDate ? new Date(responseDate) : null,
      closedDate: closedDate ? new Date(closedDate) : null,
      ratePerVideo, rateType, revSharePercentage,
      contractNotes, paymentTerms, tags: tags || [],
      priority: priority || "MEDIUM", assignedToId, notes,
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      creatorId: creator.id,
      userId: session.user.id,
      type: "NOTE",
      content: `Creator "${name}" added to CRM`,
    },
  });

  return NextResponse.json(creator, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "";
  const platform = searchParams.get("platform") || "";
  const search = searchParams.get("search") || "";
  const activeOnly = searchParams.get("activeOnly") === "true";

  const where: any = {};
  if (category) where.category = category;
  if (platform) where.platform = platform;
  if (activeOnly) where.isActive = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { body: { contains: search, mode: "insensitive" } },
      { tags: { hasSome: [search] } },
    ];
  }

  const templates = await prisma.template.findMany({
    where,
    include: { createdBy: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, category, platform, subject, body: templateBody, tags, isActive } = body;

  if (!name || !category || !platform || !templateBody) {
    return NextResponse.json({ error: "Name, category, platform, and body are required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst();
  if (!user) {
    return NextResponse.json({ error: "No user found" }, { status: 500 });
  }

  const template = await prisma.template.create({
    data: {
      name,
      category,
      platform,
      subject: subject || null,
      body: templateBody,
      tags: tags || [],
      isActive: isActive !== false,
      createdById: user.id,
    },
  });

  return NextResponse.json(template, { status: 201 });
}

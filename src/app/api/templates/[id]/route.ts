import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  // If this is an increment usage request
  if (body.incrementUsage) {
    const template = await prisma.template.update({
      where: { id: params.id },
      data: { usageCount: { increment: 1 } },
    });
    return NextResponse.json(template);
  }

  const template = await prisma.template.update({
    where: { id: params.id },
    data: {
      name: body.name,
      category: body.category,
      platform: body.platform,
      subject: body.subject || null,
      body: body.body,
      tags: body.tags,
      isActive: body.isActive,
    },
  });

  return NextResponse.json(template);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.template.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

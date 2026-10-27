import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const FIELDS = [
  "name", "communityPlatform", "creatorPlatform", "communitySize",
  "creatorSize", "status", "askingDeal", "notes",
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const data: any = {};
  for (const field of FIELDS) {
    if (field in body) data[field] = body[field] === "" ? null : body[field];
  }
  if ("communitySize" in data) data.communitySize = Number(data.communitySize) || 0;
  if (data.name === null) delete data.name;

  const community = await prisma.community.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(community);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.community.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const payments = await prisma.payment.findMany({
    where: { creatorId: params.id },
    include: { video: { select: { id: true, platform: true, postUrl: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const payment = await prisma.payment.create({
    data: {
      creatorId: params.id,
      videoId: body.videoId,
      amount: body.amount,
      method: body.method,
      status: body.status || "SCHEDULED",
      reference: body.reference,
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
      completedDate: body.completedDate ? new Date(body.completedDate) : null,
    },
  });

  const user = await prisma.user.findFirst();
  if (user) {
    await prisma.activity.create({
      data: {
        creatorId: params.id,
        userId: user.id,
        type: "PAYMENT",
        content: `Payment of $${body.amount} recorded (${body.status || "SCHEDULED"})`,
        metadata: { paymentId: payment.id, amount: body.amount },
      },
    });
  }

  return NextResponse.json(payment, { status: 201 });
}

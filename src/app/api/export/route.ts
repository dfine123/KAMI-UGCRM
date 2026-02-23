import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "creators";

  if (type === "creators") {
    const creators = await prisma.creator.findMany({
      include: {
        assignedTo: { select: { name: true } },
        _count: { select: { videos: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["Name", "Handle", "Platform", "Category", "Status", "Source", "Followers", "Rate/Video", "Rate Type", "Priority", "Assigned To", "Tags", "Videos", "Created"];
    const rows = creators.map((c) => [
      c.name, c.handle, c.platform, c.category, c.status, c.source,
      c.followerCount, c.ratePerVideo || "", c.rateType || "", c.priority,
      c.assignedTo?.name || "", c.tags.join("; "), c._count.videos,
      c.createdAt.toISOString().split("T")[0],
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=creators-${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  }

  if (type === "payments") {
    const payments = await prisma.payment.findMany({
      include: {
        creator: { select: { name: true, handle: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["Creator", "Handle", "Amount", "Method", "Status", "Reference", "Scheduled", "Completed"];
    const rows = payments.map((p) => [
      p.creator.name, p.creator.handle, p.amount, p.method, p.status,
      p.reference || "", p.scheduledDate?.toISOString().split("T")[0] || "",
      p.completedDate?.toISOString().split("T")[0] || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=payments-${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

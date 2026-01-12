import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const investment = await prisma.investment.findUnique({
      where: {
        id: id,
        userId: user.id // Security check
      }
    });

    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...investment,
      amount: Number(investment.amount),
      profit: Number(investment.profit || 0)
    });
  } catch (error) {
    console.error("Failed to fetch investment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

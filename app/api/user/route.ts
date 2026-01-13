import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assets = await prisma.cryptoAsset.findMany({
      include: {
        networks: true
      }
    });

    // Return sanitized user data
    return NextResponse.json({
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      balance: Number(user.balance),
      assets: assets,
      transactions: user.transactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount)
      })),
      investments: user.investments.map(inv => ({
        ...inv,
        amount: Number(inv.amount),
        profit: Number(inv.profit),
        dailyROI: Number(inv.dailyROI)
      }))
    });
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

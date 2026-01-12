import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return sanitized user data
    return NextResponse.json({
      balance: Number(user.balance),
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

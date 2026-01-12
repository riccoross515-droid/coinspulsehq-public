"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Defined ROI percentages for each plan
 */
const PLAN_ROI: Record<string, number> = {
  starter: 0.005, // 0.5% Daily
  growth: 0.012,  // 1.2% Daily
  wealth: 0.025,  // 2.5% Daily
};

/**
 * Consolidates snapshotting and profit updates into a single "Daily Distribution" job.
 */
export async function runDailyDistribution() {
  try {
    // 1. Create the historical snapshot FIRST (saves today's status)
    const snapshotResult = await createDailySnapshots();
    if (!snapshotResult.success) throw new Error(snapshotResult.error);

    // 2. Get all active investments to update their profits
    const activeInvestments = await prisma.investment.findMany({
      where: { status: "ACTIVE" }
    });

    let totalProfitDistributed = 0;
    const affectedUserIds = new Set<string>();

    // 3. Update profit for each investment based on ITS OWN stored dailyROI
    const updates = activeInvestments.map(inv => {
      const dailyROI = Number(inv.dailyROI); // Read from investment record
      const dailyProfit = Number(inv.amount) * dailyROI;
      const newTotalProfit = Number(inv.profit || 0) + dailyProfit;

      totalProfitDistributed += dailyProfit;
      affectedUserIds.add(inv.userId);

      return prisma.investment.update({
        where: { id: inv.id },
        data: {
          profit: newTotalProfit,
        }
      });
    });

    await Promise.all(updates);

    revalidatePath("/dashboard");
    return { 
      success: true, 
      count: snapshotResult.count,
      updatedCount: activeInvestments.length,
      affectedUsersCount: affectedUserIds.size,
      totalProfitDistributed: totalProfitDistributed,
      message: `Distribution Complete: $${totalProfitDistributed.toLocaleString(undefined, { minimumFractionDigits: 2 })} distributed across ${activeInvestments.length} investments for ${affectedUserIds.size} users.` 
    };
  } catch (error) {
    console.error("Daily distribution failed:", error);
    return { success: false, error: "Daily distribution failed. Check logs." };
  }
}

/**
 * Creates a daily snapshot of all users' portfolio values.
 * This should be run daily (via cron job) or can be triggered manually.
 */
export async function createDailySnapshots() {
  try {
    // Get all users with their investments
    const users = await prisma.user.findMany({
      include: {
        investments: {
          where: { status: "ACTIVE" },
          select: {
            amount: true,
            profit: true,
          }
        }
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    // Create snapshot for each user
    const snapshots = users.map(user => {
      const liquidBalance = Number(user.balance);
      const totalInvested = user.investments.reduce((acc, inv) => acc + Number(inv.amount), 0);
      const totalProfit = user.investments.reduce((acc, inv) => acc + Number(inv.profit || 0), 0);
      const totalValue = liquidBalance + totalInvested + totalProfit;

      return {
        userId: user.id,
        date: today,
        totalValue,
        liquidBalance,
        totalInvested,
        totalProfit,
      };
    });

    // Upsert all snapshots (update if exists for today, create if not)
    await Promise.all(
      snapshots.map(snapshot =>
        prisma.portfolioHistory.upsert({
          where: {
            userId_date: {
              userId: snapshot.userId,
              date: snapshot.date,
            }
          },
          update: {
            totalValue: snapshot.totalValue,
            liquidBalance: snapshot.liquidBalance,
            totalInvested: snapshot.totalInvested,
            totalProfit: snapshot.totalProfit,
          },
          create: snapshot,
        })
      )
    );

    revalidatePath("/dashboard");
    return { success: true, count: snapshots.length };
  } catch (error) {
    console.error("Failed to create daily snapshots:", error);
    return { success: false, error: "Failed to create snapshots" };
  }
}

/**
 * Gets portfolio history for a specific user
 */
export async function getPortfolioHistory(userId: string, days: number = 30) {
  try {
    const history = await prisma.portfolioHistory.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      take: days,
    });

    return { success: true, data: history };
  } catch (error) {
    console.error("Failed to fetch portfolio history:", error);
    return { success: false, error: "Failed to fetch history", data: [] };
  }
}

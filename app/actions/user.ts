"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createTransaction(data: {
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL";
  currency: string;
  network: string;
  address: string;
  source?: string;
  txHash?: string;
}) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return { success: false, error: "User not found" };

    const source = (data.type === 'WITHDRAWAL' && data.source && data.source !== 'wallet') 
      ? data.source 
      : "WALLET";

    // Double-spend prevention: Check pending withdrawals
    if (data.type === 'WITHDRAWAL') {
      // 1. Calculate Total Available Funds in Source
      let totalAvailable = 0;
      if (source === "WALLET") {
        totalAvailable = Number(user.balance);
      } else {
         const investment = await prisma.investment.findUnique({
            where: { id: source, userId: user.id }
         });
         if (!investment) return { success: false, error: "Investment source not found" };
         totalAvailable = Number(investment.amount) + Number(investment.profit);
      }

      // 2. Calculate Total Pending Withdrawals from this Source
      const pendingWithdrawals = await prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: "WITHDRAWAL",
          status: "PENDING",
          source: source
        },
        _sum: {
          amount: true
        }
      });
      
      const totalPending = Number(pendingWithdrawals._sum.amount || 0);

      // 3. Validate
      if ((totalAvailable - totalPending) < data.amount) {
         return { 
           success: false, 
           error: `Insufficient funds. Available: $${(totalAvailable - totalPending).toLocaleString()} (Pending: $${totalPending.toLocaleString()})` 
         };
      }
    }

    // Generate a user-friendly reference ID if not provided (not 0x... format to avoid confusion)
    const generateRef = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const segment = () => Array.from({length: 4}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      return `REF-${segment()}-${segment()}`;
    };
    const txHash = data.txHash || generateRef();

    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: data.amount,
        type: data.type,
        currency: data.currency,
        network: data.network,
        address: data.address,
        status: "PENDING",
        source: source,
        txHash: txHash,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/wallet");
    return { success: true };
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return { success: false, error: "Failed to create transaction" };
  }
}

export async function createInvestment(data: {
  planId: string;
  amount: number;
}) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return { success: false, error: "User not found" };

    // Check if user has enough balance
    if (Number(user.balance) < data.amount) {
      return { success: false, error: "Insufficient balance" };
    }

    // 1. Deduct balance
    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: {
          decrement: data.amount,
        },
      },
    });

    // 2. Check for existing active investment
    const existingInvestment = await prisma.investment.findFirst({
      where: {
        userId: user.id,
        planId: data.planId,
        status: "ACTIVE",
      },
    });

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    // Define ROI percentages for lookup
    const PLAN_ROI: Record<string, number> = {
      starter: 0.005,
      growth: 0.012,
      wealth: 0.025,
    };
    const dailyROI = PLAN_ROI[data.planId.toLowerCase()] || 0;

    if (existingInvestment) {
      // Merge logic: Update existing investment
      await prisma.investment.update({
        where: { id: existingInvestment.id },
        data: {
          amount: {
            increment: data.amount,
          },
          endDate: oneYearFromNow, // Reset lock period
        },
      });
    } else {
      // Create new investment
      await prisma.investment.create({
        data: {
          userId: user.id,
          planId: data.planId,
          amount: data.amount,
          status: "ACTIVE",
          endDate: oneYearFromNow,
          profit: 0,
          dailyROI: dailyROI,
        },
      });
    }

    // 3. Create a record in transactions for visibility
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: data.amount,
        type: "INVESTMENT",
        currency: "USD",
        status: "COMPLETED",
        address: "Internal",
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/invest");
    return { success: true };
  } catch (error) {
    console.error("Failed to create investment:", error);
    return { success: false, error: "Failed to create investment" };
  }
}

export async function updateProfile(data: {
  name?: string;
  image?: string;
  clearImage?: boolean; // Flag to remove image
}) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return { success: false, error: "User not found" };

    const updateData: Prisma.UserUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.clearImage) updateData.image = null;

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard"); // To update name in welcome message
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return { success: false, error: "User not found" };

    // Check if current password matches (simple equality for now, normally use bcrypt)
    if (user.password !== data.currentPassword) {
      return { success: false, error: "Incorrect current password" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: data.newPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update password:", error);
    return { success: false, error: "Failed to update password" };
  }
}

export async function getUserData() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) return null;

    const [user, transactions, assets, investments] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.transaction.findMany({ 
        where: { userId }, 
        orderBy: { createdAt: 'desc' } 
      }),
      prisma.cryptoAsset.findMany({ 
        include: { networks: true } 
      }),
      prisma.investment.findMany({ 
        where: { userId }, 
        orderBy: { startDate: 'desc' } 
      })
    ]);

    if (!user) return null;

    return {
      balance: Number(user.balance),
      transactions: transactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount)
      })),
      assets,
      investments: investments.map(inv => ({
        ...inv,
        amount: Number(inv.amount),
        profit: Number(inv.profit),
        dailyROI: Number(inv.dailyROI)
      }))
    };
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return null;
  }
}

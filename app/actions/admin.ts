"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * Admin Login - Verifies credentials and admin role
 */
export async function adminLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) {
      return { error: "Invalid email or password" };
    }

    // Verify admin role
    if (user.role !== "ADMIN") {
      return { error: "Access denied. Admin privileges required." };
    }

    // Set auth cookie
    (await cookies()).set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return { error: "Something went wrong" };
  }

  // Redirect to admin dashboard
  redirect("/admin");
}

/**
 * Admin Logout - Clears session and redirects
 */
export async function adminLogout() {
  (await cookies()).delete("userId");
  redirect("/");
}

/**
 * Confirms a deposit transaction.
 * - Updates transaction status to COMPLETED
 * - Adds amount to user balance
 */
export async function confirmDeposit(transactionId: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) return { success: false, error: "Transaction not found" };
    if (transaction.type !== "DEPOSIT") return { success: false, error: "Not a deposit transaction" };
    if (transaction.status === "COMPLETED") return { success: false, error: "Transaction already completed" };

    // Transactional update to ensure atomicity
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED" },
      }),
      prisma.user.update({
        where: { id: transaction.userId },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      }),
    ]);

    revalidatePath("/admin/transactions");
    return { success: true };
  } catch (error) {
    console.error("Confirm Deposit Error:", error);
    return { success: false, error: "Failed to confirm deposit" };
  }
}

/**
 * Confirms a withdrawal transaction.
 * - Updates transaction status to COMPLETED
 * - Deducts amount from user balance OR investment
 */
export async function confirmWithdrawal(transactionId: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });

    if (!transaction) return { success: false, error: "Transaction not found" };
    if (transaction.type !== "WITHDRAWAL") return { success: false, error: "Not a withdrawal transaction" };
    if (transaction.status === "COMPLETED") return { success: false, error: "Transaction already completed" };

    const amount = Number(transaction.amount);

    // Determine Source
    if (!transaction.source || transaction.source === "WALLET") {
      // Deduct from Wallet Balance
      if (Number(transaction.user.balance) < amount) {
         return { success: false, error: "Insufficient user wallet balance" };
      }

      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transactionId },
          data: { status: "COMPLETED" },
        }),
        prisma.user.update({
          where: { id: transaction.userId },
          data: {
            balance: {
              decrement: amount,
            },
          },
        }),
      ]);

    } else {
      // Deduct from Investment
      const investmentId = transaction.source;
      const investment = await prisma.investment.findUnique({
        where: { id: investmentId }
      });

      if (!investment) return { success: false, error: "Investment source not found" };

      const totalVal = Number(investment.amount) + Number(investment.profit);
      if (totalVal < amount) {
         return { success: false, error: "Insufficient investment balance" };
      }

      // Logic: Deduct from profit first? Or just amount?
      // Simplest approach: Decrement amount. (Or we could split logic, but decrementing amount is safer for now)
      // Actually, if amount > investment.amount, we need to touch profit.
      // Let's decrement `profit` first, then `amount`? Or just `amount`. 
      // User request: "subtract it from the users source of fund (balance or investment field)"
      
      // We will perform a check. If we just decrement amount it might go negative if most value is in profit.
      // Better strategy: Calculate new total.
      // We'll update both proportionally or just `profit` then `amount`. 
      // Let's keep it simple: Decrement from `profit` first, then `amount`.
      
      let remainingToDeduct = amount;
      let newProfit = Number(investment.profit);
      let newAmount = Number(investment.amount);

      if (newProfit >= remainingToDeduct) {
        newProfit -= remainingToDeduct;
        remainingToDeduct = 0;
      } else {
        remainingToDeduct -= newProfit;
        newProfit = 0;
        newAmount -= remainingToDeduct; 
      }
      
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transactionId },
          data: { status: "COMPLETED" },
        }),
        prisma.investment.update({
          where: { id: investmentId },
          data: {
             profit: newProfit,
             amount: newAmount
          }
        })
      ]);
    }

    revalidatePath("/admin/transactions");
    return { success: true };
  } catch (error) {
    console.error("Confirm Withdrawal Error:", error);
    return { success: false, error: "Failed to confirm withdrawal" };
  }
}

/**
 * Marks a transaction as FAILED.
 * - Updates transaction status to FAILED
 * - No funds are moved.
 */
export async function failTransaction(transactionId: string) {
  try {
     await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "FAILED" },
     });
     revalidatePath("/admin/transactions");
     return { success: true };
  } catch (error) {
    console.error("Fail Transaction Error:", error);
    return { success: false, error: "Failed to mark transaction as failed" };
  }
}

// Generic wrappers for the UI component
export async function approveTransaction(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) return { success: false, error: "Transaction not found" };

  if (transaction.type === "DEPOSIT") {
    return confirmDeposit(transactionId);
  } else if (transaction.type === "WITHDRAWAL") {
    return confirmWithdrawal(transactionId);
  }

  return { success: false, error: "Unknown transaction type" };
}

export async function rejectTransaction(transactionId: string) {
  return failTransaction(transactionId);
}

export async function deleteTransaction(transactionId: string) {
  try {
    await prisma.transaction.delete({
      where: { id: transactionId },
    });
    revalidatePath("/admin/transactions");
    return { success: true };
  } catch (error) {
    console.error("Delete Transaction Error:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}
export async function updateTransaction(id: string, data: { amount?: number; status?: string; txHash?: string }) {
  try {
    // Note: Changing status here directly serves as a manual override.
    // Ideally use confirm/reject for logic, but this is for fixing data.
    await prisma.transaction.update({
      where: { id },
      data: {
          amount: data.amount,
          status: data.status,
          txHash: data.txHash
      }
    });
    revalidatePath("/admin/transactions");
    return { success: true };
  } catch (error) {
     return { success: false, error: "Failed to update transaction" };
  }
}

// --- Asset Management ---

export async function createAsset(data: { symbol: string; name: string; icon?: string }) {
  try {
    const asset = await prisma.cryptoAsset.create({ data });
    revalidatePath("/admin/assets");
    return { success: true, data: asset };
  } catch (error) {
    return { success: false, error: "Failed to create asset" };
  }
}

export async function updateAsset(id: string, data: { name?: string; symbol?: string; icon?: string | null }) {
  try {
    await prisma.cryptoAsset.update({ where: { id }, data });
    revalidatePath("/admin/assets");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update asset" };
  }
}

export async function deleteAsset(id: string) {
  try {
    // Delete networks first
    await prisma.network.deleteMany({ where: { assetId: id } });
    await prisma.cryptoAsset.delete({ where: { id } });
    revalidatePath("/admin/assets");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete asset" };
  }
}

// --- Network Management ---

export async function createNetwork(data: { name: string; depositAddress?: string; assetId: string; icon?: string }) {
  try {
    const network = await prisma.network.create({ data });
    revalidatePath("/admin/networks");
    revalidatePath("/admin/assets"); // Usually shown together
    return { success: true, data: network };
  } catch (error) {
    return { success: false, error: "Failed to create network" };
  }
}

export async function updateNetwork(id: string, data: { name?: string; depositAddress?: string | null; icon?: string | null }) {
  try {
    await prisma.network.update({ where: { id }, data });
    revalidatePath("/admin/networks");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update network" };
  }
}

export async function deleteNetwork(id: string) {
  try {
    await prisma.network.delete({ where: { id } });
    revalidatePath("/admin/networks");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete network" };
  }
}

export async function getTransactions(filters: { q?: string; type?: string; status?: string } = {}) {
  const where: Prisma.TransactionWhereInput = {};
  
  if (filters.type && filters.type !== "ALL") where.type = filters.type;
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  
  if (filters.q) {
    where.OR = [
      { txHash: { contains: filters.q } },
      { id: { contains: filters.q } },
      { user: { email: { contains: filters.q } } }
    ];
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return transactions.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
      user: tx.user ? {
        ...tx.user,
        balance: Number(tx.user.balance)
      } : null
    }));
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

// Fetches all assets with their networks
export async function getAssets() {
  try {
    const assets = await prisma.cryptoAsset.findMany({
      include: { networks: true },
      orderBy: { createdAt: 'desc' }
    });
    return assets.map((asset) => ({
      ...asset,
    }));
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return [];
  }
}

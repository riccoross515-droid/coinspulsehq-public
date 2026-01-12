"use server";

import prisma from "@/lib/prisma";

export async function getAssets() {
  try {
    const assets = await prisma.cryptoAsset.findMany({
      include: {
        networks: true
      },
      orderBy: {
        symbol: 'asc' // or custom order
      }
    });
    return { success: true, data: assets };
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return { success: false, error: "Failed to load assets" };
  }
}

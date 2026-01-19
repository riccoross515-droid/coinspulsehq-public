import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Find Bitcoin asset
    const btcAsset = await prisma.cryptoAsset.findFirst({
      where: {
        symbol: {
          equals: "BTC",
          mode: "insensitive",
        },
      },
      include: {
        networks: true,
      },
    });

    if (!btcAsset || btcAsset.networks.length === 0) {
      return NextResponse.json(
        { error: "Bitcoin deposit not configured" },
        { status: 404 }
      );
    }

    // Get the first network with a deposit address
    const network = btcAsset.networks.find((n) => n.depositAddress);

    if (!network?.depositAddress) {
      return NextResponse.json(
        { error: "No deposit address configured" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      address: network.depositAddress,
      network: network.name,
      asset: btcAsset.symbol,
    });
  } catch (error) {
    console.error("Failed to fetch deposit address:", error);
    return NextResponse.json(
      { error: "Failed to fetch deposit address" },
      { status: 500 }
    );
  }
}

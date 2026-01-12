import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false",
      { headers: { "Accept": "application/json" }, next: { revalidate: 60 } }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch from CoinGecko");
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Crypto API Error:", error);
    // Fallback data if API fails (e.g. rate limit)
    return NextResponse.json([
      { id: "bitcoin", symbol: "btc", name: "Bitcoin", current_price: 90543, price_change_percentage_24h: -0.58, image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png" },
      { id: "ethereum", symbol: "eth", name: "Ethereum", current_price: 3092, price_change_percentage_24h: -0.34, image: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png" },
      { id: "ripple", symbol: "xrp", name: "XRP", current_price: 2.09, price_change_percentage_24h: -0.27, image: "https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
      { id: "solana", symbol: "sol", name: "Solana", current_price: 145.20, price_change_percentage_24h: 3.45, image: "https://coin-images.coingecko.com/coins/images/4128/large/solana.png" },
      { id: "binancecoin", symbol: "bnb", name: "BNB", current_price: 602.15, price_change_percentage_24h: 0.15, image: "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
    ]);
  }
}

"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface CryptoTickerProps {
  data: Array<{
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
  }>;
}

export const CryptoTicker = ({ data }: CryptoTickerProps) => {
  // Quadruple the data to ensure seamless infinite scrolling even on large screens
  const extendedData = [...data, ...data, ...data, ...data];

  return (
    <div className="w-full bg-background/50 border-b border-border backdrop-blur-sm overflow-hidden h-14 flex items-center relative z-40">
      <div className="flex w-max animate-scroll hover:[animation-play-state:paused]">
        {extendedData.map((coin, index) => (
          <div
            key={`${coin.id}-${index}`}
            className="flex items-center gap-3 px-8 border-r border-border/50 min-w-[200px]"
          >
            <div className="relative w-6 h-6 shrink-0">
               {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={coin.image} 
                alt={coin.name}
                className="object-contain w-full h-full rounded-full"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">{coin.symbol}</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-muted-foreground">${coin.current_price.toLocaleString()}</span>
                <span
                  className={`flex items-center ${
                    coin.price_change_percentage_24h >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {coin.price_change_percentage_24h >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Gradient Fade Edges */}
       <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
       <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />
    </div>
  );
};

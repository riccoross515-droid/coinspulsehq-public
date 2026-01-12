import { Bitcoin, Wallet, DollarSign } from "lucide-react";
import Image from "next/image";

interface CryptoIconProps {
  symbol: string;
  iconUrl?: string | null;
  className?: string;
}

export function CryptoIcon({ symbol, iconUrl, className = "h-6 w-6" }: CryptoIconProps) {
  // If iconUrl is provided, use Next.js Image component
  if (iconUrl) {
    return (
      <div className={`${className} relative`}>
        <Image
          src={iconUrl}
          alt={symbol}
          fill
          className="object-contain"
          sizes="48px"
        />
      </div>
    );
  }

  // Fallback to icon components
  const s = symbol.toLowerCase();
  
  if (s === 'btc') return <Bitcoin className={className} />;
  if (s === 'eth') return <div className={`${className} flex items-center justify-center font-bold text-xs`}>ETH</div>;
  if (s === 'usdt') return <DollarSign className={className} />;

  // Default fallback
  return <div className={`${className} rounded-full bg-muted flex items-center justify-center text-[10px] font-bold`}>{symbol.substring(0, 2)}</div>;
}

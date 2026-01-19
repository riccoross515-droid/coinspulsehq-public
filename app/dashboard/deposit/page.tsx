"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { 
  ArrowLeft, 
  Bitcoin, 
  ArrowRight,
  Loader2,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { CryptoIcon } from "@/app/components/ui/CryptoIcon";

export default function DepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [usdValue, setUsdValue] = useState<number | null>(null);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(true);

  // Fetch BTC price on mount
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        if (res.ok) {
          const data = await res.json();
          setBtcPrice(data.bitcoin?.usd || 0);
        }
      } catch (error) {
        console.error("Failed to fetch BTC price:", error);
        setBtcPrice(100000); // Fallback price
      } finally {
        setIsFetchingPrice(false);
      }
    };
    fetchPrice();
  }, []);

  // Calculate USD value when amount changes
  useEffect(() => {
    if (amount && btcPrice) {
      const btcAmount = parseFloat(amount);
      if (!isNaN(btcAmount)) {
        setUsdValue(btcAmount * btcPrice);
      } else {
        setUsdValue(null);
      }
    } else {
      setUsdValue(null);
    }
  }, [amount, btcPrice]);

  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsLoading(true);
    // Navigate to checkout with amount in URL
    router.push(`/dashboard/deposit/checkout?amount=${amount}`);
  };

  const isValidAmount = amount && parseFloat(amount) > 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/30 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/dashboard/wallet" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Wallet</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-foreground">CoinsPulse</span>
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Title Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 mb-4">
              <Bitcoin className="h-10 w-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Deposit Bitcoin</h1>
            <p className="text-muted-foreground text-lg">
              Enter the amount of BTC you wish to deposit
            </p>
          </div>

          {/* Price Display */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">Current BTC Price:</span>
            {isFetchingPrice ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="font-bold text-foreground">
                ${btcPrice?.toLocaleString() ?? "N/A"}
              </span>
            )}
          </div>

          {/* Amount Input Card */}
          <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
            <div className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount (BTC)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <CryptoIcon symbol="BTC" className="h-6 w-6" />
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00000000"
                    step="any"
                    min="0"
                    className="w-full h-16 pl-14 pr-6 rounded-2xl border border-border/50 bg-background/50 text-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>

              {/* USD Conversion */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">USD Value</span>
                  <span className="text-xl font-bold text-foreground">
                    {usdValue !== null 
                      ? `≈ $${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "—"
                    }
                  </span>
                </div>
              </div>

              {/* Network Info */}
              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Bitcoin className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Bitcoin Network</p>
                    <p className="text-xs text-muted-foreground">BTC Mainnet</p>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleContinue}
                disabled={!isValidAmount || isLoading || isFetchingPrice}
                className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Continue to Payment
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Info Footer */}
          <p className="text-center text-xs text-muted-foreground/70">
            Deposits are credited after blockchain confirmation. Processing typically takes 10-30 minutes.
          </p>
        </div>
      </main>
    </div>
  );
}

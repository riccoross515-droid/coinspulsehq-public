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
  TrendingUp,
  Copy,
  Check
} from "lucide-react";
import toast from "react-hot-toast";

export default function DepositPage() {
  const router = useRouter();
  const [usdAmount, setUsdAmount] = useState("");
  const [calculatedBtc, setCalculatedBtc] = useState<number | null>(null);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(true);
  const [copied, setCopied] = useState(false);

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

  // Calculate BTC value when USD amount changes
  useEffect(() => {
    if (usdAmount && btcPrice) {
      const usdValue = parseFloat(usdAmount);
      if (!isNaN(usdValue) && btcPrice > 0) {
        setCalculatedBtc(usdValue / btcPrice);
      } else {
        setCalculatedBtc(null);
      }
    } else {
      setCalculatedBtc(null);
    }
  }, [usdAmount, btcPrice]);

  const handleContinue = () => {
    if (!calculatedBtc || calculatedBtc <= 0) return;
    setIsLoading(true);
    // Navigate to checkout with the calculated BTC amount
    router.push(`/dashboard/deposit/checkout?amount=${calculatedBtc.toFixed(8)}`);
  };

  const handleCopyBtc = () => {
    if (calculatedBtc) {
      navigator.clipboard.writeText(calculatedBtc.toFixed(8));
      setCopied(true);
      toast.success("BTC value copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isValidAmount = usdAmount && parseFloat(usdAmount) > 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/30 backdrop-blur-xl bg-background/80 sticky top-0 z-40">
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
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Title Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 mb-4">
              <Bitcoin className="h-10 w-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Deposit Bitcoin</h1>
            <p className="text-muted-foreground text-lg">
              Enter the USD amount you wish to deposit
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
                  Amount (USD)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground font-bold text-xl">
                    $
                  </div>
                  <input
                    type="number"
                    value={usdAmount}
                    onChange={(e) => setUsdAmount(e.target.value)}
                    placeholder="1000.00"
                    step="any"
                    min="0"
                    className="w-full h-16 pl-10 pr-6 rounded-2xl border border-border/50 bg-background/50 text-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>

              {/* BTC Conversion */}
              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                <div className="flex items-center justify-between mb-1">
                   <span className="text-sm text-muted-foreground">You will deposit</span>
                   <span className="text-xs text-orange-500/70 border border-orange-500/20 bg-orange-500/5 px-2 py-0.5 rounded-full">Bitcoin Network</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="h-5 w-5 text-orange-500" />
                    <span className="text-xl font-bold text-foreground font-mono">
                      {calculatedBtc !== null 
                        ? calculatedBtc.toFixed(8)
                        : "0.00000000"
                      }
                    </span>
                  </div>
                  {calculatedBtc !== null && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCopyBtc}
                      className="h-8 w-8 hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
                      title="Copy BTC value"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Info Snippet */}
              <div className="text-xs text-muted-foreground/70 text-center px-2">
                 Exchange rate updates automatically. Final amount may vary slightly due to market volatility.
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


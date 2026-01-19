"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { 
  ArrowLeft, 
  Bitcoin, 
  Copy,
  Check,
  Loader2,
  Sparkles,
  Clock,
  Shield,
  AlertCircle
} from "lucide-react";
import { CryptoIcon } from "@/app/components/ui/CryptoIcon";
import { createTransaction } from "@/app/actions/user";
import toast from "react-hot-toast";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");
  
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [usdValue, setUsdValue] = useState<number | null>(null);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds

  // Redirect if no amount
  useEffect(() => {
    if (!amount) {
      router.replace("/dashboard/deposit");
    }
  }, [amount, router]);

  // Fetch deposit address and BTC price
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch BTC price
        const priceRes = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        if (priceRes.ok) {
          const priceData = await priceRes.json();
          const price = priceData.bitcoin?.usd || 100000;
          setBtcPrice(price);
          if (amount) {
            setUsdValue(parseFloat(amount) * price);
          }
        }

        // Fetch deposit address from API
        const addressRes = await fetch("/api/deposit-address");
        if (addressRes.ok) {
          const addressData = await addressRes.json();
          setDepositAddress(addressData.address);
        } else {
          // Fallback
          setDepositAddress("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setDepositAddress("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
        setBtcPrice(100000);
        if (amount) {
          setUsdValue(parseFloat(amount) * 100000);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [amount]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = useCallback(() => {
    if (depositAddress) {
      navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [depositAddress]);

  const handlePaymentSent = async () => {
    if (!amount) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await createTransaction({
        amount: parseFloat(amount),
        type: "DEPOSIT",
        currency: "BTC",
        network: "Bitcoin",
        address: depositAddress || "",
      });

      if (result.success) {
        // Redirect to dashboard with success indicator
        router.push("/dashboard?deposit=pending");
        toast.success(
          "Deposit submitted! Awaiting blockchain confirmation. Your funds will be credited shortly.",
          { duration: 6000 }
        );
      } else {
        toast.error(result.error || "Failed to submit deposit");
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!amount) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/30 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/dashboard/deposit" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-foreground">CoinsPulse</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Preparing your deposit...</p>
          </div>
        ) : (
          <div className="w-full max-w-lg space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Timer */}
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Address valid for</span>
              <span className={`font-mono font-bold ${timeRemaining < 300 ? 'text-red-500' : 'text-amber-500'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>

            {/* Main Payment Card */}
            <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
              {/* Amount Section */}
              <div className="p-8 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-b border-border/30">
                <div className="text-center space-y-4">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Send Exactly
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <CryptoIcon symbol="BTC" className="h-10 w-10" />
                    <span className="text-4xl font-bold font-mono text-foreground">
                      {parseFloat(amount).toFixed(8)}
                    </span>
                    <span className="text-2xl font-bold text-orange-500">BTC</span>
                  </div>
                  {usdValue !== null && (
                    <p className="text-lg text-muted-foreground">
                      ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </p>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    To This Address
                  </p>
                  <div className="relative group">
                    <div 
                      className="p-5 rounded-2xl bg-muted/50 border border-border/50 font-mono text-sm break-all leading-relaxed cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={handleCopy}
                    >
                      {depositAddress}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-background/80 border border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-lg"
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Network Badge */}
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30">
                  <Bitcoin className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-muted-foreground">Network:</span>
                  <span className="text-sm font-bold text-foreground">Bitcoin Mainnet</span>
                </div>

                {/* Security Note */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Only send <span className="font-bold text-foreground">Bitcoin (BTC)</span> to this address. 
                    Sending any other cryptocurrency may result in permanent loss.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handlePaymentSent}
                    disabled={isSubmitting}
                    className="w-full h-16 text-lg font-bold shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      "I've Sent the Payment"
                    )}
                  </Button>
                  
                  <Link href="/dashboard/wallet" className="block">
                    <Button
                      variant="ghost"
                      className="w-full h-12 text-muted-foreground hover:text-foreground"
                      disabled={isSubmitting}
                    >
                      Cancel Payment
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Warning Footer */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground/70 justify-center">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-center">
                After confirming, our team will verify your transaction. 
                Credits are applied within 10-30 minutes of blockchain confirmation.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

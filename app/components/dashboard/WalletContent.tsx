"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { 
  Copy, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Bitcoin, 
  Wallet as WalletIcon, 
  DollarSign, 
  Check, 
  Loader2,
  AlertCircle,
  RefreshCcw,
  KeyRound,
  X 
} from "lucide-react";
import { initiateWithdrawal, completeWithdrawal } from "@/app/actions/user";
import OtpInput from "@/app/components/ui/OtpInput";
import toast from "react-hot-toast";

import { CryptoIcon } from "@/app/components/ui/CryptoIcon";
import { useIsDark } from "@/app/hooks/use-is-dark";
import { useTheme } from "next-themes";
import { useUserData } from "@/app/hooks/use-user-data";

// Types
interface Network {
  id: string;
  name: string;
  depositAddress: string | null;
  // assetId removed as it's not present in API response
}

interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  icon: string | null;
  networks: Network[];
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  assetAmount?: number | null;
  type: string;
  status: string;
  currency: string;
  network?: string | null;
  address: string | null;
  txHash?: string | null;
  source?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

interface Investment {
  id: string;
  planId: string;
  amount: number;
  profit: number;
  status: string;
  endDate: string | Date | null;
}

import { FullPageLoader } from "@/app/components/ui/FullPageLoader";

// ... existing imports

interface WalletContentProps {
  initialData?: any; // Made optional/any since we aren't passing it anymore
}

export function WalletContent({ initialData }: WalletContentProps) {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  
  // Client-side Fetching only
  // Client-side Fetching with Hook
  const { data, refetch, isFetching, isLoading } = useUserData(initialData);

  // Form States
  // Initialize with empty/null if loading
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [withdrawalSource, setWithdrawalSource] = useState<string>("wallet"); 
  const [amount, setAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [isPending, startTransition] = useTransition();
  const isDarkMode = useIsDark();

  // OTP State
  const [showWithdrawOTP, setShowWithdrawOTP] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Effect to set initial asset/network when data loads
  useEffect(() => {
     if (data?.assets && data.assets.length > 0 && !selectedAsset) {
         setSelectedAsset(data.assets[0]);
         if (data.assets[0].networks && data.assets[0].networks.length > 0) {
             setSelectedNetwork(data.assets[0].networks[0]);
         }
     }
  }, [data, selectedAsset]);

  if (isLoading && !data) {
      return <FullPageLoader />;
  }

  const { balance = 0, transactions = [], assets = [], investments = [] } = data || {};

  // Derived state for selected source
  const selectedInvestment = investments.find((inv: Investment) => inv.id === withdrawalSource);
  
  // Calculate max withdrawable amount based on source
  const maxAmount = withdrawalSource === "wallet" 
    ? balance 
    : (Number(selectedInvestment?.amount || 0) + Number(selectedInvestment?.profit || 0));

  // Lock status check
  const isLocked = Boolean(
    withdrawalSource !== "wallet" && 
    selectedInvestment && 
    (!selectedInvestment.endDate || new Date(selectedInvestment.endDate).getTime() > Date.now())
  );

  // Calculate pending withdrawals for the selected source
  const pendingAmount = (transactions as Transaction[])
    .filter((tx: Transaction) => 
      tx.type === 'WITHDRAWAL' && 
      tx.status === 'PENDING' && 
      ((withdrawalSource === "wallet" && (!tx.source || tx.source === "WALLET")) || tx.source === withdrawalSource)
    )
    .reduce((sum: number, tx: Transaction) => sum + Number(tx.amount), 0);

  const availableToWithdraw = Math.max(0, maxAmount - pendingAmount);

  const handleAssetSelect = (asset: CryptoAsset) => {
    setSelectedAsset(asset);
    setSelectedNetwork(asset.networks.length > 0 ? asset.networks[0] : null);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !amount || !withdrawAddress) return;

    if (parseFloat(amount) < 1) {
      toast.error("Minimum withdrawal amount is $1");
      return;
    }

    if (parseFloat(amount) > availableToWithdraw) {
      toast.error("Insufficient funds (including pending withdrawals)");
      return;
    }

    if (isLocked) {
        toast.error("This investment is currently locked.");
        return;
    }

    startTransition(async () => {
        // 1. Initiate Withdrawal (Validate & Send OTP)
        const result = await initiateWithdrawal({
            amount: parseFloat(amount),
            currency: selectedAsset.symbol,
            network: selectedNetwork?.name || "External",
            address: withdrawAddress,
            source: withdrawalSource 
        });

      if (result.success) {
        toast.success("Verification code sent to your email.");
        setShowWithdrawOTP(true);
        // Focus first OTP input after a short delay for modal animation
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        toast.error(result.error || "Failed to initiate withdrawal");
      }
    });
  };

  const handleWithdrawOtpSubmit = async (code: string) => {
    // 2. Complete Withdrawal (Verify OTP & Create Tx)
    startTransition(async () => {
        const result = await completeWithdrawal({
            amount: parseFloat(amount),
            currency: selectedAsset?.symbol || "USD",
            network: selectedNetwork?.name || "External",
            address: withdrawAddress,
            source: withdrawalSource,
            otp: code
        });

        if (result.success) {
            toast.success("Withdrawal request confirmed successfully!");
            setAmount("");
            setWithdrawAddress("");
            setShowWithdrawOTP(false);
            setOtp(["", "", "", "", "", ""]);
            refetch();
        } else {
            toast.error(result.error || "Verification failed");
        }
    });
  };

  // OTP Input Logic
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 relative">
      {/* OTP Modal Overlay */}
      {showWithdrawOTP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl w-full max-w-md relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setShowWithdrawOTP(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
                >
                    <X className="h-5 w-5 text-muted-foreground" />
                </button>
                
                <div className="text-center mb-8">
                     <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4 p-4 border border-primary/20 bg-gradient-to-br from-primary/20 to-transparent">
                        <KeyRound className="h-8 w-8 text-primary" />
                     </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Confirm Withdrawal
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Enter the verification code sent to your email to confirm withdrawal of <span className="font-bold text-foreground">${amount}</span>
                    </p>
                </div>

                <div className="px-4 pb-4">
                     <OtpInput 
                        email="your email"
                        loading={isPending}
                        onComplete={handleWithdrawOtpSubmit}
                        onResend={async () => {
                             const result = await initiateWithdrawal({
                                amount: parseFloat(amount),
                                currency: selectedAsset?.symbol || "USD",
                                network: selectedNetwork?.name || "External",
                                address: withdrawAddress,
                                source: withdrawalSource 
                             });
                             return { success: result.success, error: result.error, message: "Code resent!" };
                        }}
                    />
                </div>
            </div>
        </div>
      )}

      <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-[22.5px] font-semibold text-foreground/90 tracking-tight">Wallet</h1>
              <p className="text-muted-foreground mt-2 text-lg">Manage your crypto assets and transactions.</p>
           </div>
           <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}>
               <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
           </Button>
        </div>

        <Card className="p-1.5 bg-muted/50 border-border/50">
          <div className="grid grid-cols-2 p-1 bg-background/50 rounded-xl backdrop-blur-sm">
            <button
              onClick={() => { setActiveTab("deposit"); }}
              className={`flex items-center justify-center gap-3 py-3.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === "deposit"
                  ? "bg-primary shadow-xl text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowDownLeft className="h-4 w-4" /> Deposit
            </button>
            <button
              onClick={() => { setActiveTab("withdraw"); }}
              className={`flex items-center justify-center gap-3 py-3.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === "withdraw"
                  ? "bg-primary shadow-xl text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowUpRight className="h-4 w-4" /> Withdraw
            </button>
          </div>
        </Card>

        {activeTab === "deposit" ? (
          <Card className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300 border-primary/10">
            <div className="text-center space-y-6">
              {/* Bitcoin Icon */}
              <div className="inline-flex items-center justify-center p-6 rounded-3xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20">
                <Bitcoin className="h-12 w-12 text-orange-500" />
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Deposit Bitcoin</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Securely deposit BTC to your account using our payment gateway
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="text-center space-y-2">
                  <div className="mx-auto p-2 rounded-xl bg-green-500/10 w-fit">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Instant Address</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="mx-auto p-2 rounded-xl bg-blue-500/10 w-fit">
                    <WalletIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Secure Wallet</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="mx-auto p-2 rounded-xl bg-purple-500/10 w-fit">
                    <DollarSign className="h-5 w-5 text-purple-500" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Live Rates</p>
                </div>
              </div>

              {/* CTA Button */}
              <Link href="/dashboard/deposit" className="block">
                <Button className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all">
                  <ArrowDownLeft className="h-5 w-5 mr-2" />
                  Start Deposit
                </Button>
              </Link>

              {/* Info */}
              <p className="text-[11px] text-muted-foreground">
                Funds credited after blockchain confirmation • Usually 10-30 minutes
              </p>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleWithdrawSubmit}>
            <Card className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300 border-primary/10">

               <div className="space-y-8">
                   <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl shadow-inner">
                      <div className="flex items-center gap-2 mb-1 opacity-70">
                        <p className={`text-sm font-semibold uppercase tracking-wide ${isDarkMode ? 'text-primary' : 'text-[#333]'}`}>
                           Available To Withdraw
                        </p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border border-border/50 ${
                            withdrawalSource === "wallet" ? "bg-background/50" : "bg-purple-500/10 text-purple-500"
                        }`}>
                           {withdrawalSource === "wallet" ? "WALLET" : "INVESTMENT"}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-foreground tracking-tight">${availableToWithdraw.toLocaleString()}</p>
                      
                      {pendingAmount > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground font-medium flex gap-2">
                           <span>Total: ${maxAmount.toLocaleString()}</span>
                           <span className="text-amber-500">• Pending: ${pendingAmount.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {isLocked && (
                          <div className="absolute top-4 right-4 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                              {selectedInvestment?.endDate 
                                ? `Locked until ${new Date(selectedInvestment.endDate).toLocaleDateString()}`
                                : "Investment Locked"
                              }
                          </div>
                      )}
                   </div>
                    
                   <div className="space-y-3 flex flex-col">
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide ml-1">Withdrawal Source</label>
                      <select 
                        disabled={isPending}
                        value={withdrawalSource}
                        onChange={(e) => setWithdrawalSource(e.target.value)}
                        className="w-full h-14 rounded-2xl border border-border/50 bg-muted/50 px-5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      >
                          <option value="wallet">Main Wallet Balance</option>
                          {investments.filter((i: Investment) => i.status === 'ACTIVE').map((inv: Investment) => (
                              <option key={inv.id} value={inv.id}>
                                  {inv.planId} Plan (${(Number(inv.amount) + Number(inv.profit)).toLocaleString()})
                              </option>
                          ))}
                      </select>
                   </div>

                   <div className="space-y-3 flex flex-col">
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide ml-1">Select Currency</label>
                      <select 
                        disabled={isPending}
                        value={selectedAsset?.id}
                        onChange={(e) => {
                            const asset = assets.find((a: CryptoAsset) => a.id === e.target.value);
                            if (asset) handleAssetSelect(asset);
                        }}
                        className="w-full h-14 rounded-2xl border border-border/50 bg-muted/50 px-5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      >
                          {assets.map((asset: CryptoAsset) => (
                              <option key={asset.id} value={asset.id}>{asset.name} ({asset.symbol})</option>
                          ))}
                      </select>
                   </div>

                   {/* Network Selection for Withdrawal */}
                   {selectedAsset && selectedAsset.networks.length > 0 && (
                       <div className="space-y-3 flex flex-col animate-in fade-in slide-in-from-top-2">
                          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide ml-1">Select Network</label>
                          <select 
                            disabled={isPending}
                            value={selectedNetwork?.id}
                            onChange={(e) => {
                                const net = selectedAsset.networks.find((n: Network) => n.id === e.target.value);
                                if (net) setSelectedNetwork(net);
                            }}
                            className="w-full h-14 rounded-2xl border border-border/50 bg-muted/50 px-5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                          >
                              {selectedAsset.networks.map((net: Network) => (
                                  <option key={net.id} value={net.id}>{net.name}</option>
                              ))}
                          </select>
                       </div>
                   )}

                   <div className="space-y-3 flex flex-col">
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide ml-1">Withdrawal Address</label>
                      <input 
                          type="text" 
                          required
                          disabled={isPending}
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          className="w-full h-14 rounded-2xl border border-border/50 bg-muted/50 px-5 text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                   </div>

                   <div className="space-y-3 flex flex-col">
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide ml-1">Amount (USD equivalent)</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black">$</span>
                        <input 
                            type="number" 
                            required
                            disabled={isPending || isLocked}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            max={maxAmount}
                            min="1"
                            step="any"
                            className="w-full h-14 rounded-2xl border border-border/50 bg-muted/50 pl-10 px-5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                        />
                      </div>
                   </div>
                   
                   <Button 
                      disabled={isPending || !amount || !withdrawAddress || ((isLocked || parseFloat(amount) > maxAmount) as boolean)}
                      className="w-full h-16 text-lg font-bold shadow-2xl shadow-primary/20 mt-4 disabled:bg-muted disabled:text-muted-foreground"
                   >
                     {isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : isLocked ? <span className="flex items-center gap-2"><div className="h-4 w-4"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div> Investment Locked</span> : "Request Withdrawal"}
                   </Button>
                   <p className="text-[11px] text-muted-foreground text-center font-medium">
                     <AlertCircle className={`h-3 w-3 inline mr-1 ${isDarkMode ? 'text-amber-500' : 'text-[#333]'}`} /> 
                     Withdrawals are processed manually within 24 hours for security.
                   </p>
               </div>
            </Card>
          </form>
        )}
      </div>

      {/* History Section */}
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-[22.5px] font-semibold text-foreground/90 tracking-tight">Recent Transactions</h2>
            <Link href="/dashboard/transactions">
              <Button variant="ghost" size="sm" className={`h-10 px-4 font-medium hover:bg-primary/5 rounded-xl ${isDarkMode ? 'text-primary/70 hover:text-primary' : 'text-[#333]/70 hover:text-[#333]'}`}>View All</Button>
            </Link>
          </div>

         <Card className="divide-y divide-border/30 overflow-hidden border-border/50 shadow-xl bg-card/30 backdrop-blur-xs">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p>No transactions yet.</p>
              </div>
            ) : (
              transactions.map((tx: Transaction) => (
                      <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-primary/5 transition-all group">
                          <div className="flex items-center gap-5">
                              <div className={`p-3 rounded-2xl transition-all group-hover:scale-110 ${
                                tx.type === 'WITHDRAWAL' || tx.type === 'INVESTMENT' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                              }`}>
                                  {tx.type === 'WITHDRAWAL' || tx.type === 'INVESTMENT' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                              </div>
                              <div>
                                  <p className="text-base font-medium text-foreground mb-0.5">{tx.type.charAt(0).toUpperCase() + tx.type.slice(1).toLowerCase()}</p>
                                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                    {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                  {/* Just show hash if exists, simplified */}
                                  {tx.txHash && (
                                    <p className="text-[10px] text-muted-foreground mt-1 font-mono bg-muted/50 px-2 py-0.5 rounded w-fit max-w-[200px] truncate select-all" title={tx.txHash}>
                                      Tx: {tx.txHash}
                                    </p>
                                  )}
                              </div>
                          </div>
                          <div className="text-right">
                              {/* If deposit and assetAmount exists, show crypto amount first, then USD */}
                              {tx.type === 'DEPOSIT' && tx.assetAmount ? (
                                <>
                                  <p className="text-base font-semibold text-green-500 font-mono">
                                      +{Number(tx.assetAmount).toLocaleString(undefined, { maximumFractionDigits: 8 })} {tx.currency}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-medium">
                                      ≈ ${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className={`text-base font-semibold ${
                                    tx.type === 'DEPOSIT' ? 'text-green-500' : 'text-foreground'
                                  }`}>
                                      {tx.type === 'DEPOSIT' ? '+' : '-'}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                  {tx.currency && (
                                    <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                                        {tx.currency}
                                    </span>
                                  )}
                                </>
                              )}
                              <div className="mt-1">
                                   <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                                     tx.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600 dark:text-green-500' : 
                                     tx.status === 'FAILED' ? 'bg-red-500/10 text-red-600 dark:text-red-500' : 
                                     'bg-amber-500/20 text-amber-700 dark:bg-yellow-500/10 dark:text-yellow-500'
                                   }`}>
                                      {tx.status}
                                   </span>
                              </div>
                          </div>
                      </div>
              ))
            )}
         </Card>
      </div>
    </div>
  );
}

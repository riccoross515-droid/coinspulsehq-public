"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
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
  LucideIcon,
  RefreshCcw
} from "lucide-react";
import { createTransaction, getUserData } from "@/app/actions/user";
import toast from "react-hot-toast";

import { CryptoIcon } from "../ui/CryptoIcon";
import { useIsDark } from "@/app/hooks/use-is-dark";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";

// Types
interface Network {
  id: string;
  name: string;
  depositAddress: string | null;
  assetId: string;
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
  type: string;
  status: string;
  currency: string;
  network: string | null;
  address: string | null;
  txHash: string | null;
  source: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface Investment {
  id: string;
  planId: string;
  amount: number;
  profit: number;
  status: string;
  endDate: string | Date | null;
}

interface WalletContentProps {
  initialData?: {
      balance: number;
      transactions: Transaction[];
      assets: CryptoAsset[];
      investments: Investment[];
  };
}

export function WalletContent({ initialData }: WalletContentProps) {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  
  // Hybrid Fetching
  const { data, refetch, isFetching } = useQuery({
      queryKey: ['userData'],
      queryFn: () => getUserData(),
      initialData: initialData,
      staleTime: 1000 * 60,
      refetchInterval: 1000 * 60,
  });

  const { balance = 0, transactions = [], assets = [], investments = [] } = data || {};

  // Form States
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(assets.length > 0 ? assets[0] : null);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(assets.length > 0 && assets[0].networks.length > 0 ? assets[0].networks[0] : null);
  const [withdrawalSource, setWithdrawalSource] = useState<string>("wallet"); // 'wallet' or investmentId
  const [amount, setAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [isPending, startTransition] = useTransition();
  const isDarkMode = useIsDark();

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

  const handleDepositSubmit = async () => {
    if (!selectedAsset || !selectedNetwork || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    startTransition(async () => {
      const result = await createTransaction({
        amount: parseFloat(amount),
        type: "DEPOSIT",
        currency: selectedAsset.symbol,
        network: selectedNetwork.name,
        address: selectedNetwork?.depositAddress || "",
      });

      if (result.success) {
        toast.success("Deposit submitted! Awaiting blockchain confirmations.");
        setAmount("");
        refetch();
      } else {
        toast.error(result.error || "Failed to submit deposit");
      }
    });
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !amount || !withdrawAddress) return;

    if (parseFloat(amount) > availableToWithdraw) {
      toast.error("Insufficient funds (including pending withdrawals)");
      return;
    }

    if (isLocked) {
        toast.error("This investment is currently locked.");
        return;
    }

    startTransition(async () => {
      const result = await createTransaction({
        amount: parseFloat(amount),
        type: "WITHDRAWAL",
        currency: selectedAsset.symbol,
        network: selectedNetwork?.name || "External",
        address: withdrawAddress,
        source: withdrawalSource 
      });

      if (result.success) {
        toast.success("Withdrawal request submitted! Pending approval.");
        setAmount("");
        setWithdrawAddress("");
        refetch();
      } else {
        toast.error(result.error || "Failed to submit withdrawal");
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
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
             <div className="space-y-4">
                <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">1. Select Asset</h3>
                <div className="grid grid-cols-3 gap-4">
                    {assets.map((asset: CryptoAsset) => (
                        <button
                            key={asset.id}
                            disabled={isPending}
                            onClick={() => handleAssetSelect(asset)}
                            className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all group ${
                                selectedAsset?.id === asset.id 
                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/5 scale-[1.02]" 
                                    : "border-transparent bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                            }`}
                        >
                            <div className={`p-3 rounded-2xl transition-all border border-transparent group-hover:border-current/20 bg-muted`}>
                                <CryptoIcon symbol={asset.symbol} iconUrl={asset.icon} className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-semibold">{asset.symbol}</span>
                        </button>
                    ))}
                </div>
             </div>

            {selectedAsset && selectedAsset.networks.length > 1 && (
                 <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">2. Select Network</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {selectedAsset.networks.map((net: Network) => (
                            <button
                                key={net.id}
                                disabled={isPending}
                                onClick={() => setSelectedNetwork(net)}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                                    selectedNetwork?.id === net.id
                                    ? `border-primary bg-primary/5 ${isDarkMode ? 'text-primary' : 'text-[#333]'}`
                                    : "border-border/50 bg-background hover:bg-secondary hover:border-border"
                                }`}
                            >
                                {net.name}
                                {selectedNetwork?.id === net.id && <Check className="h-4 w-4" />}
                            </button>
                        ))}
                    </div>
                 </div>
            )}

             {selectedAsset && selectedNetwork && (
                 <div className="space-y-6 pt-6 border-t border-border/50 animate-in slide-in-from-top-8 fade-in duration-500">
                    <div className="bg-card p-5 rounded-3xl flex items-center gap-5 border border-border/50 shadow-sm relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className={`p-4 rounded-2xl bg-muted shadow-lg relative z-10`}>
                            <CryptoIcon symbol={selectedAsset.symbol} iconUrl={selectedAsset.icon} className="h-7 w-7" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-lg font-bold">{selectedAsset.name}</p>
                            <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-primary' : 'text-[#333]'}`}>{selectedNetwork.name}</p>
                        </div>
                    </div>

                    <div className="space-y-4 flex flex-col">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                             Deposit Address
                        </label>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-muted/50 border border-border/50 rounded-2xl px-5 py-4 text-sm font-mono text-foreground break-all leading-relaxed shadow-inner">
                                {selectedNetwork.depositAddress}
                            </div>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              type="button"
                              className="shrink-0 h-14 w-14 rounded-2xl border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm" 
                              onClick={() => { navigator.clipboard.writeText(selectedNetwork?.depositAddress || ""); toast.success("Copied!"); }}
                            >
                                <Copy className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide ml-1 block">
                             Step 3: Enter Amount Deposited
                        </label>
                        <div className="relative group">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                           <input 
                               type="number"
                               value={amount}
                               disabled={isPending}
                               onChange={(e) => setAmount(e.target.value)}
                               className="w-full h-14 rounded-2xl border border-border/50 bg-muted/50 pl-10 px-5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                           />
                        </div>
                        <Button 
                          className="w-full h-14 font-bold text-base shadow-xl shadow-primary/20" 
                          onClick={handleDepositSubmit}
                          disabled={isPending || !amount}
                        >
                          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "I have sent the funds"}
                        </Button>
                        <p className="text-[11px] text-muted-foreground text-center font-medium">
                           <AlertCircle className={`h-3 w-3 inline mr-1 ${isDarkMode ? 'text-primary' : 'text-[#333]'}`} /> 
                           Funds will be credited automatically after network confirmation (usually 5-15 mins).
                        </p>
                    </div>
                 </div>
             )}
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
                              {/* DISPLAY FIX: Show as USD formatted */}
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

"use client";

import { useState, useTransition, Suspense } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Check, Info, Rocket, X, Loader2, LayoutGrid, List, Cpu } from "lucide-react";
import { createInvestment, getUserData } from "@/app/actions/user";
import toast from "react-hot-toast";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const plans = [
  {
    id: "starter",
    name: "Standard Contract",
    roi: "0.5% Daily",
    min: 500,
    max: 999,
    features: ["Daily Auto-Compounding", "24/7 Support", "1 Year Lock"],
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "growth",
    name: "Professional Contract",
    roi: "1.2% Daily",
    min: 1000,
    max: 9999,
    features: ["Daily Auto-Compounding", "Priority Support", "1 Year Lock"],
    color: "bg-purple-500/10 text-purple-500",
    recommended: true,
  },
  {
    id: "wealth",
    name: "Institutional Contract",
    roi: "2.5% Daily",
    min: 10000,
    max: 1000000,
    features: ["Real-time Compounding", "VIP Support", "1 Year Lock"],
    color: "bg-[#c99400]/10 text-[#c99400]",
  },
];

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  profit: number;
  status: string;
  startDate: Date;
  endDate: Date | null;
  dailyROI: number;
}

interface InvestContentProps {
  investments?: Investment[];
}

function InvestContentInner({ investments: initialInvestments = [] }: InvestContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const tabParam = searchParams.get("tab");
  const activeTab = (tabParam === "my_investments" ? "my_investments" : "market") as "market" | "my_investments";

  // Hybrid Fetching for Investments
  const { data: userData, refetch } = useQuery({
    queryKey: ['userData'],
    queryFn: () => getUserData(),
    initialData: initialInvestments.length > 0 ? { 
      balance: 0, 
      transactions: [], 
      assets: [], 
      investments: initialInvestments 
    } : undefined,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  });

  const investments = userData?.investments || initialInvestments;

  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [amount, setAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: "market" | "my_investments") => {
      const params = new URLSearchParams(searchParams);
      if (tab === "market") {
          params.delete("tab");
      } else {
          params.set("tab", tab);
      }
      router.replace(`${pathname}?${params.toString()}`);
  };

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const numAmount = parseFloat(amount);
    
    startTransition(async () => {
      const result = await createInvestment({
        planId: selectedPlan.id,
        amount: numAmount,
      });

      if (result.success) {
        toast.success("Mining contract started!");
        setSelectedPlan(null);
        setAmount("");
        refetch(); // Update list immediately
        handleTabChange("my_investments");
      } else {
        toast.error(result.error || "Failed to start contract");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
        <div>
            <h1 className="text-[22.5px] font-semibold text-foreground/90 tracking-tight">Active Mining Contracts</h1>
            <p className="text-muted-foreground mt-1 text-lg">Lease hashrate from our high-performance hardware clusters.</p>
        </div>
        
        <div className="bg-muted/50 p-1 rounded-xl flex gap-1">
            <button
                onClick={() => handleTabChange("market")}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                    activeTab === "market" 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
            >
                <LayoutGrid className="h-4 w-4" /> Mining Market
            </button>
            <button
                onClick={() => handleTabChange("my_investments")}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                    activeTab === "my_investments" 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
            >
                <List className="h-4 w-4" /> My Rigs
            </button>
        </div>
      </div>

      {activeTab === "market" ? (
          <div className="grid gap-6 md:grid-cols-3 animate-in fade-in duration-300">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`p-8 relative transition-all hover:scale-[1.02] hover:border-primary/50 flex flex-col ${plan.recommended ? 'border-primary shadow-2xl shadow-primary/10' : ''}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    MOST EFFICIENT
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${plan.color}`}>
                   <Cpu className="h-7 w-7" />
                </div>

                <h3 className="text-2xl font-semibold tracking-tight">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-8">
                   <span className="text-4xl font-semibold text-foreground tracking-tighter">{plan.roi}</span>
                   <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest">MINING OUTPUT</span>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  <div className="flex justify-between text-sm py-2 border-b border-border/50">
                     <span className="text-muted-foreground font-medium">Lease Min.</span>
                     <span className="font-black text-foreground">${plan.min.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-border/50">
                     <span className="text-muted-foreground font-medium">Lease Max.</span>
                     <span className="font-black text-foreground">${plan.max.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 space-y-3">
                     {plan.id === "starter" && (
                         <>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground/80 font-medium">
                                <div className="p-1 rounded-full bg-green-500/10 text-green-500">
                                <Check className="h-3 w-3" />
                                </div>
                                ASIC Hashrate Allocation
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground/80 font-medium">
                                <div className="p-1 rounded-full bg-green-500/10 text-green-500">
                                <Check className="h-3 w-3" />
                                </div>
                                12 Months Fixed Contract
                            </div>
                         </>
                     )}
                     {plan.id === "growth" && (
                         <>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground/80 font-medium">
                                <div className="p-1 rounded-full bg-green-500/10 text-green-500">
                                <Check className="h-3 w-3" />
                                </div>
                                Priority ASIC Queue
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground/80 font-medium">
                                <div className="p-1 rounded-full bg-green-500/10 text-green-500">
                                <Check className="h-3 w-3" />
                                </div>
                                Dedicated Rig Manager
                            </div>
                         </>
                     )}
                     {plan.id === "wealth" && (
                         <>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground/80 font-medium">
                                <div className="p-1 rounded-full bg-green-500/10 text-green-500">
                                <Check className="h-3 w-3" />
                                </div>
                                Custom Cluster Prov.
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground/80 font-medium">
                                <div className="p-1 rounded-full bg-green-500/10 text-green-500">
                                <Check className="h-3 w-3" />
                                </div>
                                Institutional Hardware
                            </div>
                         </>
                     )}
                  </div>
                </div>

                <Button 
                    onClick={() => setSelectedPlan(plan)} 
                    variant={plan.recommended ? "primary" : "outline"}
                    className="w-full h-14 font-black text-base transition-all hover:shadow-xl active:scale-95"
                >
                    Start Mining
                </Button>
              </Card>
            ))}
          </div>
      ) : (
          <Card className="animate-in slide-in-from-right-4 fade-in duration-300 min-h-[400px] overflow-hidden max-w-[calc(100vw-2rem)] md:max-w-none">
              {investments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="p-4 rounded-full bg-primary/5 mb-4">
                          <Rocket className="h-8 w-8 text-primary/40" />
                      </div>
                      <h3 className="text-lg font-bold">No Active Rigs</h3>
                      <p className="text-muted-foreground max-w-xs mt-2 mb-6">Start your mining journey by leasing hashrate from our global clusters.</p>
                      <Button onClick={() => handleTabChange("market")}>Lease Hashrate</Button>
                  </div>
              ) : (
                   <div className="w-full overflow-x-auto pb-2 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="min-w-[700px] divide-y divide-border/50">
                       <div className="p-6 bg-muted/30 flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                           <div className="w-[30%]">Rig Details</div>
                           <div className="w-[25%]">Active Capital</div>
                           <div className="w-[25%]">Mined Output</div>
                           <div className="w-[20%] text-right">Status</div>
                       </div>
                       {investments.map((inv: Investment) => {
                           // Profit now comes from DB, defaulting to 0 if not set yet
                           const profit = Number(inv.profit || 0);
                           
                           return (
                               <div 
                                    key={inv.id} 
                                    onClick={() => router.push(`/dashboard/invest/${inv.id}`)}
                                    className="p-6 flex justify-between items-center hover:bg-muted/20 transition-colors group cursor-pointer"
                                >
                                   <div className="w-[30%]">
                                       <p className="font-bold text-lg capitalize">{inv.planId === "starter" ? "Standard" : inv.planId === "growth" ? "Professional" : "Institutional"} Rig</p>
                                       <p className="text-xs text-muted-foreground">Active since {new Date(inv.startDate).toLocaleDateString()}</p>
                                   </div>
                                   <div className="w-[25%] font-bold text-foreground">
                                       ${Number(inv.amount).toLocaleString()}
                                   </div>
                                   <div className="w-[25%] font-bold text-green-500">
                                       +${profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                   </div>
                                   <div className="w-[20%] text-right">
                                       <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500">
                                           ONLINE
                                       </span>
                                   </div>
                               </div>
                           );
                       })}
                    </div>
                  </div>
              )}
          </Card>
      )}

      {/* Basic Modal Overlay */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 relative animate-in zoom-in-95 duration-300 border-primary/20 shadow-2xl">
            <button 
                onClick={() => {
                  if (!isPending) setSelectedPlan(null);
                }}
                className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted"
            >
                <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-2xl font-black mb-1">Start Mining {selectedPlan.name}</h2>
            <p className="text-sm text-muted-foreground mb-8 font-medium">
                Hardware lease between <span className="text-foreground font-bold">${selectedPlan.min} - ${selectedPlan.max}</span>
            </p>

            <form onSubmit={handleInvest} className="space-y-6">
                <div className="space-y-3">
                    <label className="text-sm font-bold ml-1">Capital Amount (USD)</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min={selectedPlan.min}
                            max={selectedPlan.max}
                            required
                            disabled={isPending}
                            className="w-full h-14 rounded-2xl border border-input bg-muted/50 pl-10 px-4 py-2 text-lg font-black ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                <div className="bg-amber-500/5 p-4 rounded-2xl flex gap-4 items-start border border-amber-500/10">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-500">
                      <Info className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black text-amber-700 dark:text-amber-400 mb-1">Withdrawal Maturity Policy</p>
                        <p className="text-[11px] text-amber-600 dark:text-amber-500/80 leading-relaxed font-medium">
                            Capital and mined output are locked for a period of <span className="font-bold">12 months</span>. Withdrawals are processed only upon contract completion.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 pt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="flex-1 h-14 font-bold" 
                      onClick={() => setSelectedPlan(null)}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-14 font-black shadow-xl shadow-primary/20"
                      disabled={isPending}
                    >
                      {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Start Mining"}
                    </Button>
                </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export function InvestContent(props: InvestContentProps) {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <InvestContentInner {...props} />
    </Suspense>
  );
}

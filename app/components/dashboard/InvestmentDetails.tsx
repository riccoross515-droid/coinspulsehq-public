"use client";

import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { ArrowLeft, Clock, TrendingUp, AlertTriangle, Lock } from "lucide-react";
import { PerformanceChart } from "./PerformanceChart";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

interface InvestmentDetailsProps {
    investment: {
        id: string;
        planId: string;
        amount: number;
        status: string;
        startDate: Date;
        endDate: Date | null;
        profit: number;
    };
}

export function InvestmentDetails({ investment }: InvestmentDetailsProps) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState<string>("");

    // Calculate time left until unlock
    useEffect(() => {
        if (!investment.endDate) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(investment.endDate!).getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft("Unlocked");
                clearInterval(interval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            setTimeLeft(`${days}d ${hours}h remaining`);
        }, 1000);

        return () => clearInterval(interval);
    }, [investment.endDate]);

    const isLocked = timeLeft !== "Unlocked";
    const totalValue = Number(investment.amount) + Number(investment.profit);
    const progress = Math.min(100, Math.max(0, (Number(investment.profit) / Number(investment.amount)) * 1000)); // Magnify for demo

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/invest?tab=my_investments">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Investments
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Main Stats Card */}
                <Card className="lg:col-span-2 p-8 border-primary/20 bg-primary/5 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Value</p>
                                <h1 className="text-4xl font-black tracking-tighter text-foreground">
                                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h1>
                                <div className="flex items-center gap-2 mt-2 text-green-500 font-bold bg-green-500/10 w-fit px-3 py-1 rounded-full text-sm">
                                    <TrendingUp className="h-4 w-4" />
                                    +${Number(investment.profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Profit
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wide ${
                                    investment.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                                }`}>
                                    {investment.status}
                                </span>
                            </div>
                        </div>

                        {/* Interactive Graph Area */}
                        <div className="h-56 w-full bg-background/40 rounded-xl border border-border/50 p-4 relative overflow-hidden">
                             <PerformanceChart 
                                data={(() => {
                                    const start = new Date(investment.startDate).getTime();
                                    const now = new Date().getTime();
                                    const diffMs = now - start;
                                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                    
                                    // Base principal
                                    const base = investment.amount;
                                    
                                    if (diffDays < 1) {
                                      // If started today, show 6-hour intervals leading to now
                                      return [
                                        { date: "Start", value: base },
                                        { date: "6h", value: base + (investment.profit * 0.25) },
                                        { date: "12h", value: base + (investment.profit * 0.5) },
                                        { date: "18h", value: base + (investment.profit * 0.75) },
                                        { date: "Now", value: totalValue },
                                      ];
                                    }
                                    
                                    // If more than a day, show progress points
                                    return [
                                        { date: "Start", value: base },
                                        { date: "Day 1", value: base + (investment.profit * 0.2) },
                                        { date: `Day ${Math.max(2, Math.floor(diffDays / 2))}`, value: base + (investment.profit * 0.5) },
                                        { date: `Day ${Math.max(3, diffDays)}`, value: base + (investment.profit * 0.8) },
                                        { date: "Now", value: totalValue },
                                    ];
                                })()}
                                height={180}
                             />
                             
                             <div className="relative z-10 w-full flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2 px-2">
                                <span>Initial Investment</span>
                                <span>Real-time Performance</span>
                                <span>Current Balance</span>
                             </div>
                        </div>
                    </div>
                </Card>

                {/* Details & Withdrawal */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-500" /> Investment Period
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Start Date</span>
                                <span className="font-bold">{new Date(investment.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Unlock Date</span>
                                <span className="font-bold">{investment.endDate ? new Date(investment.endDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="pt-4 border-t border-border/50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-muted-foreground">Lock Status</span>
                                    {isLocked ? (
                                        <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                                            <Lock className="h-3 w-3" /> Locked
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">Unlocked</span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground text-right font-mono">{timeLeft}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4">Withdrawal</h3>
                        {isLocked ? (
                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mb-4">
                                <div className="flex gap-3">
                                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium leading-relaxed">
                                        Principal amount is locked until the mining period ends. You cannot withdraw solely from this plan yet.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground mb-4">
                                Your investment period has ended. You can now release your principal and profits to your wallet.
                            </p>
                        )}
                        
                        <Button 
                            className="w-full font-bold h-12" 
                            disabled={isLocked}
                            variant={isLocked ? "secondary" : "primary"}
                        >
                            {isLocked ? "Withdrawal Locked" : "Release Funds"}
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

"use client";

import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { useState, useTransition } from "react";
import { runDailyDistribution } from "@/app/actions/portfolio";
import toast from "react-hot-toast";
import { Zap, Play, Users, TrendingUp, History } from "lucide-react";

export function PortfolioSnapshotManager() {
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<{ 
    success: boolean; 
    count?: number; 
    updatedCount?: number; 
    affectedUsersCount?: number;
    totalProfitDistributed?: number;
    message?: string; 
    error?: string;
  } | null>(null);

  const handleRunDistribution = () => {
    startTransition(async () => {
      const result = await runDailyDistribution();
      setLastResult(result);
      
      if (result.success) {
        toast.success("Daily distribution complete!");
      } else {
        toast.error(result.error || "Distribution failed");
      }
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
          <Zap className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Daily Distribution Manager</h2>
          <p className="text-sm text-muted-foreground">Snapshot history & update investment profits</p>
        </div>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg mb-4">
        <h3 className="text-sm font-bold mb-2">Process Sequence:</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li><strong>1. Snapshot Today:</strong> Saves current values to history for accurate graphs.</li>
          <li><strong>2. Distribute Profits:</strong> Calculates & adds daily ROI to all active investments.</li>
          <li>• Starter: 0.5% | Growth: 1.2% | Wealth: 2.5%</li>
          <li>• This should be run ONCE every 24 hours.</li>
        </ul>
      </div>

      <Button 
        onClick={handleRunDistribution}
        disabled={isPending}
        className="w-full font-bold shadow-lg shadow-amber-500/10"
        size="lg"
      >
        {isPending ? (
          <>Running Distribution...</>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Run Daily Distribution
          </>
        )}
      </Button>

      {lastResult && (
        <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-500">
          {lastResult.success ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-500/5 border border-green-500/20 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-green-500 mb-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Paid</span>
                    </div>
                    <p className="text-xl font-black text-foreground">
                        ${lastResult.totalProfitDistributed?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-500 mb-1">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Users Paid</span>
                    </div>
                    <p className="text-xl font-black text-foreground">
                        {lastResult.affectedUsersCount}
                    </p>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <History className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Process Log</span>
                  </div>
                  <div className="space-y-2 text-xs font-medium">
                      <div className="flex justify-between items-center text-foreground/80">
                          <span>Portfolio Snapshots:</span>
                          <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">{lastResult.count} Created</span>
                      </div>
                      <div className="flex justify-between items-center text-foreground/80">
                          <span>Updated Investments:</span>
                          <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">{lastResult.updatedCount} Updated</span>
                      </div>
                  </div>
              </div>
            </>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm text-red-500 font-medium">
                ✗ {lastResult.error}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">
          Automation Tip
        </p>
        <p className="text-[11px] text-muted-foreground mt-2">
          In production, use a CRON job to trigger this action automatically every 24 hours.
        </p>
      </div>
    </Card>
  );
}

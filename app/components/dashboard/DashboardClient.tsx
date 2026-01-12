"use client";

import { Card } from "../../components/ui/Card";
import {
  TrendingUp,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ExternalLink,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../../components/ui/Button";
import { PerformanceChart } from "../../components/dashboard/PerformanceChart";
import { useUserData, UserData } from "../../hooks/use-user-data";

interface DashboardClientProps {
  initialData: UserData;
  userName: string;
  greeting: { text: string; emoji: string };
}

export function DashboardClient({
  initialData,
  userName,
  greeting,
}: DashboardClientProps) {
  const { data } = useUserData(initialData);

  if (!data) return null;

  const { balance, transactions, investments } = data;

  // Calculate stats
  const totalInvested = investments
    .filter((inv) => inv.status === "ACTIVE")
    .reduce((acc, inv) => acc + inv.amount, 0);

  const totalProfit = investments
    .filter((inv) => inv.status === "ACTIVE")
    .reduce((acc, inv) => acc + inv.profit, 0);

  const pendingWithdrawals = transactions
    .filter((tx) => tx.type === "WITHDRAWAL" && tx.status === "PENDING")
    .reduce((acc, tx) => acc + tx.amount, 0);

  // Recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">
          {greeting.text}, {userName}! {greeting.emoji}
        </h1>
        <p className="text-[13px] font-medium text-muted-foreground">
          Overview of your cloud mining operations and hardware efficiency.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">
            Total Asset Value
          </p>
          <h2 className="text-3xl font-black text-foreground">
            ${balance.toLocaleString()}
          </h2>
        </Card>

        <Card className="p-6 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">
            Mining Capacity
          </p>
          <h2 className="text-3xl font-black text-foreground">
            ${totalInvested.toLocaleString()}
          </h2>
        </Card>

        <Card className="p-6 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <ArrowUpRight className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">
            Mined Rewards
          </p>
          <h2 className="text-3xl font-black text-green-500">
            +${totalProfit.toLocaleString()}
          </h2>
        </Card>

        <Card className="p-6 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">
            Pending Payouts
          </p>
          <h2 className="text-3xl font-black text-foreground">
            ${pendingWithdrawals.toLocaleString()}
          </h2>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart + Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black mb-1">
                  Mining Reward Progress
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Projection based on current mining output
                </p>
              </div>
            </div>
            {(() => {
              // Calculate graph data (Projection Mode)
              const activeInvestments = investments.filter(i => i.status === "ACTIVE");
              const totalActiveInvested = activeInvestments.reduce((sum, i) => sum + i.amount, 0);
              const currentProfit = activeInvestments.reduce((sum, i) => sum + i.profit, 0);
              const startValue = totalActiveInvested + currentProfit;
              
              // Estimate daily ROI (approx 1% if active, else 0.5% baseline)
              const avgDailyROI = activeInvestments.length > 0 ? 0.01 : 0.005;
              
              const graphData = Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                // Compound growth projection
                const projectedValue = startValue * Math.pow(1 + avgDailyROI, day);
                return {
                  date: `Day ${day}`,
                  value: projectedValue
                };
              });

              // Add "Today" as start point
              const finalGraphData = [
                { date: "Today", value: startValue },
                ...graphData
              ];

              return <PerformanceChart data={finalGraphData} />;
            })()}
          </Card>

          {/* Recent Transactions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">Recent Activity</h2>
              <Link href="/dashboard/transactions">
                <Button variant="ghost" className="h-9 text-xs font-bold">
                  View All
                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent transactions
                </p>
              ) : (
                recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          tx.type === "DEPOSIT"
                            ? "bg-green-500/10"
                            : "bg-red-500/10"
                        }`}
                      >
                        {tx.type === "DEPOSIT" ? (
                          <ArrowDownLeft
                            className={`h-4 w-4 ${
                              tx.type === "DEPOSIT"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          />
                        ) : (
                          <ArrowUpRight
                            className={`h-4 w-4 ${
                              tx.type === "DEPOSIT"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">
                          {tx.type === "DEPOSIT" ? "Deposit" : "Withdrawal"}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-black text-sm ${
                          tx.type === "DEPOSIT"
                            ? "text-green-500"
                            : "text-foreground"
                        }`}
                      >
                        {tx.type === "DEPOSIT" ? "+" : "-"}$
                        {tx.amount.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs font-bold ${
                          tx.status === "COMPLETED"
                            ? "text-green-500"
                            : tx.status === "PENDING"
                            ? "text-amber-500"
                            : "text-red-500"
                        }`}
                      >
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Active Rigs */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black">Active Mining Rigs</h2>
              </div>
            </div>

            {investments.filter((inv) => inv.status === "ACTIVE").length ===
            0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                  <Cpu className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground mb-1">
                    0 Rigs
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Start leasing hashrate to begin mining
                  </p>
                </div>
                <Link href="/dashboard/invest">
                  <Button className="w-full h-11 font-black">
                    Lease Hashrate
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {investments
                    .filter((inv) => inv.status === "ACTIVE")
                    .slice(0, 3)
                    .map((inv) => {
                      const currentValue = inv.amount + inv.profit;
                      const realProfit = inv.profit;
                      const startTime = new Date(inv.startDate).getTime();
                      const endTime = inv.endDate ? new Date(inv.endDate).getTime() : new Date().getTime(); // Safe fallback
                      const now = new Date().getTime();
                      const totalDuration = Math.max(1, endTime - startTime); // Prevent division by zero
                      const elapsed = now - startTime;
                      const progress = Math.min(
                        100,
                        Math.max(0, (elapsed / totalDuration) * 100)
                      );

                      return (
                        <div
                          key={inv.id}
                          className="bg-background/60 backdrop-blur-sm p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-0.5">
                                {inv.planId === "starter"
                                  ? "Standard"
                                  : inv.planId === "growth"
                                  ? "Professional"
                                  : "Institutional"}{" "}
                                Rig
                              </p>
                              <h3 className="text-xl font-bold text-foreground">
                                ${currentValue.toLocaleString()}
                              </h3>
                            </div>
                            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                              +$
                              {realProfit.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>

                          <Link
                            href={`/dashboard/invest/${inv.id}`}
                            className="block mb-2 text-xs text-[#333] dark:text-primary font-bold hover:underline"
                          >
                            View Rig Performance
                          </Link>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground font-medium">
                                Hashrate Maturity
                              </span>
                              <span className="font-bold text-foreground">
                                {progress.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <Link href="/dashboard/invest?tab=my_investments">
                  <Button
                    variant="outline"
                    className="w-full h-11 font-black hover:bg-muted/50"
                  >
                    View All Rigs
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </Card>

          <Link href="/dashboard/invest">
            <Button className="w-full h-12 font-black text-base shadow-xl shadow-primary/20">
              Lease Hashrate
              <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

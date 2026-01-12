import prisma from "@/lib/prisma";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { TrendingUp, Clock, AlertCircle } from "lucide-react";
import { PortfolioSnapshotManager } from "@/app/components/admin/PortfolioSnapshotManager";

export const dynamic = "force-dynamic";

export default async function AdminInvestmentsPage() {
  const investments = await prisma.investment.findMany({
    where: { status: "ACTIVE" },
    include: { user: true },
    orderBy: { startDate: "desc" },
  });

  const totalActiveCapital = investments.reduce((acc, inv) => acc + Number(inv.amount), 0);
  const totalAccruedProfit = investments.reduce((acc, inv) => acc + Number(inv.profit), 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-900 text-white border-none shadow-xl">
          <div className="flex items-center gap-3 mb-4 text-slate-400">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Active Capital</span>
          </div>
          <p className="text-3xl font-black">${totalActiveCapital.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Principal amount currently locked</p>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-400">
            <Clock className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Accrued Profit</span>
          </div>
          <p className="text-3xl font-black text-slate-900">${totalAccruedProfit.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Interest pending for withdrawal</p>
        </Card>

        <PortfolioSnapshotManager />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            Active Investment Registry
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-bold">{investments.length} Records</span>
        </h2>
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium tracking-wide uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-4">Investor</th>
                  <th className="px-6 py-4">Plan Type</th>
                  <th className="px-6 py-4">Principal</th>
                  <th className="px-6 py-4">Accrued Profit</th>
                  <th className="px-6 py-4">Daily ROI</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors text-slate-700 font-medium">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{inv.user?.name || "Unnamed"}</span>
                        <span className="text-xs text-slate-400">{inv.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest border border-slate-200/50">
                            {inv.planId}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      ${Number(inv.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-black">
                      +${Number(inv.profit).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-500">
                      {(Number(inv.dailyROI) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 font-bold text-xs">
                            Manage
                        </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

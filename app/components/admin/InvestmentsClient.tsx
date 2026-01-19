"use client";

import { useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";
import { TrendingUp, Clock, Trash2, AlertTriangle } from "lucide-react";
import { PortfolioSnapshotManager } from "@/app/components/admin/PortfolioSnapshotManager";
import { deleteInvestment } from "@/app/actions/admin";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Investment {
  id: string;
  userId: string;
  planId: string;
  amount: any;
  status: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  profit: any;
  dailyROI: any;
  user?: {
    name: string | null;
    email: string;
  } | null;
}

interface InvestmentsClientProps {
  investments: Investment[];
}

export function InvestmentsClient({ investments }: InvestmentsClientProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalActiveCapital = investments.reduce((acc, inv) => acc + Number(inv.amount), 0);
  const totalAccruedProfit = investments.reduce((acc, inv) => acc + Number(inv.profit), 0);

  const handleDeleteInvestment = async () => {
    if (!selectedInvestment) return;
    setIsProcessing(true);
    
    const res = await deleteInvestment(selectedInvestment.id);
    setIsProcessing(false);
    
    if (res.success) {
      toast.success("Investment deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedInvestment(null);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete investment");
    }
  };

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
                  <th className="px-6 py-4 text-right">Actions</th>
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0! border-border text-foreground hover:text-red-600 hover:border-red-600 hover:bg-red-50"
                        onClick={() => {
                          setSelectedInvestment(inv);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Investment Deletion">
        <div className="p-6 space-y-4">
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Permanent Action</p>
              <p className="text-xs">
                Are you sure you want to delete this investment for <b>{selectedInvestment?.user?.email}</b>?
              </p>
              <p className="text-xs mt-2">
                <b>Principal:</b> ${Number(selectedInvestment?.amount || 0).toLocaleString()} | 
                <b className="ml-2">Profit:</b> ${Number(selectedInvestment?.profit || 0).toLocaleString()}
              </p>
              <p className="text-xs mt-2 font-semibold">This action cannot be undone and will not affect the user&apos;s wallet balance.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteInvestment} isLoading={isProcessing}>Delete Permanently</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

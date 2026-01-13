"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Modal } from "@/app/components/ui/Modal";
import { 
  Check, Clock, Search, Ban, Trash2, ExternalLink, 
  ArrowUpRight, ArrowDownLeft, Wallet, Copy, RefreshCcw, Loader2
} from "lucide-react";
import { 
  approveTransaction, 
  rejectTransaction, 
  deleteTransaction,
  getTransactions
} from "@/app/actions/admin";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  balance: number;
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  status: string;
  currency: string | null;
  network: string | null;
  address: string | null;
  txHash: string | null;
  source: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

type TransactionWithUser = Transaction & { user: User | null };

interface TransactionsManagerProps {
  transactions: TransactionWithUser[];
}

export function TransactionsManager({ transactions: initialData }: TransactionsManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "ALL");

  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  
  // Loading State
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Hybrid Fetching: Fetch ALL data, then filter client-side
  // This prevents 'initialData' (full list) from blocking filtered queries
  const { data: allTransactions, isFetching, refetch } = useQuery({
    queryKey: ['transactions'], // Single key for all data
    queryFn: () => getTransactions({}), // Fetch all
    initialData: initialData,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
  });

  // Client-Side Filtering
  const filteredTransactions = useMemo(() => {
    if (!allTransactions) return [];
    
    return allTransactions.filter((tx: TransactionWithUser) => {
      // Status Filter
      if (statusFilter !== "ALL" && tx.status !== statusFilter) return false;
      
      // Type Filter
      if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;
      
      // Search Filter
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        const hashMatch = tx.txHash?.toLowerCase().includes(lowerTerm);
        const idMatch = tx.id.toLowerCase().includes(lowerTerm);
        const emailMatch = tx.user?.email?.toLowerCase().includes(lowerTerm);
        const nameMatch = tx.user?.name?.toLowerCase().includes(lowerTerm);
        
        if (!hashMatch && !idMatch && !emailMatch && !nameMatch) return false;
      }
      
      return true;
    });
  }, [allTransactions, statusFilter, typeFilter, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    updateFilters(term, statusFilter, typeFilter);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    updateFilters(searchTerm, status, typeFilter);
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    updateFilters(searchTerm, statusFilter, type);
  };

  const updateFilters = (q: string, status: string, type: string) => {
    const params = new URLSearchParams(searchParams);
    if (q) params.set("q", q); else params.delete("q");
    if (status && status !== "ALL") params.set("status", status); else params.delete("status");
    if (type && type !== "ALL") params.set("type", type); else params.delete("type");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied");
  };

  // --- Actions ---

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await approveTransaction(id);
      if (res.success) {
        toast.success("Transaction approved");
        refetch();
      }
      else toast.error(res.error || "Failed to approve");
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await rejectTransaction(id);
      if (res.success) {
         toast.success("Transaction rejected");
         refetch();
      }
      else toast.error(res.error || "Failed to reject");
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteRequest = (id: string) => {
    setTxToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!txToDelete) return;
    try {
      const res = await deleteTransaction(txToDelete);
      if (res.success) {
        toast.success("Transaction deleted");
        refetch();
      }
      else toast.error(res.error || "Failed to delete");
      setIsDeleteModalOpen(false);
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
       {/* Header & Stats */}
       <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Transaction Requests</h2>
            <p className="text-slate-500">Manage deposits, withdrawals, and platform history.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
           </Button>
        </div>
      </div>

       {/* Filters Bar */}
       <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    className="pl-9 bg-slate-50 border-slate-200"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
              </div>
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <select 
                    className="h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    value={typeFilter}
                    onChange={(e) => handleTypeChange(e.target.value)}
                  >
                      <option value="ALL">All Types</option>
                      <option value="DEPOSIT">Deposits</option>
                      <option value="WITHDRAWAL">Withdrawals</option>
                      <option value="INVESTMENT">Investments</option>
                  </select>
                  <select 
                    className="h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    value={statusFilter}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="FAILED">Failed</option>
                  </select>
              </div>
          </div>
       </Card>

       {/* Table */}
       <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left relative">
            {isFetching && (
                <div className="absolute inset-x-0 top-0 h-1 bg-blue-500/20 overflow-hidden z-10">
                    <div className="h-full bg-blue-500 animate-progress origin-left w-full"></div>
                </div>
            )}
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Network & Address</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {!filteredTransactions || filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                      <Search className="h-8 w-8 text-slate-300 mb-2" />
                      <p>No transactions found matching your filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx: TransactionWithUser) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors text-slate-700 group">
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <span className="font-medium text-slate-900">{tx.user?.name || "Unknown"}</span>
                             <span className="text-xs text-slate-400">{tx.user?.email}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                {tx.type === 'DEPOSIT' && <ArrowDownLeft className="h-4 w-4 text-green-500" />}
                                {tx.type === 'WITHDRAWAL' && <ArrowUpRight className="h-4 w-4 text-amber-500" />}
                                <span className="font-medium">{tx.type}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-slate-800">
                            ${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            {tx.currency && tx.currency !== 'USD' && (
                                <span className="text-slate-400 text-xs ml-1 font-normal">({tx.currency})</span>
                            )}
                        </td>
                         <td className="px-6 py-4 text-slate-500">
                             <div className="flex flex-col gap-1 max-w-[220px]">
                                 {/* Network & Currency */}
                                 {(tx.network || tx.currency) && (
                                     <div className="flex items-center gap-2">
                                         <span className="font-bold text-xs text-slate-700">{tx.network}</span>
                                         <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-500">{tx.currency}</span>
                                     </div>
                                 )}

                                 {/* Address */}
                                 {tx.address ? (
                                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 group/addr relative" title={tx.address}>
                                        <Wallet className="h-3 w-3 text-slate-400 shrink-0" />
                                        <span className="text-[10px] font-mono truncate text-slate-600 select-all">
                                            {tx.address}
                                        </span>
                                        <button 
                                            onClick={() => copyToClipboard(tx.address!)} 
                                            className="opacity-0 group-hover/addr:opacity-100 absolute right-1 bg-white p-0.5 rounded shadow-sm hover:scale-110 transition-all"
                                        >
                                            <Copy className="h-3 w-3 text-slate-500" />
                                        </button>
                                    </div>
                                 ) : (
                                    (tx.type === 'DEPOSIT' || tx.type === 'WITHDRAWAL') && (
                                        <span className="text-[10px] text-slate-400 italic">No address provided</span>
                                    )
                                 )}
                                 
                                 {/* TX Hash */}
                                 {tx.txHash && (
                                    <div className="text-[10px] flex items-center gap-1 text-blue-500 font-mono mt-0.5 hover:underline decoration-blue-300">
                                        <ExternalLink className="h-3 w-3" />
                                        <span className="truncate max-w-[120px]" title={tx.txHash}>{tx.txHash}</span>
                                    </div>
                                 )}
                             </div>
                         </td>
                        <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                {tx.status === 'PENDING' && <Clock className="h-3 w-3 text-orange-500" />}
                                {tx.status === 'COMPLETED' && <Check className="h-3 w-3 text-green-500" />}
                                {tx.status === 'FAILED' && <Ban className="h-3 w-3 text-red-500" />}
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    tx.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                    tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {tx.status}
                                </span>
                             </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {new Date(tx.createdAt).toLocaleDateString()} <br/>
                          {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="px-6 py-4 text-right">
                           {/* Actions */}
                           <div className="flex items-center justify-end gap-1">
                              {tx.status === 'PENDING' && (
                                  <>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-green-600 hover:bg-green-50" 
                                      title="Approve" 
                                      onClick={() => handleApprove(tx.id)}
                                      disabled={processingId === tx.id}
                                    >
                                        {processingId === tx.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-slate-600 hover:bg-slate-100" 
                                      title="Reject" 
                                      onClick={() => handleReject(tx.id)}
                                      disabled={processingId === tx.id}
                                    >
                                        {processingId === tx.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                                    </Button>
                                  </>
                              )}
                              
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" 
                                title="Delete" 
                                onClick={() => handleDeleteRequest(tx.id)}
                                disabled={processingId === tx.id}
                              >
                                  {processingId === tx.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                           </div>
                        </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
         <div className="p-6">
             <div className="flex flex-col items-center text-center gap-4 mb-6">
                 <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                     <Trash2 className="h-6 w-6" />
                 </div>
                 <p className="text-slate-600">Are you sure you want to permanently delete this transaction record? This cannot be undone.</p>
             </div>
             <div className="flex justify-center gap-3">
                 <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                 <Button variant="destructive" onClick={confirmDelete}>Delete Transaction</Button>
             </div>
         </div>
      </Modal>

    </div>
  );
}

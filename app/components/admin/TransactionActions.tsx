"use client";

import { useTransition } from "react";
import { 
  approveTransaction, 
  rejectTransaction, 
  deleteTransaction 
} from "@/app/actions/admin";

interface TransactionActionsProps {
  transactionId: string;
}

export function TransactionActions({ transactionId }: TransactionActionsProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(async () => { await approveTransaction(transactionId); })}
        className="h-8 w-8 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
        title="Approve"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(async () => { await rejectTransaction(transactionId); })}
        className="h-8 w-8 flex items-center justify-center bg-slate-900 hover:bg-black text-white rounded-md transition-colors disabled:opacity-50"
        title="Reject"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(async () => { await deleteTransaction(transactionId); })}
        className="h-8 w-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
        title="Delete"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </button>
    </div>
  );
}

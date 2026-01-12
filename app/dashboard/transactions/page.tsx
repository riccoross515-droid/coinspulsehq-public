import { getCurrentUser } from "@/lib/session";
import { TransactionsClient } from "../../components/dashboard/TransactionsClient";

export default async function TransactionsPage() {
  const user = await getCurrentUser();

  if (!user) return null;

  // Prepare initial data for React Query (Hybrid Pattern)
  // Note: We use the same detailed UserData structure expected by useUserData hook
  const initialData = {
    balance: Number(user.balance),
    transactions: user.transactions.map(tx => ({
      ...tx,
      amount: Number(tx.amount)
    })),
    investments: user.investments.map(inv => ({
      ...inv,
      amount: Number(inv.amount),
      profit: Number(inv.profit),
      dailyROI: Number(inv.dailyROI)
    }))
  };

  return <TransactionsClient initialData={initialData} />;
}

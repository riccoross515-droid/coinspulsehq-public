import { getCurrentUser } from "@/lib/session";
import { InvestClientWrapper } from "../../components/dashboard/InvestClientWrapper";

// Removed force-dynamic - React Query handles freshness
// export const dynamic = "force-dynamic";

export default async function InvestPage() {
  const user = await getCurrentUser();

  if (!user) return null;

  // Prepare initial data for React Query
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

  return <InvestClientWrapper initialData={initialData} />;
}

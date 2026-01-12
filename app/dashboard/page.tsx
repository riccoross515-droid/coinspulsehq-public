import { getCurrentUser } from "@/lib/session";
import { DashboardClient } from "../components/dashboard/DashboardClient";

// Remove force-dynamic - let React Query handle client-side freshness
// export const dynamic = "force-dynamic";

function getGreeting() {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { text: "Good morning", emoji: "☀️" };
  } else if (hour >= 12 && hour < 17) {
    return { text: "Good afternoon", emoji: "🌤️" };
  } else {
    return { text: "Good evening", emoji: "🌙" };
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) return null;
  
  const greeting = getGreeting();

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

  return (
    <DashboardClient
      initialData={initialData}
      userName={user.name || "User"}
      greeting={greeting}
    />
  );
}

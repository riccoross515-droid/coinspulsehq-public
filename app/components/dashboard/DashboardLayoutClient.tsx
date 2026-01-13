"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./Header";
import { useUserData } from "@/app/hooks/use-user-data";
import { FullPageLoader } from "@/app/components/ui/FullPageLoader";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: {
    name: string | null;
    image: string | null;
    balance: number;
    role?: string;
  } | null;
}

export function DashboardLayoutClient({ children, user: initialUser }: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Fetch live user data (using React Query)
  const { data: userData, isLoading } = useUserData(initialUser ? {
    ...initialUser,
    email: "", // Placeholder for initialData typing
    role: "USER",
    assets: [],
    transactions: [],
    investments: []
  } as any : undefined);

  // Calculate Total Portfolio Value in real-time
  const totalPortfolioValue = useMemo(() => {
    if (!userData) return initialUser?.balance ?? 0;
    
    const walletBalance = userData.balance;
    const activeInvestments = userData.investments.filter(inv => inv.status === "ACTIVE");
    const totalInvested = activeInvestments.reduce((acc, inv) => acc + inv.amount, 0);
    const totalProfit = activeInvestments.reduce((acc, inv) => acc + inv.profit, 0);
    
    return walletBalance + totalInvested + totalProfit;
  }, [userData, initialUser]);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          balance={totalPortfolioValue}
      />
      
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <DashboardHeader 
          onMenuClick={() => setIsSidebarOpen(true)} 
          userName={initialUser?.name ?? "User"}
          userImage={initialUser?.image}
          userRole={initialUser?.role}
        />
        <main className="flex-1 p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./Header";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: {
    name: string | null;
    image: string | null;
    balance: number;
  } | null;
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          balance={user?.balance ?? 0}
      />
      
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <DashboardHeader 
          onMenuClick={() => setIsSidebarOpen(true)} 
          userName={user?.name ?? "User"}
          userImage={user?.image}
        />
        <main className="flex-1 p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { AdminSidebar } from "./AdminSidebar";
import { Menu } from "lucide-react";
import { Button } from "../ui/Button";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Strictly Force Light Mode on Admin Dashboard to prevent UI conflicts
  useEffect(() => {
    // Only set if not already light (prevents loops, though setTheme is stable)
    // Actually, force it always to ensure we don't drift back if user toggles manually elsewhere somehow
    setTheme("light");
    
    // Optional: cleanup to restore? User might want to go back to previous.
    // However, user requirement is strict: "switch automatically to light mode when we are in the admin dashboard"
    // So we don't worry about restoring preference on exit, as 'Exit Admin' goes to Home/Dashboard which might have their own controls.
  }, [setTheme]);

  return (
    <div className="min-h-screen bg-slate-50">
       <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
       />

       <div className="md:pl-64 flex flex-col min-h-screen transition-all duration-300">
         {/* Top Header - Adjusted for Mobile */}
         <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
            {/* Mobile Sidebar Toggle */}
             <div className="flex items-center gap-4">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="md:hidden text-slate-500 hover:text-slate-800"
                   onClick={() => setIsSidebarOpen(true)}
                 >
                     <Menu className="h-6 w-6" />
                 </Button>
                 <h1 className="font-bold text-slate-800 text-lg md:text-xl hidden md:block">Administrator Control Panel</h1>
                 <h1 className="font-bold text-slate-800 text-lg md:hidden">Admin</h1>
             </div>
             
             <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-xs font-medium text-slate-500 hidden md:inline">System Online</span>
             </div>
         </header>

         <main className="flex-1 p-4 md:p-8 overflow-auto">
           {children}
         </main>
       </div>
    </div>
  );
}

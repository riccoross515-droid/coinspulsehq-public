"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  ArrowUpDown,
  Settings, 
  LogOut,
  Coins,
  X
} from "lucide-react";
import { Button } from "../ui/Button";
import { logout } from "@/app/actions/auth";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Invest", href: "/dashboard/invest", icon: TrendingUp },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { name: "Transactions", href: "/dashboard/transactions", icon: ArrowUpDown },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  balance?: number;
}

export function Sidebar({ isOpen, onClose, balance }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed flex left-0 top-0 z-50 h-screen w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl 
        transition-transform duration-300 ease-in-out md:translate-x-0 md:flex
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Coins className="h-8 w-8 text-[#333] dark:text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              CryptoPulse
            </span>
          </Link>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground">
             <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col px-4 py-4 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <div key={link.href}>   
              <Link key={link.href} href={link.href} onClick={onClose}>
                <Button
                  variant={isActive ? "primary" : "ghost"}
                  className={`w-full justify-start gap-3 mb-1 font-medium ${
                    isActive 
                      ? "bg-primary text-[#333] shadow-sm " 
                      : "text-muted-foreground  hover:text-foreground"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Button>
              </Link>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border mt-auto">
           <div className="p-4 rounded-xl bg-secondary/30 mb-4">
              <p className="text-xs text-muted-foreground mb-1 font-bold uppercase tracking-widest">Total Portfolio</p>
              <p className="text-xl font-black text-foreground">${(balance ?? 0).toLocaleString()}</p>
           </div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/10"
              onClick={() => logout()}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
        </div>
      </div>
    </>
  );
}

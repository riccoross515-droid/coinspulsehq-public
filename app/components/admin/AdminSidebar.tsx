"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  LogOut,
  LayoutDashboard,
  Coins,
  Globe
} from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { adminLogout } from "@/app/actions/admin";

const adminLinks = [
  { name: "Transactions", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Investments", href: "/admin/investments", icon: Activity },
  { name: "Crypto Assets", href: "/admin/assets", icon: Coins },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 z-50 h-screen w-64 flex-col border-r border-border bg-slate-950 text-white transition-transform duration-300 md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <ShieldCheck className="h-8 w-8 text-red-500" />
             <span className="text-xl font-bold tracking-tight">Admin</span>
           </div>
           {/* Close button for mobile */}
           {onClose && (
             <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
               <LogOut className="h-5 w-5 rotate-180" /> 
             </button>
           )}
        </div>

        <div className="flex-1 px-4 py-4 space-y-2">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} onClick={onClose}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 mb-1 font-medium ${
                    isActive 
                      ? "bg-red-500/20 text-red-500" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/5"
            onClick={async () => {
              await adminLogout();
            }}
          >
            <LogOut className="h-5 w-5" />
            Exit Admin
          </Button>
        </div>
      </div>
    </>
  );
}

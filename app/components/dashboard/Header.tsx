"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, User, Shield } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { Modal } from "@/app/components/ui/Modal";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  userName?: string | null;
  userImage?: string | null;
  userRole?: string;
}

export function DashboardHeader({ onMenuClick, userName, userImage, userRole }: DashboardHeaderProps) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-background/50 px-6 backdrop-blur-xl transition-all">
      <div className="flex items-center gap-2 md:hidden">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="-ml-3">
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex flex-1 md:justify-end justify-end items-center gap-4">
         {/* Admin Switch Link */}
         {userRole === "ADMIN" && (
           <Link href="/admin">
             <Button 
               variant="outline" 
               size="sm" 
               className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-semibold"
             >
               <Shield className="h-4 w-4" />
               <span className="hidden md:inline">Admin Panel</span>
             </Button>
           </Link>
         )}
         {/* Right Side Icons */}
        <ThemeToggle />
        
        <div className="flex items-center gap-1 pl-4 border-l border-border/50">
            {/* Avatar First, then Name */}
            <button 
                className="relative h-10 w-10 rounded-full bg-primary/10 border border-primary/20 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all outline-none"
                onClick={() => setIsAvatarModalOpen(true)}
            >
                {userImage ? (
                    <Image 
                        src={userImage} 
                        alt="Profile" 
                        fill 
                        className="object-cover"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-primary">
                        <User className="h-5 w-5" />
                    </div>
                )}
            </button>

            <div className="hidden md:flex flex-col items-start ml-1">
                <span className="text-sm font-medium leading-none text-foreground/90">{userName || "User"}</span>
            </div>
        </div>
      </div>

      {/* Avatar View Modal - Refined Template Design */}
      <Modal 
        isOpen={isAvatarModalOpen} 
        onClose={() => setIsAvatarModalOpen(false)}
        showHeader={false}
        className="bg-transparent border-none shadow-none max-w-none w-auto overflow-visible" // Added overflow-visible for floating X
      >
           <div 
             className="flex items-center justify-center p-0 scale-in-center cursor-pointer"
             onClick={() => setIsAvatarModalOpen(false)}
           >
                {userImage ? (
                    <div className="relative h-[300px] w-[300px] md:h-[450px] md:w-[450px] rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                         <Image 
                            src={userImage} 
                            alt="Profile Large" 
                            fill 
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div className="h-64 w-64 flex flex-col items-center justify-center text-muted-foreground bg-background rounded-full border border-border">
                        <User className="h-24 w-24 mb-4 opacity-20" />
                        <p className="text-sm font-medium">No profile image</p>
                    </div>
                )}
           </div>
      </Modal>
    </header>
  );
}

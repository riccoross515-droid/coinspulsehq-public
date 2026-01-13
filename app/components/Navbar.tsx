"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { 
  Coins, Menu, X, 
  Home, Compass, Headphones,
  LayoutGrid
} from "lucide-react";
import { Button } from "./ui/Button";
import { useOutsideClick } from "../hooks/use-outside-click";
import { ThemeToggle } from "./ThemeToggle";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  useOutsideClick(navRef, () => {
    if (isOpen) setIsOpen(false);
  });

  // Lock scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Plans", href: "/plans", icon: Compass },
    { name: "Contact", href: "/contact", icon: Headphones },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Coins className="h-8 w-8 text-[#333] dark:text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              Coinspulse
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-bold transition-colors hover:text-[#c99400] ${
                  pathname === link.href ? "text-[#c99400]" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth?mode=login">
              <Button variant="ghost" className="text-foreground hover:text-[#c99400] font-bold">
                Log In
              </Button>
            </Link>
            <Link href="/auth?mode=signup">
              <Button className="font-bold shadow-lg shadow-primary/20 hover:bg-[#c99400] transition-colors">Sign Up</Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-2 md:hidden">
             <ThemeToggle />
             <button
               className="text-foreground p-2"
               onClick={() => setIsOpen(true)}
             >
               <Menu className="h-7 w-7" />
             </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Portal-like Overlay (Sibling to Nav) */}
      <div
        className={`fixed inset-0 z-100 bg-background transition-transform duration-300 transform md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div 
          ref={navRef}
          className="w-full h-full flex flex-col p-6 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
          </div>

          {/* Top Auth Buttons */}
          <div className="flex gap-3 mb-10">
            <Link href="/auth?mode=login" onClick={() => setIsOpen(false)} className="flex-1">
              <Button variant="outline" className="w-full bg-secondary/50 border-none hover:bg-secondary text-foreground font-bold h-12 rounded-xl text-base">
                Log In
              </Button>
            </Link>
            <Link href="/auth?mode=signup" onClick={() => setIsOpen(false)} className="flex-1">
              <Button className="w-full bg-primary hover:bg-[#c99400] text-primary-foreground font-bold h-12 rounded-xl text-base shadow-lg shadow-primary/20">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 space-y-1">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 py-2 group"
              >
                <div className="p-2.5 bg-secondary/50 rounded-xl group-hover:bg-primary/10 transition-colors">
                  <link.icon className={`h-5 w-5 ${pathname === link.href ? "text-[#333] dark:text-primary" : "text-muted-foreground"}`} />
                </div>
                <span className={`text-base font-semibold tracking-tight ${pathname === link.href ? "text-[#333] dark:text-primary" : "text-foreground"}`}>
                  {link.name}
                </span>
              </Link>
            ))}
          </div>
          
          {/* Bottom Appearance Box */}
          <div className="mt-8 pt-8 border-t border-border">
             <div className="bg-secondary/40 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-2.5 bg-background rounded-xl shadow-sm border border-border/50">
                      <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                   </div>
                   <div>
                      <p className="text-base font-bold text-foreground">Appearance</p>
                      <p className="text-sm text-muted-foreground">Dark mode & settings</p>
                   </div>
                </div>
                <div className="scale-110">
                   <ThemeToggle />
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

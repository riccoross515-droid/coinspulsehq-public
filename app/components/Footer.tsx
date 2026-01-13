import { Coins, Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/Button";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Coins className="h-8 w-8 text-[#333] dark:text-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Coinspulse
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The world&apos;s most advanced cloud mining infrastructure. 
              Secure, high-performance hashing power and transparent rewards for everyone.
            </p>
            <div className="flex gap-4">
              <a href="/#" className="text-muted-foreground hover:text-[#333] dark:hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="/#" className="text-muted-foreground hover:text-[#333] dark:hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="/#" className="text-muted-foreground hover:text-[#333] dark:hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="/#" className="text-muted-foreground hover:text-[#333] dark:hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-[#333] dark:hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/plans" className="hover:text-[#333] dark:hover:text-primary transition-colors">Plans</Link></li>
              <li><Link href="/contact" className="hover:text-[#333] dark:hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/auth?mode=login" className="hover:text-[#333] dark:hover:text-primary transition-colors">Login / Sign Up</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-foreground font-bold mb-6">Legal</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/#" className="hover:text-[#333] dark:hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/#" className="hover:text-[#333] dark:hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/#" className="hover:text-[#333] dark:hover:text-primary transition-colors">AML Policy</Link></li>
              <li><Link href="/#" className="hover:text-[#333] dark:hover:text-primary transition-colors">Risk Warning</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-foreground font-bold mb-6">Stay Updated</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to our newsletter for the latest market updates and platform news.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                className="bg-muted border border-input rounded-lg px-4 py-2 text-sm text-foreground w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <Button size="sm" variant="primary" className="px-3">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Coinspulse Mining Network. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

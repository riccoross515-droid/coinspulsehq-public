"use client";

import { Mail, Rocket, Send, User, MessageCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/3 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Get In <span className="text-[#333] dark:text-primary">Touch</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have questions? We&apos;re here to help you succeed in your crypto investment journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-border rounded-4xl p-8 md:p-12 shadow-xl shadow-primary/5">
              <h2 className="text-2xl font-bold text-foreground mb-8">Send Us a Message</h2>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1">Your Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-[#333] dark:group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Alex Rivera"
                      className="w-full bg-muted border border-input rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                      type="email" 
                      placeholder="alex@example.com"
                      className="w-full bg-muted border border-input rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1">Message</label>
                  <textarea 
                    placeholder="Briefly describe how we can assist you..."
                    rows={6}
                    className="w-full bg-muted border border-input rounded-2xl py-4 px-5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-base resize-none"
                  />
                </div>

                <Button className="w-full h-14 text-base font-bold shadow-lg shadow-primary/20 rounded-2xl" size="lg">
                  Send Message <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column: Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Email Card */}
            <div className="bg-card border border-border rounded-3xl p-8 hover:border-primary/30 transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="flex items-start gap-6 relative z-10">
                <div className="p-4 bg-primary/10 rounded-2xl text-[#333] dark:text-primary">
                  <Mail className="h-7 w-7" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-foreground mb-1">Email Us</h3>
                   <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                     For general inquiries and technical support.
                   </p>
                   <a href="mailto:cryptopulsedigital@outlook.com" className="text-lg font-bold text-[#333] dark:text-primary hover:underline break-all">
                     cryptopulsedigital@outlook.com
                   </a>
                 </div>
              </div>
            </div>

            {/* Live Chat Card */}
            <div className="bg-card border border-border rounded-3xl p-8 hover:border-primary/30 transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors" />
              <div className="flex items-start gap-6 relative z-10">
                <div className="p-4 bg-secondary/10 rounded-2xl text-secondary-foreground">
                  <MessageCircle className="h-7 w-7" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-foreground mb-1">Live Chat</h3>
                   <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                     Available 24/7 for immediate assistance.
                   </p>
                   <Button variant="outline" className="h-11 rounded-xl font-bold border-muted-foreground/20 hover:bg-secondary transition-all">
                     Start Chat
                   </Button>
                 </div>
              </div>
            </div>

            {/* Ready to Start CTA */}
            <div className="bg-primary rounded-4xl p-8 shadow-2xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-all" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Rocket className="h-6 w-6 text-primary-foreground animate-bounce" />
                  <h3 className="text-xl font-black text-primary-foreground tracking-tight">Ready to Start?</h3>
                </div>
                <p className="text-primary-foreground/90 text-sm mb-6 font-medium leading-relaxed">
                  Join thousands of investors already earning daily returns with Cryptopulse Digital.
                </p>
                <Button className="w-full bg-white text-[#333] hover:bg-gray-100 font-black h-12 rounded-xl text-sm shadow-xl shadow-black/20 uppercase tracking-widest border-none">
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

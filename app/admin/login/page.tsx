"use client";

import { useState } from "react";
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { adminLogin } from "@/app/actions/admin";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await adminLogin(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    } catch (error) {
      // In Next.js, redirect() throws an error that is caught here.
      // We only want to show an error toast if it's NOT a redirect error.
      if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
      console.error("Admin login error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
            <ShieldCheck className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Admin Portal</h1>
          <p className="text-slate-400 font-medium">Restricted Access. Authorized Personnel Only.</p>
        </div>

        <Card className="p-8 bg-slate-900/50 border-white/5 backdrop-blur-xl shadow-2xl">
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Admin Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                <Input 
                  name="email"
                  type="email"
                  className="pl-11 bg-slate-950/50 border-white/5 text-white h-12 focus:border-red-500/50 focus:ring-red-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Security Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                <Input 
                  name="password"
                  type="password"
                  className="pl-11 bg-slate-950/50 border-white/5 text-white h-12 focus:border-red-500/50 focus:ring-red-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-red-600 hover:bg-red-500 text-white font-bold text-lg shadow-lg shadow-red-600/20 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                "Verifying..."
              ) : (
                <>
                  Enter Control Panel
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">
          Secured by Cryptopulse Global Infrastructure
        </p>
      </div>
    </div>
  );
}

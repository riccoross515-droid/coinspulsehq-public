"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Coins, Lock, ArrowRight, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { resetPassword } from "@/app/actions/auth";
import toast from "react-hot-toast";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
       <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
          <XCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
          <h3 className="text-lg font-bold text-destructive mb-1">Invalid Link</h3>
          <p className="text-sm text-destructive/80 mb-4">This password reset link is invalid or missing the token.</p>
          <Link href="/auth/forgot-password">
             <Button variant="outline" className="w-full">Request New Link</Button>
          </Link>
       </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(token, formData);

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      toast.success("Password reset successfully!");
      // Optional: Auto redirect
      setTimeout(() => router.push("/auth"), 3000);
    } else {
      toast.error(result.error || "Failed to reset password");
    }
  };

  if (success) {
     return (
        <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
           </div>
           <h2 className="text-2xl font-bold text-foreground mb-2">Password Reset!</h2>
           <p className="text-muted-foreground mb-6">Your password has been successfully updated. You can now log in with your new credentials.</p>
           <Link href="/auth">
             <Button className="w-full h-12 text-lg font-bold">Proceed to Login</Button>
           </Link>
        </div>
     );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">New Password</label>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input 
                name="password"
                type="password" 
                required
                disabled={loading}
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-muted border border-input rounded-xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Confirm Password</label>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input 
                name="confirmPassword"
                type="password" 
                required
                disabled={loading}
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-muted border border-input rounded-xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
            </div>
        </div>

        <Button className="w-full h-12 text-base mt-4 font-bold" size="lg" disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Reset Password"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-background px-4">
      {/* Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary/2 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Coins className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                CryptoPulse
              </span>
            </Link>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Set New Password
            </h2>
            <p className="text-muted-foreground text-sm">
              Please choose a strong password for your account security.
            </p>
          </div>

          <Suspense fallback={<div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>}>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

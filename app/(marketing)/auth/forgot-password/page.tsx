"use client";

import { useState } from "react";
import Link from "next/link";
import { Coins, Mail, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { requestPasswordReset } from "@/app/actions/auth";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const result = await requestPasswordReset(email);

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
      toast.success("Reset link sent to your email!");
    } else {
      toast.error(result.error || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-background px-4">
      {/* Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary/2 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Coins className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                CryptoPulse
              </span>
            </Link>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Forgot Password?
            </h2>
            <p className="text-muted-foreground text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {!submitted ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-muted border border-input rounded-xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <Button className="w-full h-12 text-base mt-4 font-bold" size="lg" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Send Reset Link"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-xl text-primary font-medium text-sm">
                If an account exists for <b>{email}</b>, you will receive a password reset link shortly.
              </div>
              <p className="text-sm text-muted-foreground">
                Please check your inbox and spam folder. The link is valid for 15 minutes.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSubmitted(false)}
                className="w-full"
              >
                Try different email
              </Button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link 
              href="/auth" 
              className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

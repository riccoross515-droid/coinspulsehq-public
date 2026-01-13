"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation"; // Added useRouter
import { Coins, ArrowRight, Mail, Lock, User, KeyRound, ArrowLeft } from "lucide-react"; // Added KeyRound
import { Button } from "@/app/components/ui/Button";
import OtpInput from "@/app/components/ui/OtpInput";
import { Loader2 } from "lucide-react";
import { initiateLogin, completeLogin, initiateSignup, completeSignup } from "@/app/actions/auth";
import { resendAuthOTP } from "@/app/actions/otp";

function AuthContent() {
  const router = useRouter(); 
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(mode !== "signup");
  const [loading, setLoading] = useState(false);
  
  // OTP State
  const [step, setStep] = useState<"FORM" | "OTP">("FORM");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync state if URL param changes
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setIsLogin(mode !== "signup");
    setStep("FORM"); // Reset step on mode switch
    setOtp(["", "", "", "", "", ""]);
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const formEmail = formData.get("email") as string;
    
    // Store email for step 2
    setEmail(formEmail);

    const result = isLogin ? await initiateLogin(formData) : await initiateSignup(formData);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Verification code sent!");
      setStep("OTP");
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (code: string) => {
    setLoading(true);

    const result = isLogin 
        ? await completeLogin(email, code) 
        : await completeSignup(email, code);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success(isLogin ? "Welcome back!" : "Account verified!");
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-background px-4">
      {/* Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary/2 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md">
        
        {step === "FORM" && (
            <>
                {/* Toggle Cards */}
                <div className="bg-card border border-border rounded-2xl p-2 mb-8 flex animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                    onClick={() => setIsLogin(true)}
                    disabled={loading}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                    isLogin 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Log In
                </button>
                <button
                    onClick={() => setIsLogin(false)}
                    disabled={loading}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                    !isLogin 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Sign Up
                </button>
                </div>

                {/* Main Card */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden mb-[40px] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                    <Coins className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        CryptoPulse
                    </span>
                    </Link>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                    {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                    {isLogin 
                        ? "Enter your email to receive a login code" 
                        : "Join thousands of investors earning daily returns"}
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleFormSubmit}>
                    {!isLogin && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground ml-1">Full Name</label>
                        <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input 
                            name="name"
                            type="text" 
                            required
                            disabled={loading}
                            placeholder="Alex Morgan"
                            className="w-full bg-muted border border-input rounded-xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                        </div>
                    </div>
                    )}
                    
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input 
                        name="email"
                        type="email" 
                        required
                        disabled={loading}
                        placeholder="you@example.com"
                        className="w-full bg-muted border border-input rounded-xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                    </div>

                    {/* Password Field - NOW VISIBLE FOR BOTH LOGIN AND SIGNUP */}
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input 
                            name="password"
                            type="password" 
                            required
                            disabled={loading}
                            placeholder="••••••••"
                            className="w-full bg-muted border border-input rounded-xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>
                        {!isLogin && <p className="text-xs text-muted-foreground ml-1">Used for secondary access methods.</p>}
                    </div>


                    {isLogin && (
                        <div className="flex justify-end">
                            {/* Hidden since we are using OTP primarily now, but could be "Use Password" toggle */}
                             <Link href="/auth/forgot-password" className="text-sm text-[#333] dark:text-primary hover:text-[#333]/80 font-medium">
                                Forgot Password?
                             </Link>
                        </div>
                    )}

                    <Button className="w-full h-12 text-base mt-4 font-bold" size="lg" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : (isLogin ? "Sign In" : "Continue")} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-muted-foreground">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 font-bold text-[#333] dark:text-primary hover:text-[#333]/80 hover:underline focus:outline-none"
                    >
                    {isLogin ? "Sign Up" : "Log In"} 
                    </button>
                </p>
                </div>
            </>
        )}

        {step === "OTP" && (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden mb-[40px] animate-in zoom-in-95 duration-300">
                <button 
                    onClick={() => setStep("FORM")}
                    className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="mt-4">
                    <OtpInput 
                        email={email}
                        loading={loading}
                        onComplete={handleOtpSubmit}
                        onResend={async () => {
                             const result = await resendAuthOTP(email, isLogin ? "LOGIN" : "SIGNUP");
                             return { 
                                 success: result.success, 
                                 error: result.error,
                                 message: result.message 
                             };
                        }}
                    />
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}



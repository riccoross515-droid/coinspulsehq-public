"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "./Button";

interface OtpInputProps {
  email: string;
  onComplete: (code: string) => void;
  onResend: () => Promise<{ success: boolean; message?: string; error?: string }>;
  loading?: boolean;
}

const OTP_LENGTH = 6;
const OTP_EXPIRES = 5 * 60; // 5 minutes (matches backend expiry)

export default function OtpInput({ email, onComplete, onResend, loading = false }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [timeLeft, setTimeLeft] = useState(0); // Start at 0 to allow immediate resend
  const [showTimer, setShowTimer] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (timeLeft <= 0) {
        setShowTimer(false);
        return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle Input Change
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Check completion
    const code = newOtp.join("");
    if (code.length === OTP_LENGTH && newOtp.every(d => d !== "")) {
        onComplete(code);
    }
  };

  // Handle Key Down (Backspace)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, OTP_LENGTH).split("");
    if (pastedData.some(char => isNaN(Number(char)))) return;

    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
        if (index < OTP_LENGTH) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus last filled or first empty
    const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();

    // Trigger complete if full
    if (pastedData.length === OTP_LENGTH) {
        onComplete(pastedData.join(""));
    }
  };

  // Handle Resend
  const handleResendClick = async () => {
    if (timeLeft > 0) return;
    
    setIsResending(true);
    setOtp(new Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();

    try {
        const result = await onResend();
        if (result.success) {
            toast.success("Code resent successfully");
            setTimeLeft(60); // 60s cooldown for UI
            setShowTimer(true);
        } else {
            toast.error(result.error || "Failed to resend code");
        }
    } catch (error) {
        toast.error("Something went wrong");
    } finally {
        setIsResending(false);
    }
  };

  // Format Time
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="w-full space-y-6">
       <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">Security Verification</h3>
            <p className="text-muted-foreground text-sm">
                Enter the code sent to <strong className="text-foreground">{email}</strong>
            </p>
            <p className="text-muted-foreground text-xs">
                Don't see it? Check your spam folder.
            </p>
       </div>

       {/* OTP Inputs */}
       <div className="flex justify-between gap-2 max-w-sm mx-auto">
            {otp.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={loading}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl border border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                />
            ))}
       </div>

       {/* Resend & Timer */}
       <div className="flex items-center justify-center text-sm px-2 flex-col gap-2">
            <button
                type="button"
                onClick={handleResendClick}
                disabled={timeLeft > 0 || isResending}
                className="font-medium text-primary hover:underline hover:text-primary/90 disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
            >
                {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : showTimer ? `Resend code in ${minutes}:${seconds}` : "Resend Code"}
            </button>
       </div>

       {/* Continue Button */}
       <Button 
            className="w-full h-12 text-base font-bold shadow-lg" 
            size="lg" 
            onClick={() => onComplete(otp.join(""))}
            disabled={loading || otp.some(d => d === "")}
        >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm"}
       </Button>
    </div>
  );
}

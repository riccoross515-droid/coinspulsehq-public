"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { generateOTP, verifyOTP } from "./otp";
import { sendWelcomeEmail } from "@/lib/email";

// --- SIGN UP FLOW ---

export async function initiateSignup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists but is not verified, maybe we resend OTP? 
      // For now, simple logic: if verified, say login. If not, maybe update details and resend.
      if (existingUser.isVerified) {
        return { error: "Account already registered. Please login.", step: "LOGIN" };
      } else {
        // User exists but unverified. Update password/name and resend OTP.
        await prisma.user.update({
          where: { email },
          data: { name, password }
        });
      }
    } else {
      // Create new unverified user
      await prisma.user.create({
        data: {
          email,
          password,
          name,
          balance: 0,
          role: "USER",
          isVerified: false, 
        },
      });
    }

    // Generate & Send OTP
    const otpResult = await generateOTP(email, "SIGNUP");
    if (!otpResult.success) {
      return { error: otpResult.error };
    }

    return { success: true, email }; 
  } catch (error) {
    console.error("Signup Init Error:", error);
    return { error: "Failed to initiate signup" };
  }
}

export async function completeSignup(email: string, otp: string) {
  try {
    // 1. Verify OTP
    const verifyResult = await verifyOTP(email, otp, "SIGNUP");
    if (!verifyResult.success) {
      return { error: verifyResult.error };
    }

    // 2. Mark User Verified
    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true }
    });

    // 3. Set Session
    (await cookies()).set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 4. Send Welcome Email
    const { sendWelcomeEmail } = await import("@/lib/email");
    await sendWelcomeEmail(user.email, user.name || "Investor");

    return { success: true };
  } catch (error) {
    console.error("Signup Complete Error:", error);
    return { error: "Failed to complete verification" };
  }
}

// --- LOGIN FLOW ---

export async function initiateLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Security: Generic error message
      return { error: "Invalid email or password" };
    }

    // Verify password
    if (user.password !== password) {
       return { error: "Invalid email or password" };
    }

    // Generate & Send OTP
    const otpResult = await generateOTP(email, "LOGIN");
    if (!otpResult.success) {
      return { error: otpResult.error };
    }

    return { success: true, email };
  } catch (error) {
    console.error("Login Init Error:", error);
    return { error: "Failed to initiate login" };
  }
}

export async function completeLogin(email: string, otp: string) {
  try {
    // 1. Verify OTP
    const verifyResult = await verifyOTP(email, otp, "LOGIN");
    if (!verifyResult.success) {
      return { error: verifyResult.error };
    }

    // 2. Get User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "User not found" };

    // 3. Set Session
    (await cookies()).set("userId", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error) {
    console.error("Login Complete Error:", error);
    return { error: "Failed to complete login" };
  }
}

export async function logout() {
  (await cookies()).delete("userId");
  redirect("/");
}

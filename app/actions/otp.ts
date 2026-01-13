"use server";

import prisma from "@/lib/prisma";
import { 
  sendSignupOTP, 
  sendLoginOTP, 
  sendWithdrawalOTP 
} from "@/lib/email";

export async function generateOTP(email: string, type: "SIGNUP" | "LOGIN" | "WITHDRAWAL", extraData?: any) {
  try {
    // 1. Rate Limiting: Check if an OTP was successfully sent in the last 60 seconds
    const lastOtp = await prisma.otp.findFirst({
      where: {
        email,
        type,
        createdAt: {
          gt: new Date(Date.now() - 60 * 1000) // 60 seconds ago
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (lastOtp) {
      return { success: false, error: "Please wait 60 seconds before requesting a new code." };
    }

    // 2. Generate Code (before DB operations)
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

    // 3. Send Email FIRST (before saving to DB)
    let emailResult;
    if (type === "SIGNUP") {
      emailResult = await sendSignupOTP(email, code);
    } else if (type === "LOGIN") {
      emailResult = await sendLoginOTP(email, code);
    } else if (type === "WITHDRAWAL") {
      emailResult = await sendWithdrawalOTP(email, code, {
        amount: extraData?.amount || 0,
        asset: extraData?.asset || 'USD',
        network: extraData?.network || 'N/A',
        address: extraData?.address || 'N/A'
      });
    }

    // If email fails, return early WITHOUT saving to DB
    // This allows immediate retry without waiting 60 seconds
    if (!emailResult?.success) {
        return { success: false, error: "Failed to send email. Please try again." };
    }

    // 4. Only save to DB if email was sent successfully
    // Invalidate previous OTPs
    await prisma.otp.updateMany({
      where: {
        email,
        type,
        used: false
      },
      data: {
        used: true
      }
    });

    // Save new OTP
    await prisma.otp.create({
      data: {
        email,
        code,
        type,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry (corrected from 10)
      }
    });

    return { success: true, message: "OTP sent successfully" };

  } catch (error) {
    console.error("Generate OTP Error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function verifyOTP(email: string, code: string, type: "SIGNUP" | "LOGIN" | "WITHDRAWAL") {
  try {
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email,
        code,
        type,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!otpRecord) {
      return { success: false, error: "Invalid or expired code" };
    }

    // Mark as used
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { used: true }
    });

    return { success: true };

  } catch (error) {
    console.error("Verify OTP Error:", error);
    return { success: false, error: "Verification failed" };
  }
}

export async function resendAuthOTP(email: string, type: "SIGNUP" | "LOGIN" | "WITHDRAWAL") {
  // Rate limiting is handled in generateOTP
  const result = await generateOTP(email, type);
  return result;
}

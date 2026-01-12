"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log(user)
    if (!user || user.password !== password) {
      return { error: "Invalid email or password" };
    }


    // Set auth cookie
    (await cookies()).set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });



  } catch (error) {
    console.error("Login error:", error);
    return { error: "Something went wrong" };
  }

  // Redirect must be outside try/catch or re-thrown
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Account already registered. Please login." };
    }

    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
        balance: 0,
        role: "USER",
      },
    });

    // Set auth cookie
    (await cookies()).set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Failed to create account" };
  }

  // Redirect must be outside try/catch
  redirect("/dashboard");
}

export async function logout() {
  (await cookies()).delete("userId");
  redirect("/");
}

"use server";

import { sendContactFormEmail } from "@/lib/email";

export async function sendContactEmail(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { success: false, error: "Please fill in all fields." };
  }

  try {
    const res = await sendContactFormEmail(email, name, message);
    if (!res.success) {
      return { success: false, error: "Failed to send message. Please try again later." };
    }
    return { success: true };
  } catch (error) {
    console.error("Contact Action Error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

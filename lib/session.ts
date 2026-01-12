
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5
        },
        investments: true
      }
  });

  if (!user) {
    return null;
  }

  return user;
}

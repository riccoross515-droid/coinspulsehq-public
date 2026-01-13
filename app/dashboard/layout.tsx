import prisma from "@/lib/prisma";
import { DashboardLayoutClient } from "@/app/components/dashboard/DashboardLayoutClient";
import AuthProvider from "@/app/components/auth/AuthProvider";
import { cookies } from "next/headers";


// Removed force-dynamic - React Query keeps pages fresh
// export const dynamic = "force-dynamic";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  // find the user with the userId in db
  const user = userId ? await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      image: true,
      balance: true,
      role: true,
      investments: {
        where: { status: "ACTIVE" },
        select: {
          amount: true,
          profit: true,
        }
      }
    }
  }) : null;

  if (!user && userId) {
    const { redirect } = await import("next/navigation");
    redirect("/api/auth/logout");
  } else if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/");
  }

  // Strict Access Control: Admins cannot access User Dashboard
  if (user?.role === "ADMIN") {
    const { redirect } = await import("next/navigation");
    redirect("/admin");
  }

  // Calculate Total Portfolio Value
  const walletBalance = user ? Number(user.balance) : 0;
  const totalInvested = user ? user.investments.reduce((acc, inv) => acc + Number(inv.amount) + Number(inv.profit || 0), 0) : 0;
  const totalPortfolioValue = walletBalance + totalInvested;



  return (
    <AuthProvider>
      <DashboardLayoutClient 
        user={user ? { name: user.name, image: user.image, balance: totalPortfolioValue } : null}
      >
        {children}
      </DashboardLayoutClient>
    </AuthProvider>
  );
}

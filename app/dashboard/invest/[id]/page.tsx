import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { InvestmentDetailsClient } from "@/app/components/dashboard/InvestmentDetailsClient";
import { redirect } from "next/navigation";

// Removed force-dynamic - React Query handles freshness
// export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) return null;

  const investment = await prisma.investment.findUnique({
    where: { 
        id: id,
        userId: user.id // Security check: ensure user owns this investment
    }
  });

  if (!investment) {
      redirect("/dashboard/invest");
  }

  const initialData = {
    ...investment,
    amount: Number(investment.amount),
    profit: Number(investment.profit || 0),
    dailyROI: Number(investment.dailyROI)
  };

  return <InvestmentDetailsClient id={id} initialData={initialData} />;
}

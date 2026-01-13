"use client";

import { InvestContent, Investment } from "./InvestContent";
import { useUserData, UserData } from "@/app/hooks/use-user-data";

import { FullPageLoader } from "@/app/components/ui/FullPageLoader";

interface InvestClientWrapperProps {
  initialData?: UserData;
}

export function InvestClientWrapper({ initialData }: InvestClientWrapperProps) {
  const { data, isLoading } = useUserData(initialData);

  if (isLoading && !data) {
      return <FullPageLoader />;
  }

  if (!data) return null;

  // Sanitize investments for the client component
  const sanitizedInvestments: Investment[] = data.investments.map(inv => ({
    ...inv,
    amount: Number(inv.amount),
    profit: Number(inv.profit),
    dailyROI: Number(inv.dailyROI)
  }));

  return <InvestContent investments={sanitizedInvestments} />;
}

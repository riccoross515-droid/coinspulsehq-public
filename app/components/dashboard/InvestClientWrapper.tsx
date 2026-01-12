"use client";

import { InvestContent, Investment } from "./InvestContent";
import { useUserData, UserData } from "../../hooks/use-user-data";

interface InvestClientWrapperProps {
  initialData: UserData;
}

export function InvestClientWrapper({ initialData }: InvestClientWrapperProps) {
  const { data } = useUserData(initialData);

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

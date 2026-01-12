"use client";

import { InvestmentDetails } from "@/app/components/dashboard/InvestmentDetails";
import { useInvestment, InvestmentDetail } from "@/app/hooks/use-investment";

interface InvestmentDetailsClientProps {
  id: string;
  initialData: InvestmentDetail;
}

export function InvestmentDetailsClient({ id, initialData }: InvestmentDetailsClientProps) {
  const { data } = useInvestment(id, initialData);

  if (!data) return null;

  return (
    <InvestmentDetails 
      investment={{
        ...data,
        amount: Number(data.amount),
        profit: Number(data.profit || 0)
      }} 
    />
  );
}

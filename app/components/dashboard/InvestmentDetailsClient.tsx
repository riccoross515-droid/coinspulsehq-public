"use client";

import { InvestmentDetails } from "@/app/components/dashboard/InvestmentDetails";
import { useInvestment, InvestmentDetail } from "@/app/hooks/use-investment";

import { FullPageLoader } from "@/app/components/ui/FullPageLoader";

interface InvestmentDetailsClientProps {
  id: string;
  initialData?: InvestmentDetail;
}

export function InvestmentDetailsClient({ id, initialData }: InvestmentDetailsClientProps) {
  const { data, isLoading } = useInvestment(id, initialData);

  if (isLoading && !data) {
    return <FullPageLoader />;
  }

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

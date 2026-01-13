"use client";

import { useQuery } from "@tanstack/react-query";

export interface InvestmentDetail {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  profit: number;
  dailyROI: number;
  status: string;
  startDate: Date;
  endDate: Date | null;
}

async function fetchInvestment(id: string): Promise<InvestmentDetail> {
  const res = await fetch(`/api/investments/${id}`);
  if (!res.ok) throw new Error("Failed to fetch investment");
  return res.json();
}

export function useInvestment(id: string, initialData?: InvestmentDetail) {
  return useQuery({
    queryKey: ["investment", id],
    queryFn: () => fetchInvestment(id),
    initialData,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
  });
}

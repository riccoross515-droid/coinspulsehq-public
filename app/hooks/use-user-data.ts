"use client";

import { useQuery } from "@tanstack/react-query";

export interface UserData {
  balance: number;
  transactions: Array<{
    id: string;
    userId: string;
    amount: number;
    type: string;
    currency: string;
    network?: string | null;
    address: string | null;
    status: string;
    source?: string | null;
    createdAt: Date;
    updatedAt?: Date;
    txHash?: string | null;
  }>;
  investments: Array<{
    id: string;
    userId: string;
    planId: string;
    amount: number;
    profit: number;
    dailyROI: number;
    status: string;
    startDate: Date;
    endDate: Date | null;
  }>;
}

async function fetchUserData(): Promise<UserData> {
  const res = await fetch("/api/user");
  if (!res.ok) throw new Error("Failed to fetch user data");
  return res.json();
}

export function useUserData(initialData?: UserData) {
  return useQuery({
    queryKey: ["user-data"],
    queryFn: fetchUserData,
    initialData,
    staleTime: 60 * 1000, // 60 seconds
    refetchOnMount: 'always', // ALWAYS fetch on mount, even with initialData
    refetchOnWindowFocus: true,
  });
}

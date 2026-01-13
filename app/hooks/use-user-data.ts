"use client";

import { useQuery } from "@tanstack/react-query";

export interface UserData {
  name: string | null;
  email: string;
  image?: string | null;
  role: string;
  balance: number;
  assets: Array<{
    id: string;
    symbol: string;
    name: string;
    icon: string | null;
    networks: Array<{
      id: string;
      name: string;
      depositAddress: string | null;
      icon: string | null;
    }>;
  }>;
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
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    retry: 3,
  });
}

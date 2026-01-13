"use client";

import { useUserData } from "@/app/hooks/use-user-data";
import { PortfolioSnapshotManager } from "@/app/components/admin/PortfolioSnapshotManager";

export function AdminSectionWrapper() {
  const { data } = useUserData();

  if (!data || data.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="pt-8 border-t border-border/50">
      <h2 className="text-xl font-bold mb-4">Admin Controls</h2>
      <PortfolioSnapshotManager />
    </div>
  );
}

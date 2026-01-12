import { SettingsContent } from "../../components/dashboard/SettingsContent";
import { PortfolioSnapshotManager } from "@/app/components/admin/PortfolioSnapshotManager";
import { getCurrentUser } from "@/lib/session";

// Removed force-dynamic - minimal data fetching, mostly static
// export const dynamic = "force-dynamic";

async function getSettingsData() {
  const user = await getCurrentUser();
  return user;
}

export default async function SettingsPage() {
  const user = await getSettingsData();

  if (!user) return <div>User not found</div>;

  return (
    <div className="space-y-8">
      <SettingsContent user={user} />
      
      {/* Admin-only section */}
      {user.role === "ADMIN" && (
        <div className="pt-8 border-t border-border/50">
          <h2 className="text-xl font-bold mb-4">Admin Controls</h2>
          <PortfolioSnapshotManager />
        </div>
      )}
    </div>
  );
}

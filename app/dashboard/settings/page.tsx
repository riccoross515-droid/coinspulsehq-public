import { SettingsContent } from "@/app/components/dashboard/SettingsContent";
import { AdminSectionWrapper } from "@/app/components/dashboard/AdminSectionWrapper";

export default async function SettingsPage() {
  return (
    <div className="space-y-8">
      <SettingsContent />
      <AdminSectionWrapper />
    </div>
  );
}

import { AdminLayoutClient } from "@/app/components/admin/AdminLayoutClient";
import AdminGuard from "@/app/components/auth/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </AdminGuard>
  );
}

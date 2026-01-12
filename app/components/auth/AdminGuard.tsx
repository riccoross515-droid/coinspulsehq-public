import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/admin/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user && userId) {
    redirect("/api/auth/logout");
  }

  if (!user || user.role !== "ADMIN") {
    // Redirect non-admins to dashboard if they are logged in, or home
    redirect("/dashboard");
  }

  return <>{children}</>;
}

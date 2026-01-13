import { getUsers } from "@/app/actions/admin";
import { UsersManager } from "@/app/components/admin/UsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return <UsersManager initialUsers={users} />;
}

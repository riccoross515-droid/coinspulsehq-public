import prisma from "@/lib/prisma";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Search, Edit, Trash2, UserPlus, Shield } from "lucide-react";
import { Input } from "@/app/components/ui/Input";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      investments: true,
      transactions: true,
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500">Monitor and manage all platform participants.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              className="pl-10 h-10 w-[240px] bg-white border-slate-200" 
            />
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-10">
            <UserPlus className="h-4 w-4 mr-2" /> Add User
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium tracking-wide uppercase text-[10px]">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Invested</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const totalInvested = user.investments.reduce((acc, inv) => acc + Number(inv.amount), 0);
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors text-slate-700 font-medium">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{user.name || "Unnamed User"}</span>
                        <span className="text-xs text-slate-400">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {user.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      ${Number(user.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-500">
                      ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium uppercase text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-white border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

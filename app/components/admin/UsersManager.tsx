"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Modal } from "@/app/components/ui/Modal";
import { 
  Search, Edit, Trash2, UserPlus, Shield, 
  Check, X, Loader2, Mail, User as UserIcon,
  ShieldCheck, ShieldAlert
} from "lucide-react";
import { 
  getUsers, 
  updateUser, 
  deleteUser, 
  createUser 
} from "@/app/actions/admin";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  balance: number;
  isVerified: boolean;
  createdAt: string | Date;
  investments: Array<{ amount: any }>;
}

interface UsersManagerProps {
  initialUsers: any[];
}

export function UsersManager({ initialUsers }: UsersManagerProps) {
  const router = useRouter();
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // React Query for live data
  const { data: users, isFetching, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getUsers({}),
    initialData: initialUsers,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  // Client-side filtering
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u: any) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          u.email.toLowerCase().includes(term) ||
          (u.name && u.name.toLowerCase().includes(term)) ||
          u.id.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [users, searchTerm, roleFilter]);

  // Handlers
  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsProcessing(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      balance: parseFloat(formData.get("balance") as string),
      role: formData.get("role") as string,
      isVerified: formData.get("isVerified") === "true",
      password: formData.get("password") as string || undefined,
    };

    const res = await updateUser(selectedUser.id, data);
    setIsProcessing(false);
    
    if (res.success) {
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      refetch();
    } else {
      toast.error(res.error || "Failed to update user");
    }
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: (formData.get("password") as string) || "password123",
      balance: parseFloat(formData.get("balance") as string) || 0,
      role: formData.get("role") as string,
      isVerified: formData.get("isVerified") === "true",
    };

    const res = await createUser(data as any);
    setIsProcessing(false);
    
    if (res.success) {
      toast.success("User created successfully");
      setIsAddModalOpen(false);
      refetch();
    } else {
      toast.error(res.error || "Failed to create user");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    const res = await deleteUser(selectedUser.id);
    setIsProcessing(false);
    
    if (res.success) {
      toast.success("User deleted successfully");
      setIsDeleteModalOpen(false);
      refetch();
    } else {
      toast.error(res.error || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500">Monitor and manage all platform participants.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search users..."
              className="pl-10 h-10 bg-white border-slate-200" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Users</option>
            <option value="ADMIN">Admins</option>
          </select>
          <Button 
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-10"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" /> Add User
          </Button>
          {isFetching && <Loader2 className="h-5 w-5 animate-spin self-center text-slate-400" />}
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
                  <tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <th className="px-6 py-4 font-black">User</th>
                    <th className="px-6 py-4 font-black">Status</th>
                    <th className="px-6 py-4 font-black">Wallet Balance</th>
                    <th className="px-6 py-4 font-black">Total Invested</th>
                    <th className="px-6 py-4 font-black">Total Portfolio</th>
                    <th className="px-6 py-4 font-black">Joined</th>
                    <th className="px-6 py-4 text-right font-black">Actions</th>
                  </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user: any) => {
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors text-slate-700 font-medium">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{user.name || "Unnamed User"}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            user.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {user.role === 'ADMIN' ? <Shield className="h-2.5 w-2.5" /> : <UserIcon className="h-2.5 w-2.5" />}
                            {user.role}
                          </span>
                          <span className={`inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            user.isVerified 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            {user.isVerified ? <ShieldCheck className="h-2.5 w-2.5" /> : <ShieldAlert className="h-2.5 w-2.5" />}
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      ${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      ${(() => {
                        const activeInvestments = user.investments?.filter((inv: any) => inv.status === "ACTIVE") || [];
                        const totalInvested = activeInvestments.reduce((acc: number, inv: any) => acc + Number(inv.amount), 0);
                        return totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 });
                      })()}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      ${(() => {
                        const activeInvestments = user.investments?.filter((inv: any) => inv.status === "ACTIVE") || [];
                        const totalInvested = activeInvestments.reduce((acc: number, inv: any) => acc + Number(inv.amount), 0);
                        const totalProfit = activeInvestments.reduce((acc: number, inv: any) => acc + Number(inv.profit || 0), 0);
                        const total = user.balance + totalInvested + totalProfit;
                        return total.toLocaleString(undefined, { minimumFractionDigits: 2 });
                      })()}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium uppercase text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" size="sm" 
                          className="h-8 w-8 p-0! border-border text-foreground hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" size="sm" 
                          className="h-8 w-8 p-0! border-border text-foreground hover:text-red-600 hover:border-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-slate-500 font-medium">
              No users found matching your search.
            </div>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User Account">
        <form onSubmit={handleUpdateUser} className="p-6">
          
          <div className="space-y-6">
            {/* Personal Info Section */}
            <div className="space-y-4">
               <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                 <UserIcon className="h-3 w-3" /> Personal Information
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Full Name</label>
                    <Input name="name" defaultValue={selectedUser?.name || ""} required className="bg-slate-50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Email Address</label>
                    <Input name="email" defaultValue={selectedUser?.email || ""} required type="email" className="bg-slate-50" />
                  </div>
               </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Account Settings */}
            <div className="space-y-4">
               <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                 <Shield className="h-3 w-3" /> Account Settings
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">User Role</label>
                    <div className="relative">
                      <select 
                        name="role" 
                        defaultValue={selectedUser?.role}
                        className="w-full h-11 pl-3 pr-8 appearance-none bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-slate-300 transition-colors"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Verification Status</label>
                    <div className="relative">
                      <select 
                        name="isVerified" 
                        defaultValue={selectedUser?.isVerified ? "true" : "false"}
                        className="w-full h-11 pl-3 pr-8 appearance-none bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-slate-300 transition-colors"
                      >
                        <option value="true">Verified Account</option>
                        <option value="false">Unverified</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Financials & Security */}
            <div className="space-y-4">
               <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                 <ShieldAlert className="h-3 w-3" /> Financials & Security
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Wallet Balance ($)</label>
                    <Input name="balance" type="number" step="0.01" defaultValue={selectedUser?.balance} required className="bg-slate-50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">New Password <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <Input name="password" type="text" placeholder="Leave empty to keep current" className="bg-slate-50" />
                  </div>
               </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button className="bg-slate-900 text-white min-w-[120px]" type="submit" isLoading={isProcessing}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New User">
        <form onSubmit={handleAddUser} className="p-6 space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Full Name</label>
              <Input name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
              <Input name="email" placeholder="john@example.com" required type="email" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Password</label>
              <Input name="password" type="text" placeholder="Set password..." required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Initial Balance ($)</label>
              <Input name="balance" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">User Role</label>
              <select 
                name="role" 
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Verification Status</label>
              <select 
                name="isVerified" 
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="false">UNVERIFIED</option>
                <option value="true">VERIFIED</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button className="bg-slate-900 text-white" type="submit" isLoading={isProcessing}>Create User</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="p-6 space-y-4">
           <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700">
              <Trash2 className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">Permanent Action</p>
                <p className="text-xs">Are you sure you want to delete <b>{selectedUser?.email}</b>? This will permanently remove all their assets, transactions, and investments.</p>
              </div>
           </div>
           <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteUser} isLoading={isProcessing}>Delete Permanently</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
}

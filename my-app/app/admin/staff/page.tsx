"use client";

import React, { useEffect, useState } from "react";
import { useRBAC } from "@/hooks/useRBAC";
import { Shield, UserCog, User as UserIcon, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function StaffManagement() {
  const { isAdmin } = useRBAC();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Role updated to ${newRole}`);
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-gray-500 font-bold">Access Denied. Admins Only.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
            <Shield className="text-orange-500" size={32} /> Staff & User Roles
          </h1>
          <p className="text-gray-500 mt-1 text-sm font-bold">Manage permissions and assign Editor roles.</p>
        </header>

        {/* SEARCH */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none shadow-sm transition-all text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* CONTENT CONTAINER */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5">User Profile</th>
                  <th className="px-8 py-5">Current Role</th>
                  <th className="px-8 py-5">Assign New Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-orange-50/30 transition-colors group text-black">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center font-black text-gray-900 shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 text-lg tracking-tight">{user.name}</p>
                          <p className="text-xs text-gray-400 font-bold">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 
                          user.role === 'editor' ? 'bg-orange-100 text-orange-600' : 
                          user.role === 'staff' ? 'bg-green-100 text-green-700' : 
                          'bg-blue-100 text-blue-600'}
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <select 
                        className={`bg-gray-50 border border-gray-100 text-gray-900 text-xs font-black rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 block px-4 py-2.5 outline-none transition-all ${user.email === 'chetanmohane27@gmail.com' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white'}`}
                        value={user.role}
                        disabled={user.email === 'chetanmohane27@gmail.com'}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      >
                        <option value="customer">Demote to Customer</option>
                        <option value="staff">Official Staff</option>
                        <option value="editor">System Editor</option>
                        <option value="admin">System Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden divide-y divide-gray-50">
            {filteredUsers.map((user) => (
               <div key={user._id} className="p-6 space-y-4 text-black">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-gray-900">
                       {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                       <p className="font-black text-gray-900 tracking-tight">{user.name}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{user.role}</p>
                    </div>
                 </div>
                 
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50 space-y-4">
                    <div>
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Email Connection</label>
                       <p className="text-xs font-bold text-gray-700">{user.email}</p>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Permission Tier</label>
                       <select 
                        className="w-full bg-white border border-gray-100 text-gray-900 text-[10px] font-black rounded-xl px-3 py-2 outline-none"
                        value={user.role}
                        disabled={user.email === 'chetanmohane27@gmail.com'}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      >
                        <option value="customer">Customer</option>
                        <option value="staff">Staff</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                 </div>
               </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
             <div className="py-20 text-center">
                <Search size={48} className="mx-auto text-gray-100 mb-4" />
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No matching users found</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

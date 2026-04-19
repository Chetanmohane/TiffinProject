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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="text-orange-500" /> Staff & User Roles
        </h1>
        <p className="text-gray-500 mt-2">Manage permissions and assign Editor roles.</p>
      </header>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-orange-400 outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Current Role</th>
                <th className="px-6 py-4 font-bold">Assign New Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider
                      ${user.role === 'admin' ? 'bg-red-100 text-red-600 border border-red-200' : 
                        user.role === 'editor' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 
                        user.role === 'staff' ? 'bg-green-100 text-green-700 border border-green-200' : 
                        'bg-blue-100 text-blue-600 border border-blue-200'}
                    `}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <select 
                      className={`bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-2.5 outline-none ${user.email === 'chetanmohane27@gmail.com' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={user.role}
                      disabled={user.email === 'chetanmohane27@gmail.com'}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    >
                      <option value="customer">Customer (Demote)</option>
                      <option value="staff">Staff (Delivery/Kitchen)</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

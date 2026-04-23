"use client";

import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Trash2,
  Edit,
  ShieldCheck,
  CheckCircle2,
  Clock,
  X,
  UserCog
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRBAC } from "@/hooks/useRBAC";

export default function AdminCustomers() {
  const { can } = useRBAC();
  const [customers, setCustomers] = useState<any[]>([]);
  const [serverStats, setServerStats] = useState({ total: 0, active: 0, paused: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; type: 'danger' | 'warning' } | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Lock body scroll when a modal is open
  useEffect(() => {
    if (isEditModalOpen || confirmConfig) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isEditModalOpen, confirmConfig]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
        setServerStats(data.stats || { total: 0, active: 0, paused: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Customer",
      message: `Are you sure you want to delete ${name}? This action cannot be undone and all subscription data will be lost.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/customers?id=${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            setCustomers(customers.filter(c => c.id !== id));
            toast.success("Customer deleted successfully");
          } else {
            toast.error("Failed to delete: " + data.error);
          }
        } catch (err) {
          toast.error("Error deleting customer");
        }
        setConfirmConfig(null);
      }
    });
  };

  const handleMakeStaff = (id: string, name: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Promote to Staff",
      message: `Are you sure you want to promote ${name} to Staff? They will be moved out of the Customers section and granted management access.`,
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/customers", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id,
              updates: { role: "staff" }
            })
          });
          const data = await res.json();
          if (data.success) {
            setCustomers(customers.filter(c => c.id !== id));
            toast.success(`${name} is now a Staff member!`);
          } else {
            toast.error("Failed to update role: " + data.error);
          }
        } catch (err) {
          toast.error("Error promoting customer");
        }
        setConfirmConfig(null);
      }
    });
  };

  const handleEditClick = (customer: any) => {
    setEditingCustomer({ ...customer });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCustomer.id,
          updates: {
            name: editingCustomer.name,
            phone: editingCustomer.phone,
            address: editingCustomer.address,
            subscription: editingCustomer.subscription
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...c, ...editingCustomer } : c));
        setIsEditModalOpen(false);
        toast.success("Customer updated successfully");
      } else {
        toast.error("Update failed: " + data.error);
      }
    } catch (err) {
      toast.error("Error updating customer");
    }
  };

  const filteredCustomers = customers.filter(c => {
    const searchMatch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.phone?.includes(searchTerm);
    if (!searchMatch) return false;

    if (statusFilter === "ACTIVE") {
      return c.subscription?.status?.toLowerCase() === "active";
    }
    if (statusFilter === "INACTIVE") {
      return !c.subscription || c.subscription?.status?.toLowerCase() !== "active";
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             <Users size={32} className="text-orange-500" />
             User Management
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1">Manage and monitor all registered tiffin subscribers.</p>
        </div>
        
        <div className="flex flex-col xl:flex-row items-end xl:items-center gap-4 w-full xl:w-auto">
          <div className="relative group w-full xl:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search..."
                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex bg-gray-100 p-1.5 rounded-2xl shrink-0 w-full xl:w-auto border border-gray-200/50">
             <button 
               onClick={() => setStatusFilter("ALL")} 
               className={`flex-1 xl:flex-none px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${statusFilter === "ALL" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-900"}`}
             >
               All
             </button>
             <button 
               onClick={() => setStatusFilter("ACTIVE")} 
               className={`flex-1 xl:flex-none px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${statusFilter === "ACTIVE" ? "bg-white shadow-sm text-green-600" : "text-gray-400 hover:text-green-600"}`}
             >
               Active
             </button>
             <button 
               onClick={() => setStatusFilter("INACTIVE")} 
               className={`flex-1 xl:flex-none px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${statusFilter === "INACTIVE" ? "bg-white shadow-sm text-orange-600" : "text-gray-400 hover:text-orange-600"}`}
             >
               Inactive
             </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <StatItem label="Total Users" value={serverStats.total} icon={<Users size={20}/>} color="bg-blue-500" />
         <StatItem label="Active Subscriptions" value={serverStats.active} icon={<CheckCircle2 size={20}/>} color="bg-green-500" />
         <StatItem label="Paused Service" value={serverStats.paused} icon={<Clock size={20}/>} color="bg-orange-500" />
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-black transition-all">
        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">Customer Details</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">Subscription</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">Address</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((customer, idx) => (
                <motion.tr 
                  key={customer.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-orange-50/30 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-lg font-black text-gray-900 shadow-sm border border-gray-200">
                        {customer.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="font-black text-gray-900 text-lg tracking-tight">{customer.name}</p>
                           {customer.role !== 'customer' && (
                             <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-lg border border-blue-100">
                               {customer.role} Account
                             </span>
                           )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="flex items-center gap-1 text-[11px] font-bold text-gray-400"><Mail size={12} /> {customer.email || 'N/A'}</span>
                           <span className="flex items-center gap-1 text-[11px] font-bold text-gray-400"><Phone size={12} /> {customer.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {customer.subscription ? (
                       <div className="space-y-1">
                          <p className="font-black text-gray-800 text-sm tracking-tight">{customer.subscription.planName}</p>
                          {customer.subscription.startDate && customer.subscription.nextRenewal && (
                            <p className="text-[10px] text-gray-500 font-bold whitespace-nowrap">
                              {customer.subscription.startDate} ➔ {customer.subscription.nextRenewal}
                            </p>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            customer.subscription.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {customer.subscription.status}
                          </span>
                       </div>
                    ) : (
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Active Plan</span>
                    )}
                  </td>
                  <td className="px-8 py-6 max-w-[200px]">
                    <p className="text-xs font-bold text-gray-500 truncate leading-relaxed">
                      <MapPin size={12} className="inline mr-1 text-orange-400" />
                      {customer.address || "No address provided"}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {can('edit') && customer.role === 'customer' && (
                         <button 
                          onClick={() => handleMakeStaff(customer.id, customer.name)}
                          title="Assign as Staff"
                          className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                         >
                            <UserCog size={20} />
                         </button>
                       )}
                       {can('edit') && (
                         <button 
                          onClick={() => handleEditClick(customer)}
                          title="Edit Customer"
                          className="p-3 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                         >
                            <Edit size={20} />
                         </button>
                       )}
                       {can('delete') && (
                         <button 
                          onClick={() => handleDelete(customer.id, customer.name)}
                          title="Delete Customer"
                          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                         >
                            <Trash2 size={20} />
                         </button>
                       )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE CARD VIEW ================= */}
        <div className="lg:hidden divide-y divide-gray-50 transition-all">
           {filteredCustomers.map((customer, idx) => (
             <motion.div 
               key={customer.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               className="p-6 space-y-4"
             >
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-900">
                        {customer.name?.charAt(0)}
                      </div>
                       <div>
                          <div className="flex items-center gap-1.5">
                             <p className="font-black text-gray-900 tracking-tight">{customer.name}</p>
                             {customer.role !== 'customer' && (
                               <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[6px] font-black uppercase rounded-md border border-blue-100">
                                 {customer.role}
                               </span>
                             )}
                          </div>
                          <p className="text-[10px] font-bold text-gray-400">{customer.phone}</p>
                       </div>
                   </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                   <div className="flex justify-between items-center">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Subscription</p>
                      {customer.subscription ? (
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          customer.subscription.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {customer.subscription.status}
                        </span>
                      ) : (
                        <span className="text-[8px] font-black text-gray-300 uppercase">None</span>
                      )}
                   </div>
                   {customer.subscription && (
                     <p className="text-xs font-bold text-gray-700">{customer.subscription.planName}</p>
                   )}
                   <p className="text-[10px] text-gray-500 flex items-start gap-1">
                      <MapPin size={10} className="mt-0.5 shrink-0 text-orange-400" />
                      {customer.address || "No address"}
                   </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                   {can('edit') && (
                     <button onClick={() => handleEditClick(customer)} className="flex-1 bg-gray-50 text-gray-700 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-gray-100">
                        Edit
                     </button>
                   )}
                   {can('edit') && customer.role === 'customer' && (
                     <button onClick={() => handleMakeStaff(customer.id, customer.name)} className="flex-1 bg-gray-50 text-blue-600 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-gray-100">
                        Staff
                     </button>
                   )}
                   {can('delete') && (
                     <button onClick={() => handleDelete(customer.id, customer.name)} className="p-3 bg-red-50 text-red-500 rounded-xl">
                        <Trash2 size={16} />
                     </button>
                   )}
                </div>
             </motion.div>
           ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="py-20 text-center">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                <Users size={40} />
             </div>
             <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No customers matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-black"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-orange-50/30 flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Edit Customer</h2>
                  <p className="text-gray-500 text-sm font-medium">Update profile information</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-3 text-gray-400 hover:text-gray-900 transition-colors bg-white rounded-2xl shadow-sm border border-gray-100">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold"
                        value={editingCustomer?.name || ""}
                        onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold"
                        value={editingCustomer?.phone || ""}
                        onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Delivery Address</label>
                   <textarea 
                     rows={3}
                     className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold resize-none"
                     value={editingCustomer?.address || ""}
                     onChange={(e) => setEditingCustomer({...editingCustomer, address: e.target.value})}
                   />
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-800 mb-4">Subscription Details</h3>
                  {editingCustomer?.subscription ? (
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Plan Name</label>
                              <input 
                                type="text" 
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-xs font-bold focus:ring-1 focus:ring-orange-500 outline-none"
                                value={editingCustomer.subscription.planName || ""}
                                onChange={(e) => setEditingCustomer({
                                  ...editingCustomer, 
                                  subscription: { ...editingCustomer.subscription, planName: e.target.value } 
                                })}
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status</label>
                              <select 
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-xs font-bold focus:ring-1 focus:ring-orange-500 outline-none"
                                value={editingCustomer.subscription.status || "Inactive"}
                                onChange={(e) => setEditingCustomer({
                                  ...editingCustomer, 
                                  subscription: { ...editingCustomer.subscription, status: e.target.value } 
                                })}
                              >
                                 <option value="Active">Active</option>
                                 <option value="Paused">Paused</option>
                                 <option value="Expired">Expired</option>
                                 <option value="Inactive">Inactive</option>
                              </select>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Start Date</label>
                              <input 
                                type="date"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-xs font-bold focus:ring-1 focus:ring-orange-500 outline-none"
                                value={editingCustomer.subscription.startDate || ""}
                                onChange={(e) => setEditingCustomer({
                                  ...editingCustomer, 
                                  subscription: { ...editingCustomer.subscription, startDate: e.target.value } 
                                })}
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">End Date</label>
                              <input 
                                type="date"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-xs font-bold focus:ring-1 focus:ring-orange-500 outline-none"
                                value={editingCustomer.subscription.nextRenewal || ""}
                                onChange={(e) => setEditingCustomer({
                                  ...editingCustomer, 
                                  subscription: { ...editingCustomer.subscription, nextRenewal: e.target.value } 
                                })}
                              />
                           </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            setConfirmConfig({
                              isOpen: true,
                              title: "Remove Subscription",
                              message: `Are you sure you want to completely remove the subscription data for ${editingCustomer.name}?`,
                              type: 'danger',
                              onConfirm: () => {
                                setEditingCustomer({ ...editingCustomer, subscription: null });
                                setConfirmConfig(null);
                              }
                            });
                          }}
                          className="text-[10px] uppercase font-black tracking-widest text-red-500 hover:text-red-700 bg-red-50 px-3 py-2 rounded-lg inline-block transition-colors"
                        >
                          Delete Subscription
                        </button>
                     </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">No Active Subscription</p>
                       <button 
                         type="button" 
                         onClick={() => setEditingCustomer({
                           ...editingCustomer, 
                           subscription: { planName: "Custom Plan", status: "Active", startDate: new Date().toISOString().split('T')[0], nextRenewal: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0] } 
                         })}
                         className="text-xs font-bold text-orange-600 bg-orange-100 px-4 py-2 rounded-lg"
                       >
                         + Add Subscription Manually
                       </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-xl shadow-orange-200 hover:shadow-orange-300 transition-all uppercase tracking-widest text-xs active:scale-[0.98]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmConfig?.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmConfig(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 text-black"
            >
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                 confirmConfig.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
               }`}>
                  <ShieldCheck size={32} />
               </div>
               <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{confirmConfig.title}</h3>
               <p className="text-gray-500 font-medium leading-relaxed mb-8">{confirmConfig.message}</p>
               
               <div className="flex gap-4">
                  <button 
                    onClick={() => setConfirmConfig(null)}
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-500 border border-gray-100 hover:bg-gray-50 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmConfig.onConfirm}
                    className={`flex-1 px-6 py-4 rounded-2xl font-black text-white shadow-xl transition-all uppercase tracking-widest text-[10px] active:scale-95 ${
                      confirmConfig.type === 'danger' ? 'bg-red-600 shadow-red-100 hover:bg-red-700' : 'bg-orange-600 shadow-orange-100 hover:bg-orange-700'
                    }`}
                  >
                    Confirm Action
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatItem({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex items-center justify-between group hover:border-orange-200 transition-all text-black">
       <div>
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
         <p className="text-2xl font-black text-gray-900 tracking-tighter">{value}</p>
       </div>
       <div className={`w-12 h-12 ${color} text-white rounded-[1.2rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
    </div>
  );
}

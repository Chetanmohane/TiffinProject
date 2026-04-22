"use client";

import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { XCircle, Search, RefreshCw, CalendarDays, Phone, ClipboardList, Edit, Trash2, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRBAC } from "@/hooks/useRBAC";

interface Cancellation {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  planName: string;
  mealType: "Lunch" | "Dinner";
  date: string;
  reason: string;
  cancelledAt: string;
}

export default function AdminCancellationsPage() {
  const { can } = useRBAC();
  const [cancellations, setCancellations] = useState<Cancellation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<Cancellation | null>(null);
  const [editForm, setEditForm] = useState({ date: "", mealType: "Lunch", reason: "" });
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cancellations");
      const data = await res.json();
      if (data.success) setCancellations(data.cancellations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return cancellations.filter((c) => {
      const matchSearch =
        c.customerName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search);
      const matchDate = filterDate ? c.date === filterDate : true;
      return matchSearch && matchDate;
    });
  }, [cancellations, search, filterDate]);

  const todayCount = cancellations.filter((c) => c.date === today).length;
  const totalCount = cancellations.length;

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return "--";
    }
  }

  // --- Handlers ---
  function openEditModal(item: Cancellation) {
    setEditingItem(item);
    setEditForm({
      date: item.date,
      mealType: item.mealType,
      reason: item.reason,
    });
  }

  async function handleUpdate() {
    if (!editingItem) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cancellations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem.id,
          ...editForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingItem(null);
        fetchData();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; type: 'danger' | 'warning' } | null>(null);

  async function handleDelete(id: string) {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Record",
      message: "Are you sure you want to delete this cancellation record? This will permanently remove the entry from the history.",
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/cancellations?id=${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (data.success) {
            fetchData();
          }
        } catch (e) {
          console.error(e);
        }
        setConfirmConfig(null);
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 ml-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <XCircle className="text-red-500" size={30} />
              Meal Cancellations
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Customers who cancelled their meal for today
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition shadow"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <StatCard title="Total Cancellations" value={totalCount} />
          <StatCard title="Today's Cancellations" value={todayCount} alert />
          <StatCard title="Cancellation Window" value="Before 10 AM" isText />
        </div>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none bg-white text-sm"
            />
          </div>
          <div className="relative">
            <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none bg-white text-sm"
            />
          </div>
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-500 hover:text-gray-900 transition"
            >
              Clear Date
            </button>
          )}
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-red-50 text-gray-800 border-b border-red-100">
                  <tr>
                    <th className="px-5 py-4 text-left font-bold">Customer</th>
                    <th className="px-5 py-4 text-left font-bold">Plan</th>
                    <th className="px-5 py-4 font-bold">Meal Type</th>
                    <th className="px-5 py-4 font-bold">Date</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 text-left font-bold">Reason</th>
                    <th className="px-5 py-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-t hover:bg-red-50 transition ${
                        item.date === today ? "bg-red-50/50" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">{item.customerName}</p>
                        <p className="text-xs text-gray-400">{item.email}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone size={10} /> {item.phone || "N/A"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1 text-gray-700 font-medium">
                          <ClipboardList size={14} className="text-orange-500" />
                          {item.planName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          {item.mealType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.date === today
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {item.date}
                          {item.date === today && " 📌 Today"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-gray-600 text-xs font-medium">
                        {formatTime(item.cancelledAt)}
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs max-w-[150px] truncate">
                        {item.reason || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                           {can('edit') && (
                             <button
                               onClick={() => openEditModal(item)}
                               className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                               title="Edit"
                             >
                               <Edit size={16} />
                             </button>
                           )}
                           {can('delete') && (
                             <button
                               onClick={() => handleDelete(item.id)}
                               className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                               title="Delete"
                             >
                               <Trash2 size={16} />
                             </button>
                           )}
                           {!can('edit') && !can('delete') && (
                             <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Protected</span>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                        No cancellations found.{filterDate && ` Try clearing the date filter.`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl shadow bg-white p-5 border-l-4 ${
                    item.date === today ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.customerName}</h3>
                      <p className="text-xs text-gray-400">{item.email}</p>
                      <p className="text-xs text-gray-400">📞 {item.phone || "N/A"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 bg-gray-50 text-blue-600 rounded-xl"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-gray-50 text-red-600 rounded-xl"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 text-[10px]">
                    <span className="px-2 py-1 rounded-full font-bold bg-orange-100 text-orange-700 uppercase">
                      {item.mealType}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                      📋 {item.planName}
                    </span>
                    <span className={`px-2 py-1 rounded-full font-semibold ${
                      item.date === today ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      📅 {item.date}{item.date === today && " (Today)"}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                      ⏰ {formatTime(item.cancelledAt)}
                    </span>
                  </div>
                  {item.reason && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      &quot;{item.reason}&quot;
                    </p>
                  )}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400 text-sm">
                  No cancellations found.
                </div>
              )}
            </div>
          </>
        )}

        {/* INFO BOX */}
        <div className="mt-6 bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg text-orange-700 text-sm">
          ℹ️ <b>Cancellation Window:</b> Customers can only cancel their meal before <b>10:00 AM IST</b> each day.
          After that, the cancel button is automatically hidden.
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Edit Cancellation</h3>
                  <p className="text-xs text-gray-400 mt-1">Order for {editingItem.customerName}</p>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Effective Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  />
                </div>

                {/* Meal Type */}
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Meal Type</label>
                   <div className="flex gap-2">
                     {["Lunch", "Dinner"].map(type => (
                       <button
                         key={type}
                         onClick={() => setEditForm(prev => ({ ...prev, mealType: type as any }))}
                         className={`flex-1 py-3 rounded-2xl text-xs font-bold transition
                           ${editForm.mealType === type ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                       >
                         {type}
                       </button>
                     ))}
                   </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Cancellation Reason</label>
                  <textarea
                    value={editForm.reason}
                    onChange={(e) => setEditForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Provide a reason..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                   onClick={() => setEditingItem(null)}
                   className="flex-1 py-4 rounded-2xl border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-1 py-4 rounded-2xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest hover:bg-orange-500 transition shadow-lg disabled:opacity-50"
                >
                  {saving ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmConfig?.isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
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
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-black"
            >
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-red-50 text-red-500`}>
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
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-white bg-red-600 shadow-xl shadow-red-100 hover:bg-red-700 transition-all uppercase tracking-widest text-[10px] active:scale-95"
                  >
                    Delete Record
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---- Stat Card ---- */
function StatCard({
  title,
  value,
  alert,
  isText,
}: {
  title: string;
  value: string | number;
  alert?: boolean;
  isText?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 shadow-sm ${
        alert ? "bg-red-500 text-white" : "bg-white text-gray-900"
      }`}
    >
      <p className={`text-xs ${alert ? "opacity-80" : "text-gray-500"}`}>{title}</p>
      <h3 className={`font-extrabold mt-1 ${isText ? "text-base" : "text-2xl"}`}>
        {value}
      </h3>
    </div>
  );
}

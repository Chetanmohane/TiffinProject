"use client";

import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";

/* ---------------- TYPES ---------------- */

type PaymentStatus = "SUCCESS" | "PENDING" | "FAILED";

interface Payment {
  id: string;
  customerName: string;
  phone?: string;
  planName?: string;
  amount?: number | string;
  paymentDate?: string;
  date: string;
  transactionId?: string;
  status: PaymentStatus;
  amt: string; // From API
  desc?: string;
}

/* ---------------- COMPONENT ---------------- */

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/payments");
    const data = await res.json();
    const normalized = (data.payments || []).map((p: any) => ({
        ...p,
        id: p._id || p.id,
        status: p.status?.toUpperCase() || "PENDING",
    }));
    setPayments(normalized);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  /* ---------------- ACTIONS ---------------- */

  const verifyPayment = async (id: string) => {
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", id }),
      });
      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "SUCCESS" } : p)),
        );
        toast.success("Payment verified successfully!");
      } else {
        const err = await res.json();
        toast.error("Verification failed: " + err.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify payment");
    }
  };

  /* ---------------- DERIVED DATA ---------------- */

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // 1. Search Filter
      const searchStr = search.toLowerCase();
      const matchesSearch =
        p.customerName.toLowerCase().includes(searchStr) ||
        (p.phone || "").includes(search) ||
        (p.transactionId || "").toLowerCase().includes(searchStr) ||
        (p.id || "").toLowerCase().includes(searchStr);

      // 2. Status Filter
      const matchesStatus = filter === "ALL" || p.status === filter;

      // 3. Date Range Filter
      let matchesDate = true;
      if (dateRange.from || dateRange.to) {
        const pDate = p.createdAt ? new Date(p.createdAt) : new Date(p.date || p.paymentDate || "");
        pDate.setHours(0, 0, 0, 0);

        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          if (pDate < fromDate) matchesDate = false;
        }
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(0, 0, 0, 0);
          if (pDate > toDate) matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [payments, search, filter, dateRange]);

  const stats = useMemo(() => {
    const successful = filteredPayments.filter((p) => p.status === "SUCCESS");
    const revenue = successful.reduce((sum, p) => {
      const value = typeof p.amt === "string" 
        ? parseFloat(p.amt.replace(/[^\d.-]/g, "")) || 0 
        : Number(p.amount || 0);
      return sum + Math.abs(value);
    }, 0);

    return {
      total: filteredPayments.length,
      successCount: successful.length,
      pendingCount: filteredPayments.filter((p) => p.status === "PENDING").length,
      revenue: revenue
    };
  }, [filteredPayments]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  /* ---------------- UI HELPERS ---------------- */

  const statusStyle = (status: PaymentStatus) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-orange-100 text-orange-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            💳 Payment Management
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1">
            Search, verify, and monitor all customer payments
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Filtered Total" value={stats.total} />
          <StatCard
            title="Successful"
            value={stats.successCount}
          />
          <StatCard
            title="Pending"
            value={stats.pendingCount}
          />
          <StatCard title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} highlight />
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex-1 flex flex-col sm:flex-row gap-4 items-center">
             <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:max-w-xs px-4 py-2 rounded-xl border-gray-200 border focus:ring-2 focus:ring-orange-400 outline-none"
             />
             
             {/* DATE RANGE INPUTS */}
             <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200/50 w-full sm:w-auto">
               <div className="flex items-center gap-1">
                 <span className="text-[9px] font-black uppercase text-gray-400">From:</span>
                 <input 
                   type="date"
                   max={new Date().toISOString().split("T")[0]}
                   value={dateRange.from}
                   onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                   className="bg-transparent text-[10px] font-bold outline-none border-b border-gray-200 pb-1"
                 />
               </div>
               <div className="flex items-center gap-1">
                 <span className="text-[9px] font-black uppercase text-gray-400">To:</span>
                 <input 
                   type="date"
                   max={new Date().toISOString().split("T")[0]}
                   value={dateRange.to}
                   onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                   className="bg-transparent text-[10px] font-bold outline-none border-b border-gray-200 pb-1"
                 />
               </div>
               {(dateRange.from || dateRange.to) && (
                 <button 
                  onClick={() => setDateRange({ from: "", to: "" })}
                  className="p-1 hover:bg-white rounded-full transition-colors"
                  title="Clear Dates"
                 >
                   <span className="text-red-500 text-xs">✕</span>
                 </button>
               )}
             </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["ALL", "SUCCESS", "PENDING", "FAILED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s as any)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${
                    filter === s
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                      : "bg-white border border-gray-200 text-gray-500 hover:bg-orange-50"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>


        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-orange-100">
              <tr>
                <th className="px-5 py-4 text-left">Customer</th>
                <th className="px-5 py-4">Plan</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Transaction</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((p) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-orange-50 transition"
                >
                  <td className="px-5 py-4 font-semibold">
                    {p.customerName}
                    <div className="text-xs text-gray-500">{p.phone}</div>
                  </td>
                  <td className="px-5 py-4">
                    {p.planName || p.description || p.desc}
                    {p.endDate && (
                      <span className="block text-xs text-orange-600 font-bold mt-1">Exp: {p.endDate}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-bold">
                    {p.amt || `₹${p.amount}`}
                  </td>
                  <td className="px-5 py-4">{p.paymentDate || p.date}</td>
                  <td className="px-5 py-4 text-xs font-mono text-gray-500">
                    {p.transactionId || p.id}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle(p.status)}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {p.status === "PENDING" && (
                      <button
                        onClick={() => verifyPayment(p.id)}
                        className="px-4 py-1.5 text-xs rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
                      >
                        Verify
                      </button>
                    )}
                    {p.status === "SUCCESS" && (
                      <span className="text-green-600 text-xs font-semibold">
                        Verified ✓
                      </span>
                    )}
                    {p.status === "FAILED" && (
                      <span className="text-red-600 text-xs font-semibold">
                        Retry Needed
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No matching payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE CARDS ================= */}
        <div className="lg:hidden space-y-4">
          {filteredPayments.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow p-5 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{p.customerName}</h3>
                  <p className="text-sm text-gray-500">{p.phone}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle(p.status)}`}
                >
                  {p.status}
                </span>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  📦 {p.planName || p.description || p.desc}
                  {p.endDate && <span className="ml-2 text-orange-600 font-bold text-xs">Exp: {p.endDate}</span>}
                </p>
                <p>💰 {p.amt || `₹${p.amount}`}</p>
                <p>📅 {p.paymentDate || p.date}</p>
                <p className="font-mono text-xs">🔁 {p.transactionId || p.id}</p>
              </div>

              {p.status === "PENDING" && (
                <button
                  onClick={() => verifyPayment(p.id)}
                  className="w-full mt-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition"
                >
                  Verify Payment
                </button>
              )}
            </div>
          ))}

          {filteredPayments.length === 0 && (
            <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
              No matching payments found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENT ---------------- */

function StatCard({
  title,
  value,
  highlight,
}: {
  title: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 shadow-sm ${
        highlight ? "bg-orange-500 text-white" : "bg-white"
      }`}
    >
      <p className="text-xs opacity-80">{title}</p>
      <h3 className="text-2xl font-extrabold mt-1">{value}</h3>
    </div>
  );
}

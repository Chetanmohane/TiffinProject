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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
     customerName: "",
     amt: "",
     type: "Credit",
     status: "Pending"
  });

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

  const handleAddPayment = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
       const res = await fetch("/api/admin/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add", payment: newPayment }),
       });
       if (res.ok) {
         toast.success("Payment added successfully!");
         setShowAddModal(false);
         setNewPayment({ customerName: "", amt: "", type: "Credit", status: "Pending" });
         fetchPayments();
       } else {
         const err = await res.json();
         toast.error("Error: " + err.error);
       }
     } catch (err) {
       console.error(err);
       toast.error("Failed to add payment");
     }
  };

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PaymentStatus | "ALL">("ALL");

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
      const searchStr = search.toLowerCase();
      const matchesSearch =
        p.customerName.toLowerCase().includes(searchStr) ||
        (p.phone || "").includes(search) ||
        (p.transactionId || "").toLowerCase().includes(searchStr) ||
        (p.id || "").toLowerCase().includes(searchStr);

      const matchesFilter = filter === "ALL" || p.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [payments, search, filter]);

  const totalRevenue = useMemo(() => {
    return payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => {
        const value = typeof p.amt === "string" 
          ? parseFloat(p.amt.replace(/[^\d.-]/g, "")) || 0 
          : Number(p.amount || 0);
        // Only count positive amounts (credits) as revenue if we want, 
        // but here we just sum them up.
        return sum + Math.abs(value); 
      }, 0);
  }, [payments]);

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 sm:ml-6 ml-2 pt-20 sm:pt-0">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            💳 Payment Management
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1">
            Search, verify, and monitor all customer payments
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Payments" value={payments.length} />
          <StatCard
            title="Successful"
            value={payments.filter((p) => p.status === "SUCCESS").length}
          />
          <StatCard
            title="Pending"
            value={payments.filter((p) => p.status === "PENDING").length}
          />
          <StatCard title="Revenue" value={`₹${totalRevenue}`} highlight />
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex-1 flex gap-3">
             <input
                placeholder="Search by name, phone or transaction ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-orange-400 outline-none"
             />
             <button 
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition whitespace-nowrap"
             >
                + Receive Payment
             </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {["ALL", "SUCCESS", "PENDING", "FAILED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition
                  ${
                    filter === s
                      ? "bg-orange-500 text-white"
                      : "bg-white border hover:bg-orange-50"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ADD PAYMENT MODAL */}
        {showAddModal && (
           <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                 <h2 className="text-xl font-black mb-6">Receive New Payment</h2>
                 <form onSubmit={handleAddPayment} className="space-y-4">
                    <div>
                       <label className="text-xs font-black uppercase text-gray-400">Customer Name</label>
                       <input 
                          type="text" 
                          required 
                          className="w-full border p-3 rounded-xl mt-1 outline-orange-500" 
                          placeholder="e.g. Chetan Mohane"
                          value={newPayment.customerName}
                          onChange={(e) => setNewPayment({...newPayment, customerName: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="text-xs font-black uppercase text-gray-400">Amount (₹)</label>
                       <input 
                          type="text" 
                          required 
                          className="w-full border p-3 rounded-xl mt-1 outline-orange-500" 
                          placeholder="e.g. 500"
                          value={newPayment.amt}
                          onChange={(e) => setNewPayment({...newPayment, amt: e.target.value})}
                       />
                    </div>
                    <div className="flex gap-4 mt-8">
                       <button 
                          type="button" 
                          onClick={() => setShowAddModal(false)}
                          className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold uppercase text-xs tracking-widest"
                       >
                          Cancel
                       </button>
                       <button 
                          type="submit" 
                          className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-orange-200"
                       >
                          Post Payment
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        )}

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-x-auto">
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
        <div className="md:hidden space-y-4">
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

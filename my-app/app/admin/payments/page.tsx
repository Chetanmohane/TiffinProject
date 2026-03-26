"use client";

import { useMemo, useState } from "react";

/* ---------------- TYPES ---------------- */

type PaymentStatus = "SUCCESS" | "PENDING" | "FAILED";

interface Payment {
  id: number;
  customerName: string;
  phone: string;
  planName: string;
  amount: number;
  paymentDate: string;
  transactionId: string;
  status: PaymentStatus;
}

/* ---------------- COMPONENT ---------------- */

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 1,
      customerName: "Rahul Sharma",
      phone: "9876543210",
      planName: "Monthly Veg",
      amount: 2500,
      paymentDate: "2026-01-20",
      transactionId: "TXN123456",
      status: "SUCCESS",
    },
    {
      id: 2,
      customerName: "Anita Verma",
      phone: "9123456789",
      planName: "Weekly Combo",
      amount: 850,
      paymentDate: "2026-01-22",
      transactionId: "TXN789012",
      status: "PENDING",
    },
    {
      id: 3,
      customerName: "Vikas Patel",
      phone: "9001122334",
      planName: "Monthly Non-Veg",
      amount: 3200,
      paymentDate: "2026-01-23",
      transactionId: "TXN445566",
      status: "FAILED",
    },
  ]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PaymentStatus | "ALL">("ALL");

  /* ---------------- ACTIONS ---------------- */

  const verifyPayment = (id: number) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "SUCCESS" } : p)),
    );
  };

  /* ---------------- DERIVED DATA ---------------- */

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.customerName.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search) ||
        p.transactionId.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "ALL" || p.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [payments, search, filter]);

  const totalRevenue = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + p.amount, 0);

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
        <div className="mb-8 ml-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            💳 Payment Management
          </h1>
          <p className="text-gray-600 mt-1">
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
          <input
            placeholder="Search by name, phone or transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-orange-400 outline-none"
          />

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
                  <td className="px-5 py-4">{p.planName}</td>
                  <td className="px-5 py-4 font-bold">₹{p.amount}</td>
                  <td className="px-5 py-4">{p.paymentDate}</td>
                  <td className="px-5 py-4 text-xs font-mono text-gray-500">
                    {p.transactionId}
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
                <p>📦 {p.planName}</p>
                <p>💰 ₹{p.amount}</p>
                <p>📅 {p.paymentDate}</p>
                <p className="font-mono text-xs">🔁 {p.transactionId}</p>
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

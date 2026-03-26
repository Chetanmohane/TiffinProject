"use client";

import React, { useState } from "react";

/* ---------------- TYPES ---------------- */

interface PauseEntry {
  id: number;
  customerName: string;
  phone: string;
  planName: string;
  pauseFrom: string;
  pauseTo: string;
  reason?: string;
}

/* ---------------- COMPONENT ---------------- */

export default function PauseManagementPage() {
  const [pausedCustomers, setPausedCustomers] = useState<PauseEntry[]>([
    {
      id: 1,
      customerName: "Rahul Sharma",
      phone: "9876543210",
      planName: "Monthly Veg",
      pauseFrom: "2026-01-20",
      pauseTo: "2026-01-25",
      reason: "Out of station",
    },
    {
      id: 2,
      customerName: "Anita Verma",
      phone: "9123456789",
      planName: "Weekly Combo",
      pauseFrom: "2026-01-22",
      pauseTo: "2026-01-22",
      reason: "Personal",
    },
  ]);

  const today = new Date().toISOString().split("T")[0];

  const isPausedToday = (from: string, to: string) =>
    today >= from && today <= to;

  const resumeDelivery = (id: number) => {
    setPausedCustomers((prev) => prev.filter((entry) => entry.id !== id));
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 ml-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            ⏸ Pause Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track customers with paused deliveries in real time
          </p>
        </div>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-orange-100 text-gray-900">
              <tr>
                <th className="px-4 py-4 text-left">Customer</th>
                <th className="px-4 py-4">Phone</th>
                <th className="px-4 py-4">Plan</th>
                <th className="px-4 py-4">From</th>
                <th className="px-4 py-4">To</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Reason</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {pausedCustomers.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-500">
                    🎉 No paused customers
                  </td>
                </tr>
              )}

              {pausedCustomers.map((entry) => {
                const pausedToday = isPausedToday(
                  entry.pauseFrom,
                  entry.pauseTo,
                );

                return (
                  <tr
                    key={entry.id}
                    className={`
                      border-t transition
                      hover:shadow-md hover:-translate-y-[1px]
                      ${pausedToday ? "bg-red-50" : "hover:bg-orange-50"}
                    `}
                  >
                    <td className="px-4 py-4 font-semibold">
                      {entry.customerName}
                    </td>
                    <td className="px-4 py-4">{entry.phone}</td>
                    <td className="px-4 py-4">{entry.planName}</td>
                    <td className="px-4 py-4">{entry.pauseFrom}</td>
                    <td className="px-4 py-4">{entry.pauseTo}</td>
                    <td className="px-4 py-4">
                      {pausedToday ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                          Paused Today
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          Scheduled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 italic">{entry.reason || "—"}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => resumeDelivery(entry.id)}
                        className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition"
                      >
                        Resume
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE CARDS ================= */}
        <div className="md:hidden space-y-4">
          {pausedCustomers.length === 0 && (
            <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
              🎉 No paused customers
            </div>
          )}

          {pausedCustomers.map((entry) => {
            const pausedToday = isPausedToday(entry.pauseFrom, entry.pauseTo);

            return (
              <div
                key={entry.id}
                className={`bg-white rounded-xl shadow p-5 space-y-3 ${
                  pausedToday ? "border-l-4 border-red-500" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-gray-900">
                    {entry.customerName}
                  </h3>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      pausedToday
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {pausedToday ? "Paused Today" : "Scheduled"}
                  </span>
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  <p>📞 {entry.phone}</p>
                  <p>📦 {entry.planName}</p>
                  <p>
                    📅 {entry.pauseFrom} → {entry.pauseTo}
                  </p>
                  <p className="italic">📝 {entry.reason || "—"}</p>
                </div>

                <button
                  onClick={() => resumeDelivery(entry.id)}
                  className="w-full mt-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition"
                >
                  Resume Delivery
                </button>
              </div>
            );
          })}
        </div>

        {/* WARNING */}
        <div className="mt-6 flex items-start gap-3 bg-red-100 border-l-4 border-red-600 p-4 rounded-lg text-red-800">
          <span className="text-xl">⚠️</span>
          <p className="text-sm">
            Customers marked <b>Paused Today</b> must <b>NOT</b> receive
            delivery.
          </p>
        </div>
      </div>
    </div>
  );
}

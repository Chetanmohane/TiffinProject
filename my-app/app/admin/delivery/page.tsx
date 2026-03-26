"use client";

import { useMemo, useState } from "react";

/* ---------------- TYPES ---------------- */

type MealType = "Veg" | "Non-Veg" | "Combo";

interface DeliveryCustomer {
  id: number;
  name: string;
  phone: string;
  address: string;
  mealType: MealType;
  paused: boolean;
}

/* ---------------- COMPONENT ---------------- */

export default function DailyDeliveryPage() {
  const today = new Date().toISOString().split("T")[0];

  const [filter, setFilter] = useState<MealType | "ALL">("ALL");

  const deliveries: DeliveryCustomer[] = [
    {
      id: 1,
      name: "Rahul Sharma",
      phone: "9876543210",
      address: "Flat 12, Shanti Nagar, Indore",
      mealType: "Veg",
      paused: false,
    },
    {
      id: 2,
      name: "Anita Verma",
      phone: "9123456789",
      address: "B-203, Vijay Nagar, Indore",
      mealType: "Non-Veg",
      paused: true,
    },
    {
      id: 3,
      name: "Suresh Patel",
      phone: "9001122334",
      address: "Near Tower Square, Indore",
      mealType: "Combo",
      paused: false,
    },
  ];

  /* ---------------- DERIVED DATA ---------------- */

  const filteredDeliveries = useMemo(() => {
    if (filter === "ALL") return deliveries;
    return deliveries.filter((d) => d.mealType === filter);
  }, [filter, deliveries]);

  const total = deliveries.length;
  const deliverCount = deliveries.filter((d) => !d.paused).length;
  const pausedCount = deliveries.filter((d) => d.paused).length;

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 ml-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            🚚 Daily Delivery List
          </h1>
          <p className="text-gray-600 mt-1">
            Delivery schedule for <b className="text-gray-900">{today}</b>
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard title="Total" value={total} />
          <StatCard title="Deliver Today" value={deliverCount} success />
          <StatCard title="Paused" value={pausedCount} danger />
        </div>

        {/* FILTER */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["ALL", "Veg", "Non-Veg", "Combo"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition
                ${
                  filter === type
                    ? "bg-orange-500 text-white"
                    : "bg-white border hover:bg-orange-50"
                }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-orange-200 text-gray-900">
              <tr>
                <th className="px-5 py-4 text-left">Customer</th>
                <th className="px-5 py-4">Address</th>
                <th className="px-5 py-4">Meal</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredDeliveries.map((item) => (
                <tr
                  key={item.id}
                  className={`border-t transition ${
                    item.paused ? "bg-red-50" : "hover:bg-orange-50"
                  }`}
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">📞 {item.phone}</p>
                  </td>

                  <td className="px-5 py-4 text-gray-700">{item.address}</td>

                  <td className="px-5 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {item.mealType}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {item.paused ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        ⛔ Paused
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        ✔ Deliver
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    No deliveries found for selected filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE CARDS ================= */}
        <div className="md:hidden space-y-4">
          {filteredDeliveries.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl shadow p-5 bg-white ${
                item.paused ? "border-l-4 border-red-500" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">📞 {item.phone}</p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100">
                  {item.mealType}
                </span>
              </div>

              <p className="text-sm text-gray-700 mt-2">📍 {item.address}</p>

              <div className="mt-3">
                {item.paused ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    ⛔ Paused
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    ✔ Deliver Today
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredDeliveries.length === 0 && (
            <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
              No deliveries found for selected filter
            </div>
          )}
        </div>

        {/* WARNING */}
        <div className="mt-6 bg-red-100 border-l-4 border-red-500 p-4 rounded-lg text-red-700 text-sm">
          ⚠️ <b>Paused customers</b> must NOT receive delivery today.
        </div>
      </div>
    </div>
  );
}

/* ---------------- STATS CARD ---------------- */

function StatCard({
  title,
  value,
  success,
  danger,
}: {
  title: string;
  value: number;
  success?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 shadow-sm ${
        success
          ? "bg-green-500 text-white"
          : danger
            ? "bg-red-500 text-white"
            : "bg-white"
      }`}
    >
      <p className="text-xs opacity-80">{title}</p>
      <h3 className="text-2xl font-extrabold mt-1">{value}</h3>
    </div>
  );
}

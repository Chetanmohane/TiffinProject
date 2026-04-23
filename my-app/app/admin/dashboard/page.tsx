
"use client";

import React, { useEffect, useState } from "react";
import { Users, ShoppingBag, PauseCircle, IndianRupee } from "lucide-react";
import { useRBAC } from "@/hooks/useRBAC";

export default function AdminDashboard() {
  const { role, isAdmin } = useRBAC();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* HEADER */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Quick overview of today’s business performance (Live)
        </p>
      </header>

      {/* STATS */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {isAdmin && (
          <StatCard
            title="Customers"
            value={data.totalCustomers.toString()}
            Icon={Users}
            gradient="from-orange-500 to-red-500"
          />
        )}

        <StatCard
          title="Delivered"
          value={data.todaysDeliveries.toString()}
          Icon={ShoppingBag}
          gradient="from-amber-400 to-orange-500"
        />

        <StatCard
          title="Paused"
          value={data.pausedCustomers.toString()}
          Icon={PauseCircle}
          gradient="from-red-500 to-rose-700"
        />

        {isAdmin && (
          <StatCard
            title="Revenue"
            value={data.revenue}
            Icon={IndianRupee}
            gradient="from-green-500 to-emerald-600"
          />
        )}
      </div>

      {/* LIVE DELIVERIES SECTION */}
      <div className="bg-white rounded-[2rem] sm:rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Delivered Orders
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time delivery pulse</p>
          </div>
          <div className="px-5 py-2 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
            {data.todaysDeliveries} Today
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/30">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Customer Name</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Meal Type</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Delivery Time</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.recentDeliveries && data.recentDeliveries.length > 0 ? (
                data.recentDeliveries.map((delivery: any) => (
                  <tr key={delivery._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 font-bold text-gray-900">{delivery.customerName}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${delivery.type === 'Lunch' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {delivery.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-500">
                      {new Date(delivery.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest italic">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Delivered
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center">
                    <div className="text-4xl mb-4 grayscale opacity-20">🛵</div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No deliveries marked yet for today</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-gray-50">
          {data.recentDeliveries && data.recentDeliveries.length > 0 ? (
            data.recentDeliveries.map((delivery: any) => (
              <div key={delivery._id} className="p-5 flex justify-between items-center bg-white">
                <div className="space-y-1">
                  <p className="font-bold text-gray-900">{delivery.customerName}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${delivery.type === 'Lunch' ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-indigo-500'}`}>
                      {delivery.type}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {new Date(delivery.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-green-600 font-black text-[8px] uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Delivered
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No deliveries today</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- STAT CARD ---------------- */

const StatCard = React.memo(function StatCard({
  title,
  value,
  Icon,
  gradient,
  onClick,
}: {
  title: string;
  value: string;
  Icon: React.ElementType;
  gradient: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl bg-white p-6
        shadow-md
        min-h-[120px]
        transition-all duration-200
        hover:-translate-y-1
        will-change-transform
        ${onClick ? "cursor-pointer active:scale-95" : ""}
      `}
    >
      {/* Glow (isolated, non-layout affecting) */}
      <div
        aria-hidden
        className={`
          pointer-events-none
          absolute -top-10 -right-10
          h-28 w-28 rounded-full
          bg-gradient-to-br ${gradient}
          opacity-20 blur-2xl
        `}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-orange-600">
            {value}
          </h2>
        </div>

        <div
          className={`
            flex h-12 w-12 items-center justify-center
            rounded-xl bg-gradient-to-br ${gradient}
            text-white
          `}
        >
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
});

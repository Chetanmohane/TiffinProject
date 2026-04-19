
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
      <header className="sm:ml-8 ml-2 pt-20 sm:pt-0">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Quick overview of today’s business performance (Live)
        </p>
      </header>

      {/* STATS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin && (
          <StatCard
            title="Active Customers"
            value={data.totalCustomers.toString()}
            Icon={Users}
            gradient="from-orange-500 to-red-500"
          />
        )}

        <StatCard
          title="Today Orders"
          value={data.todaysDeliveries.toString()}
          Icon={ShoppingBag}
          gradient="from-amber-400 to-orange-500"
        />

        <StatCard
          title="Paused Customers"
          value={data.pausedCustomers.toString()}
          Icon={PauseCircle}
          gradient="from-red-500 to-rose-700"
        />

        {isAdmin && (
          <StatCard
            title="Total Revenue"
            value={data.revenue}
            Icon={IndianRupee}
            gradient="from-green-500 to-emerald-600"
          />
        )}
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
}: {
  title: string;
  value: string;
  Icon: React.ElementType;
  gradient: string;
}) {
  return (
    <div
      className="
        relative rounded-2xl bg-white p-6
        shadow-md
        min-h-[120px]
        transition-transform duration-200
        hover:-translate-y-1
        will-change-transform
      "
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

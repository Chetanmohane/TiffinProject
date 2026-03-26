/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export default function Order() {
  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Heading */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
        Welcome Back 👋
      </h1>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card title="Subscription" value="Active" />
        <Card title="Today's Meal" value="Roti, Dal, Sabzi" />
        <Card title="Delivery Status" value="Out for Delivery" />
        <Card title="Next Renewal" value="25 Jan 2026" />
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Action label="Manage Plan" link="/customer/dashboard/plan" />
        <Action label="Pause Meal" link="/customer/pause-meal" />
        <Action label="View Menu" link="/customer/dashboard/menu" />
        <Action label="Settings" link="/customer/settings" />
      </div>
    </div>
  );
}

/* ================= Card ================= */
const Card = ({ title, value }: any) => (
  <div
    className="bg-white rounded-xl shadow-sm
               p-4 sm:p-5
               hover:shadow-md transition
               min-h-[90px]
               flex flex-col justify-center"
  >
    <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
    <h3 className="text-lg sm:text-xl font-bold mt-1 text-gray-800">{value}</h3>
  </div>
);

/* ================= Action Button ================= */
const Action = ({ label, link }: any) => (
  <a
    href={link}
    className="bg-orange-500 text-white
               py-2.5 sm:py-3
               rounded-lg text-center
               text-xs sm:text-sm font-bold
               hover:bg-orange-600 transition"
  >
    {label}
  </a>
);

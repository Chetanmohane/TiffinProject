/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Shield, Home } from "lucide-react";
import StatCard from "./StatCard";
import MealHero from "./MealHero";
import HistoryTable from "./HistoryTable";

export default function Order() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("customer");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      window.location.href = "/login";
      return;
    }

    async function loadData() {
      try {
        const user = userStr ? JSON.parse(userStr) : null;
        const emailQuery = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";

        const [dashRes, histRes, plansRes] = await Promise.all([
          fetch(`/api/customer/dashboard${emailQuery}`),
          fetch(`/api/customer/history${emailQuery}`),
          fetch(`/api/customer/plans`),
        ]);
        const dash = await dashRes.json();
        const hist = await histRes.json();
        const plansData = await plansRes.json();
        
        setDashboardData(dash);
        setHistoryData(hist.history);
        setAvailablePlans(plansData.plans || []);
        setRole(user?.role || "customer");
        window.dispatchEvent(new Event("walletUpdate"));
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-100 border-t-orange-500"></div>
          <p className="text-sm font-bold text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 py-6 px-3 sm:px-8 lg:px-12 max-w-7xl mx-auto pb-24 transition-all">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2 px-1">Customer Dashboard</p>
           <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-none">
             Welcome Back, <span className="text-orange-500">{dashboardData?.user?.name?.split(' ')[0] || "Chetan"}</span> 👋
           </h1>
           <p className="text-sm font-bold text-gray-400 mt-2 px-1">Your healthy meals are just a click away.</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 bg-white/50 backdrop-blur-md p-2 rounded-3xl border border-gray-100 shadow-sm w-fit">
          <Link 
            href="/"
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:text-orange-500 transition-all active:scale-95"
          >
            <Home size={14} />
            <span>Site</span>
          </Link>
          {(role === "admin" || role === "editor") && (
            <Link 
              href="/admin/dashboard"
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95"
            >
              <Shield size={14} />
              Admin
            </Link>
          )}
        </div>
      </div>

      {/* Pause Notice */}
      {dashboardData?.user?.pauseDetails && (
        <div className="bg-gradient-to-r from-red-500/5 to-red-600/10 border border-red-500/20 rounded-[2.5rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative group">
           <div className="flex items-center gap-5 text-center sm:text-left relative z-10">
              <div className="w-14 h-14 bg-red-100/50 backdrop-blur rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                 ⏸️
              </div>
              <div>
                 <h4 className="font-black text-red-900 uppercase text-xs tracking-widest mb-1">Meal Service Paused</h4>
                 <p className="text-sm font-bold text-red-700/80">
                   Service resumes on <span className="text-red-600 font-black">{dashboardData.user.pauseDetails.to}</span>
                 </p>
              </div>
           </div>
           <Link 
            href="/customer/pause-meal" 
            className="w-full sm:w-auto px-10 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95 relative z-10 text-center"
           >
              Manage Pause
           </Link>
           {/* Decorative design */}
           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        </div>
      )}

      {/* Hero & Quick Actions Grid */}
      {/* Hero & Subscription Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        <div className="lg:col-span-2 rounded-[3rem] shadow-2xl shadow-gray-200/40 overflow-hidden h-fit">
          <MealHero meal={dashboardData?.todayMeal} dinner={dashboardData?.todayDinner} />
        </div>
        
        <div className="lg:col-span-1">
          {/* Plan Summary Card */}
          <div className="h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-gray-400/20 group">
             <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                   <div className="bg-orange-500/20 backdrop-blur-md p-2.5 rounded-xl border border-orange-500/20">
                      <Package size={20} className="text-orange-500" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Live Subscription</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-1 group-hover:text-orange-500 transition-colors">
                   {dashboardData?.user?.subscriptionStatus === 'Active' 
                      ? (dashboardData?.user?.activePlanName || "Premium Thali") 
                      : (dashboardData?.user?.subscriptionStatus || "No Plan")}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm font-bold mb-8">
                   {dashboardData?.user?.subscriptionStatus === 'Active' ? `Ending ${dashboardData?.user?.nextRenewal}` : "Get started with your custom diet"}
                </p>
                
                <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                   <div>
                      <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Remaining Meals</p>
                      <p className="text-3xl font-black text-white">{dashboardData?.quickStats?.find((s: any) => s.title === 'Meals Left')?.value || 0}</p>
                   </div>
                   <Link 
                      href="/customer/dashboard/plan" 
                      className="px-7 py-3 bg-white/5 hover:bg-orange-600 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest border border-white/5 hover:border-orange-500 active:scale-95"
                   >
                      Manage
                   </Link>
                </div>
             </div>
             <div className="absolute -bottom-10 -right-10 text-white/[0.03] transform -rotate-12 pointer-events-none group-hover:scale-110 group-hover:rotate-0 transition-all duration-700">
                <Package size={220} />
             </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        <Action 
          label="Active Plan" 
          icon="📝" 
          link="/customer/dashboard/plan" 
          gradient="from-blue-600 to-indigo-700" 
        />
        <Action 
          label={(dashboardData?.user?.subscriptionStatus === 'Expired' || dashboardData?.user?.subscriptionStatus === 'Inactive') ? "No Active Plan" : "Pause Meal"}
          icon="⏸️" 
          link={ (dashboardData?.user?.subscriptionStatus === 'Expired' || dashboardData?.user?.subscriptionStatus === 'Inactive') ? "#" : "/customer/pause-meal"} 
          onClick={() => {
            if (dashboardData?.user?.subscriptionStatus === 'Expired' || dashboardData?.user?.subscriptionStatus === 'Inactive') {
               import("react-hot-toast").then(t => t.default.error("Please buy a plan first to pause the service."));
            }
          }}
          gradient={ (dashboardData?.user?.subscriptionStatus === 'Expired' || dashboardData?.user?.subscriptionStatus === 'Inactive') ? "from-gray-400 to-gray-500 opacity-50" : "from-rose-500 to-red-600"} 
        />
        <Action 
          label="Daily Menu" 
          icon="🍽️" 
          link="/customer/dashboard/menu" 
          gradient="from-orange-500 to-amber-600" 
        />
        <Action 
          label="Settings" 
          icon="⚙️" 
          link="/customer/settings" 
          gradient="from-emerald-500 to-teal-600" 
        />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 tracking-tight">
        {dashboardData?.quickStats?.filter((s: any) => s.title !== 'Wallet Balance' && s.title !== 'Total Balance').map((stat: any, idx: number) => (
          <StatCard 
            key={idx} 
            {...stat} 
            onClick={() => {
              if (stat.title === 'Active Plan') {
                 window.location.href = '/customer/dashboard/plan';
              }
            }}
          />
        ))}
      </div>

      {/* TAILORED PLANS */}
      <div className="pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 px-1">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase leading-none mb-2">Tailored Plans <span className="text-orange-500">for You</span></h2>
            <p className="text-sm font-bold text-gray-400">Gourmet experiences curated just for your taste & health</p>
          </div>
          <Link href="/customer/dashboard/plan" className="text-[10px] font-black text-orange-600 hover:text-orange-700 underline decoration-2 underline-offset-8 uppercase tracking-[0.2em] w-fit">Explore More</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {availablePlans.slice(0, 3).map((plan: any, idx: number) => (
            <div key={idx} className="bg-white rounded-[3rem] p-6 sm:p-8 shadow-2xl shadow-gray-200/40 border border-gray-50 group hover:border-orange-500 transition-all duration-500 flex flex-col h-full">
               <div className="h-48 sm:h-56 w-full rounded-[2rem] bg-gray-100 mb-8 overflow-hidden relative shadow-inner">
                  <img src={`/img${idx+3}.webp`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={plan.name} />
                  <div className="absolute top-5 right-5 bg-black/80 backdrop-blur-md text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/10">{plan.tag || 'Popular Choice'}</div>
               </div>
               <h3 className="text-xl font-black text-gray-900 mb-2 px-1">{plan.name}</h3>
               <div className="flex items-baseline gap-1 mb-8 px-1">
                  <span className="text-2xl font-black text-orange-600">₹{plan.price}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/ {plan.duration} days intensive</span>
               </div>
               <div className="mt-auto">
                 <Link 
                   href="/customer/dashboard/plan"
                   className="w-full py-4 bg-gray-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-center block hover:bg-orange-500 hover:shadow-xl hover:shadow-orange-200 transition-all active:scale-95"
                  >
                    Activate Now
                  </Link>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="pt-8 sm:pt-12">
        <div className="mb-8 px-1">
           <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none mb-1">Recent Activity</h2>
           <p className="text-sm font-bold text-gray-400">View your recent meal activity and history</p>
        </div>
        <HistoryTable history={historyData} />
      </div>
    </div>
  );
}

/* ================= Action Component ================= */
const Action = ({ label, icon, link, gradient, onClick }: any) => (
  <Link
    href={link}
    onClick={(e) => {
      if (onClick) {
        onClick();
        if (link === "#") e.preventDefault();
      }
    }}
    className={`bg-gradient-to-br ${gradient} shadow-2xl shadow-gray-400/10
               p-5 sm:p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-4
               hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 group h-full min-h-[140px] relative overflow-hidden active:scale-95`}
  >
    {/* Decorative inner glow/glass layer */}
    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    
    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner relative z-10">
      <span className="text-3xl group-hover:rotate-12 group-hover:scale-125 transition-all duration-500">
        {icon}
      </span>
    </div>
    
    <span className="text-[11px] sm:text-xs font-black text-white text-center tracking-widest uppercase relative z-10 px-1">
      {label}
    </span>
  </Link>
);

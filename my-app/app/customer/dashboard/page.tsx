/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Shield, Home } from "lucide-react";
import StatCard from "./StatCard";
import MealHero from "./MealHero";
import HistoryTable from "./HistoryTable";
import { 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Zap 
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Order() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("customer");

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedMealType, setSelectedMealType] = useState<"Lunch" | "Dinner" | "Both">("Both");
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({ 
    name: "", 
    houseNo: "", 
    area: "", 
    pincode: "",
    phone: "" 
  });

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

        // Pre-fill delivery info
        if (user) {
          setDeliveryInfo(prev => ({
            ...prev,
            name: user.name || "",
            phone: user.phone || ""
          }));
        }

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

  const confirmPurchase = async () => {
    if (!selectedPlan) return;
    
    const fullAddress = `${deliveryInfo.houseNo}, ${deliveryInfo.area}${deliveryInfo.pincode ? ' - ' + deliveryInfo.pincode : ''}`;
    
    if (!deliveryInfo.houseNo.trim() || !deliveryInfo.area.trim()) {
      toast.error("Please provide complete delivery details");
      setCheckoutStep(1);
      return;
    }
    
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.email) {
       toast.error("Your session has expired. Please log in again.");
       return;
    }

    setLoadingCheckout(true);
    try {
      // Create order securely
      const res = await fetch("/api/customer/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planId: selectedPlan._id || selectedPlan.id,
          email: user.email,
          deliveryAddress: fullAddress,
          mealType: selectedMealType
        }),
      });
      const data = await res.json();
      
      if (!data.success) {
        toast.error("⚠️ Error: " + (data.message || data.error));
        setLoadingCheckout(false);
        return;
      }

      // Initialize Cashfree
      if (!(window as any).Cashfree) {
         await new Promise((resolve, reject) => {
             const script = document.createElement("script");
             script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
             script.onload = resolve;
             script.onerror = () => reject(new Error("Failed to load script"));
             document.body.appendChild(script);
         });
      }
      
      const cashfree = (window as any).Cashfree({
          mode: data.environment || "sandbox"
      });
      
      cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_modal"
      }).then(async (result: any) => {
          if (result.error) {
              toast.error(`Payment failed: ${result.error.message}`);
              setLoadingCheckout(false);
          }
          if (result.paymentDetails) {
              toast.success("Payment completed! Redirecting...");
              window.location.href = `/api/customer/payment/verify?order_id=${data.order_id}&plan_id=${selectedPlan._id || selectedPlan.id}&email=${user.email}&meal_type=${selectedMealType}`;
          }
      });
    } catch (err: any) {
      toast.error(`❌ Error: ${err.message}`);
      setLoadingCheckout(false);
    }
  };

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
                   {dashboardData?.user?.hasActivePlan ? dashboardData?.user?.activePlanName : "No Active Plan"}
                </h3>
                <div className="mb-6">
                   <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        dashboardData?.user?.subscriptionStatus === 'Active' ? 'bg-green-500/20 text-green-500' :
                        dashboardData?.user?.subscriptionStatus === 'Paused' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {dashboardData?.user?.subscriptionStatus || "Inactive"}
                      </span>
                      {dashboardData?.user?.subscriptionStatus === 'Active' && (
                         <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full uppercase italic">Live Now ⚡</span>
                      )}
                   </div>
                   {dashboardData?.user?.hasActivePlan && (
                     <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</p>
                        </div>
                        <p className="text-xs font-bold text-gray-300">
                           {dashboardData?.user?.startDate} <span className="text-orange-500 mx-1">→</span> {dashboardData?.user?.nextRenewal}
                        </p>
                     </div>
                   )}
                </div>
                  <div className="mt-auto">
                    {dashboardData?.user?.hasActivePlan && (
                      <div className="mb-8 bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner">
                         <div className="flex items-center justify-between gap-4">
                            <div className="text-center flex-1">
                               <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Delivered</p>
                               <p className="text-xl font-black text-green-500">{(dashboardData?.user?.totalMeals || 0) - (dashboardData?.user?.mealsLeft || 0)}</p>
                            </div>
                            <div className="w-px h-6 bg-white/10"></div>
                            <div className="text-center flex-1">
                               <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Remaining</p>
                               <p className="text-xl font-black text-orange-500">{dashboardData?.user?.mealsLeft || 0}</p>
                            </div>
                            <div className="w-px h-6 bg-white/10"></div>
                            <div className="text-center flex-1">
                               <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Total</p>
                               <p className="text-xl font-black text-white">{dashboardData?.user?.totalMeals || 0}</p>
                            </div>
                         </div>
                      </div>
                    )}

                    {dashboardData?.user?.hasActivePlan && (
                      <div className="mb-6">
                         <div className="flex items-center justify-between mb-2 px-1">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em]">Meal Inventory</p>
                            <div className="flex items-center gap-2">
                               <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                               <p className="text-[10px] font-black text-white tracking-widest">
                                  {Math.round((dashboardData?.user?.totalMeals > 0 ? (dashboardData?.user?.mealsLeft / dashboardData?.user?.totalMeals) * 100 : 0))}% AVAILABLE
                               </p>
                            </div>
                         </div>
                         <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 p-[1px]">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(dashboardData?.user?.totalMeals > 0 ? (dashboardData?.user?.mealsLeft / dashboardData?.user?.totalMeals) * 100 : 0)}%` }}
                               className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-red-600 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                            />
                         </div>
                      </div>
                    )}
                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <div>
                               {dashboardData?.user?.hasActivePlan ? (
                                 <>
                                   <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Live Balance</p>
                                   <p className="text-4xl font-black text-white tracking-tighter">{dashboardData?.user?.mealsLeft || 0}<span className="text-xs text-gray-600 ml-1 font-bold">MEALS</span></p>
                                 </>
                               ) : (
                                 <>
                                   <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Status</p>
                                   <p className="text-xl font-black text-red-500 uppercase tracking-tighter">Inactive</p>
                                 </>
                               )}
                            </div>
                            <button 
                               onClick={() => {
                                 const target = document.getElementById('tailored-plans');
                                 if (target) target.scrollIntoView({ behavior: 'smooth' });
                               }}
                               className="px-7 py-3 bg-white/5 hover:bg-orange-600 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest border border-white/5 hover:border-orange-500 active:scale-95"
                            >
                               {dashboardData?.user?.subscriptionStatus === 'Active' ? 'Upgrade' : 'Buy Plan'}
                            </button>
                         </div>
                     </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 text-white/[0.03] transform -rotate-12 pointer-events-none group-hover:scale-110 group-hover:rotate-0 transition-all duration-700">
                     <Package size={220} />
                  </div>
               </div>
            </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-10">
        <Action 
          label="Menu Card" 
          icon="🍽️" 
          link="/customer/dashboard/menu" 
          gradient="from-orange-500 to-amber-600" 
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
          label="Live Chat" 
          icon="💬" 
          link="#" 
          onClick={() => toast.success("Chef Assistant is coming soon!")}
          gradient="from-blue-600 to-indigo-700" 
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
                 const target = document.getElementById('tailored-plans');
                 if (target) target.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        ))}
      </div>

      <div className="pt-10" id="tailored-plans">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 px-1">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase leading-none mb-2">Tailored Plans <span className="text-orange-500">for You</span></h2>
            <p className="text-sm font-bold text-gray-400">Gourmet experiences curated just for your taste & health</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {availablePlans.length > 0 ? (
            availablePlans.slice(0, 3).map((plan: any, idx: number) => (
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
                    <button 
                      onClick={() => {
                        setSelectedPlan(plan);
                        setSelectedMealType("Both");
                        setCheckoutStep(1);
                      }}
                      className="w-full py-4 bg-gray-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-center block hover:bg-orange-500 hover:shadow-xl hover:shadow-orange-200 transition-all active:scale-95"
                    >
                      Activate Now
                    </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
               <p className="text-gray-400 font-black uppercase tracking-widest">No plans available at the moment. 🍽️</p>
            </div>
          )}
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

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
              onClick={() => setSelectedPlan(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden p-6 sm:p-12 border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-lg mb-2 inline-block">
                    Step {checkoutStep} of 2
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {checkoutStep === 1 ? "Delivery Details 🚚" : "Payment 💳"}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 transition-all font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Meal Selection */}
              <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Select Meal Type</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'Lunch', label: 'Lunch', price: selectedPlan.lunchPrice || (selectedPlan.price / 2) },
                        { id: 'Dinner', label: 'Dinner', price: selectedPlan.dinnerPrice || (selectedPlan.price / 2) },
                        { id: 'Both', label: 'Both', price: selectedPlan.bothPrice || selectedPlan.price }
                    ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedMealType(option.id as any)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedMealType === option.id ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-orange-200'}`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-tighter">{option.label}</span>
                          <span className={`text-xs font-black ${selectedMealType === option.id ? 'text-white' : 'text-slate-900'}`}>₹{option.price}</span>
                        </button>
                    ))}
                  </div>
              </div>

              {checkoutStep === 1 ? (
                <div className="space-y-4 mb-8">
                  <input 
                    type="text"
                    value={deliveryInfo.name}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                    placeholder="Receiver Name"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none ring-orange-500/20 focus:ring-2"
                  />
                  <input 
                    type="text"
                    value={deliveryInfo.phone}
                    maxLength={10}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value.replace(/\D/g, '')})}
                    placeholder="10-Digit Contact"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none ring-orange-500/20 focus:ring-2"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text"
                      value={deliveryInfo.houseNo}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, houseNo: e.target.value})}
                      placeholder="Flat/House No."
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none ring-orange-500/20 focus:ring-2"
                    />
                    <input 
                      type="text"
                      value={deliveryInfo.pincode}
                      maxLength={6}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, pincode: e.target.value.replace(/\D/g, '')})}
                      placeholder="Pincode"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none ring-orange-500/20 focus:ring-2"
                    />
                  </div>
                  <textarea 
                    rows={2}
                    value={deliveryInfo.area}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, area: e.target.value})}
                    placeholder="Area / Landmark"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none ring-orange-500/20 focus:ring-2 resize-none"
                  />
                  <button 
                    onClick={() => {
                      if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.houseNo || !deliveryInfo.area || !deliveryInfo.pincode) {
                        toast.error("Please fill all details");
                        return;
                      }
                      if (deliveryInfo.phone.length !== 10 || deliveryInfo.pincode.length !== 6) {
                        toast.error("Validation failed");
                        return;
                      }
                      setCheckoutStep(2);
                    }}
                    className="w-full py-5 rounded-2xl bg-gray-900 text-white font-black uppercase text-xs tracking-widest hover:bg-orange-500 transition-all flex items-center justify-center gap-2"
                  >
                    Next Step <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-gray-400 font-extrabold uppercase text-[10px]">Plan</span>
                      <span className="font-black text-gray-900">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-orange-600 font-black uppercase text-xs">Total Amount</span>
                      <span className="text-3xl font-black text-gray-900">₹{selectedMealType === 'Lunch' ? (selectedPlan.lunchPrice || selectedPlan.price / 2) : selectedMealType === 'Dinner' ? (selectedPlan.dinnerPrice || selectedPlan.price / 2) : (selectedPlan.bothPrice || selectedPlan.price)}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setCheckoutStep(1)} className="flex-1 py-5 rounded-2xl bg-gray-50 text-gray-400 font-black uppercase text-xs tracking-widest">Back</button>
                    <button 
                      onClick={confirmPurchase}
                      disabled={loadingCheckout}
                      className="flex-[2] py-5 rounded-2xl bg-orange-600 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-200"
                    >
                      {loadingCheckout ? "Loading..." : "Pay Securely"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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

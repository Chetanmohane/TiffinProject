"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Play, 
  MessageCircle, 
  User as UserIcon,
  Bot,
  X as CloseIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PlanPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [isSuccessState, setIsSuccessState] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true" || params.get("from") === "payment") {
      setIsSuccessState(true);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/customer/dashboard");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    async function loadData() {
      try {
        const user = JSON.parse(userStr!);
        const emailQuery = `?email=${encodeURIComponent(user.email)}`;

        const [dashRes, plansRes] = await Promise.all([
          fetch(`/api/customer/dashboard${emailQuery}`),
          fetch(`/api/customer/plans`),
        ]);
        const dash = await dashRes.json();
        const plansData = await plansRes.json();
        
        setDashboardData(dash);
        setAvailablePlans(plansData.plans || []);
      } catch (error) {
        console.error("Failed to load plan data", error);
        toast.error("Failed to reload your plan details");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading && !isSuccessState) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-100 border-t-orange-500"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Subscription...</p>
        </div>
      </div>
    );
  }

  const sub = dashboardData?.user;
  const planData = {
    planName: sub?.activePlanName || "No Active Plan",
    status: sub?.subscriptionStatus || "Inactive",
    startDate: sub?.startDate || "Not Syncing",
    endDate: sub?.nextRenewal || "--",
    mealsRemaining: dashboardData?.quickStats?.find((s: any) => s.title === 'Meals Left')?.value || 0,
    totalMeals: dashboardData?.user?.totalMeals || 0,
    mealType: dashboardData?.user?.mealType || "Both"
  };

  const mealsPercentage = planData.totalMeals > 0 ? (planData.mealsRemaining / planData.totalMeals) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#FAFCFF] pb-24 pt-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/20 rounded-full blur-[100px] -mr-40 -mt-20"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Success Banner if redirecting */}
        <AnimatePresence>
          {isSuccessState && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-green-600 p-6 rounded-[2rem] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-green-100">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Payment Successful!</h2>
                    <p className="text-sm font-bold opacity-80">Your plan has been activated. Details are shown below.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-black/10 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest">Auto-Redirect to Dashboard in</span>
                  <span className="text-3xl font-black">{countdown}s</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
              <ShieldCheck size={12} fill="white" />
              Verified Account
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
              My <span className="text-orange-500">Subscription</span>
            </h1>
            <p className="text-gray-400 mt-2 font-bold max-w-md">Manage your active plan, track daily meals, and upgrade your experience.</p>
          </div>

          <div className="bg-white p-5 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 flex items-center gap-6">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Renewal Date</p>
              <p className="text-2xl font-black text-gray-900">{planData.endDate}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Active Card */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3.5rem] overflow-hidden shadow-2xl shadow-gray-300/30 border border-gray-50 flex flex-col"
            >
              {/* Top Banner */}
              <div className="bg-gray-900 p-8 sm:p-12 relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                   <div>
                      <div className="flex items-center gap-2 mb-3">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                         <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Real-time Activity</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-none">
                        {planData.planName}
                      </h2>
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                        Member Since: <span className="text-white">{planData.startDate}</span>
                      </p>
                   </div>
                   <div className="w-20 h-20 bg-white/5 backdrop-blur-xl rounded-3xl flex items-center justify-center text-5xl">
                      🍱
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-12 relative z-10">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-lg font-black">{planData.status}</p>
                    </div>
                    <div className="bg-orange-600 p-4 rounded-2xl border border-orange-500 shadow-xl shadow-orange-900/10">
                        <p className="text-orange-200 text-[9px] font-black uppercase tracking-widest mb-1">Service</p>
                        <p className="text-lg font-black">{planData.mealType || "Lunch & Dinner"}</p>
                    </div>
                </div>
              </div>

              {/* Progress */}
              <div className="p-8 sm:p-12">
                 <div className="flex items-end justify-between mb-8">
                    <div>
                       <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight mb-1 flex items-center gap-2">
                         <Zap size={16} className="text-orange-500" fill="currentColor" />
                         Meal Inventory
                       </h4>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Track your remaining diet</p>
                    </div>
                    <div className="text-right">
                       <p className="text-4xl font-black text-gray-900 tracking-tighter">
                         {planData.mealsRemaining}
                         <span className="text-gray-300 text-lg sm:text-xl font-bold ml-1">/ {planData.totalMeals}</span>
                       </p>
                    </div>
                 </div>

                 {/* Bar */}
                 <div className="w-full bg-gray-50 h-5 rounded-full p-1 border border-gray-100 shadow-inner mb-8">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${mealsPercentage}%` }}
                      className="h-full bg-gradient-to-r from-orange-400 to-red-600 rounded-full shadow-lg relative flex items-center justify-end pr-1"
                    >
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse"></div>
                    </motion.div>
                 </div>

                 {/* Notice */}
                 <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-100">
                      <Zap size={18} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-orange-900 uppercase tracking-tight leading-none mb-1">Health Insights</p>
                      <p className="text-xs font-bold text-orange-800 opacity-80">
                        You have <span className="font-black">{planData.mealsRemaining}</span> home-style meals left to enjoy.
                      </p>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Support */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col items-start gap-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform rotate-12 group-hover:rotate-0 transition-transform duration-1000 pointer-events-none">
                  <Clock size={180} />
               </div>
               <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <Clock size={28} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tighter">Temporarily Pause</h3>
                  <p className="text-sm font-bold text-gray-400 leading-relaxed uppercase tracking-widest">Going away? Pause your meals balance instantly.</p>
               </div>
               <button 
                onClick={() => router.push('/customer/pause-meal')}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-100 transition-all active:scale-95 flex items-center justify-center gap-2"
               >
                  Manage Pause
                  <Play size={12} fill="white" />
               </button>
            </div>

            <div className="bg-gray-900 p-10 rounded-[3rem] text-white flex flex-col gap-6 relative overflow-hidden shadow-2xl">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-orange-500">
                   <MessageCircle size={28} />
                </div>
                <div>
                   <h4 className="text-2xl font-black tracking-tight mb-2 uppercase">Need Help?</h4>
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Speak with our chef for meal customizations.</p>
                </div>
                <button className="px-8 py-4 bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all self-start active:scale-95 shadow-lg shadow-orange-900/20">
                   Live Chat 🚀
                </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

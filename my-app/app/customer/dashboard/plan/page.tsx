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
      router.push("/login");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    let timer: any;
    if (params.get("success") === "true" || params.get("from") === "payment") {
      setIsSuccessState(true);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/customer/dashboard");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    async function loadData() {
      try {
        const user = JSON.parse(userStr!);
        const emailQuery = `?email=${encodeURIComponent(user.email)}&_t=${Date.now()}`;

        const [dashRes, plansRes] = await Promise.all([
          fetch(`/api/customer/dashboard${emailQuery}`, { cache: 'no-store' }),
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
    return () => {
      if (timer) clearInterval(timer);
    };
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
              return;
          }
          
          if (result.paymentDetails) {
              toast.loading("🔄 Verifying your payment automatically...", { id: "verify" });
              
              const verifyRes = await fetch("/api/customer/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  order_id: data.order_id,
                  plan_id: selectedPlan._id || selectedPlan.id,
                  email: user.email,
                  meal_type: selectedMealType
                })
              });
              
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                toast.success("✅ Plan Activated Automatically!", { id: "verify" });
                setSelectedPlan(null);
                setIsSuccessState(true);
                // The useEffect will handle the 10s countdown redirect to dashboard
              } else {
                toast.error(`❌ Verification failed: ${verifyData.error}`, { id: "verify" });
                setLoadingCheckout(false);
              }
          }
      });
    } catch (err: any) {
      toast.error(`❌ Error: ${err.message}`);
      setLoadingCheckout(false);
    }
  };

  const sub = dashboardData?.user;
  const hasPlan = sub?.hasActivePlan;

  const planData = {
    planName: hasPlan ? sub?.activePlanName : "No Active Plan",
    status: sub?.subscriptionStatus || "Inactive",
    startDate: hasPlan ? sub?.startDate : "---",
    endDate: hasPlan ? sub?.nextRenewal : "---",
    mealsRemaining: sub?.mealsLeft || 0,
    totalMeals: sub?.totalMeals || 0,
    mealType: sub?.mealType || "Both"
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
                         <div className={`w-2 h-2 rounded-full animate-pulse shadow-sm ${planData.status === 'Active' ? 'bg-green-500 shadow-green-500' : 'bg-red-500 shadow-red-500'}`}></div>
                         <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Real-time Activity</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-none">
                        {planData.planName}
                      </h2>
                      {hasPlan && (
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                          Member Since: <span className="text-white">{planData.startDate}</span>
                        </p>
                      )}
                   </div>
                   <div className="w-20 h-20 bg-white/5 backdrop-blur-xl rounded-3xl flex items-center justify-center text-5xl">
                      🍱
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-12 relative z-10">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                        <p className={`text-lg font-black uppercase ${planData.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>{planData.status}</p>
                    </div>
                    <div className="bg-orange-600 p-4 rounded-2xl border border-orange-500 shadow-xl shadow-orange-900/10">
                        <p className="text-orange-200 text-[9px] font-black uppercase tracking-widest mb-1">Duration</p>
                        <p className="text-sm font-black">{planData.startDate} <span className="opacity-50">→</span> {planData.endDate}</p>
                    </div>
                </div>
              </div>

              {/* Status Banner */}
              {planData.status === 'Expired' && (
                <div className="px-8 sm:px-12 pt-8">
                   <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm border border-red-100">
                         <AlertCircle size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-red-900 uppercase tracking-tight">Subscription Expired</p>
                         <p className="text-[10px] font-bold text-red-800 opacity-80">Please buy a new plan to continue receiving your home-cooked meals.</p>
                      </div>
                   </div>
                </div>
              )}

              {/* Progress */}
              {hasPlan && (
                <div className="p-8 sm:p-12">
                   <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                      <div>
                         <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight mb-1 flex items-center gap-2">
                           <Zap size={16} className="text-orange-500" fill="currentColor" />
                           Meal Inventory
                         </h4>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                            Full tracking of your consumption
                         </p>
                      </div>
                      
                      <div className="flex items-center gap-8 bg-gray-50 px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm">
                         <div className="text-center">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivered</p>
                            <p className="text-2xl font-black text-green-500">{planData.totalMeals - planData.mealsRemaining}</p>
                         </div>
                         <div className="w-px h-8 bg-gray-200"></div>
                         <div className="text-center">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Remaining</p>
                            <p className="text-2xl font-black text-orange-600">{planData.mealsRemaining}</p>
                         </div>
                         <div className="w-px h-8 bg-gray-200"></div>
                         <div className="text-center">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-2xl font-black text-gray-900">{planData.totalMeals}</p>
                         </div>
                      </div>
                   </div>

                   {/* Bar */}
                   <div className="relative mb-12">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">
                         <span>Consumed: {Math.round(100 - mealsPercentage)}%</span>
                         <span>Available: {Math.round(mealsPercentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-50 h-6 rounded-full p-1.5 border border-gray-100 shadow-inner overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${mealsPercentage}%` }}
                           className="h-full bg-gradient-to-r from-orange-400 to-red-600 rounded-full shadow-lg relative flex items-center justify-end pr-2"
                         >
                           <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse"></div>
                         </motion.div>
                      </div>
                   </div>

                   {/* Notice */}
                   <div className="bg-orange-50/50 p-7 rounded-[2.5rem] border border-orange-100/50 flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-orange-600 shadow-xl shadow-orange-100 border border-orange-50 shrink-0">
                        <Package size={24} fill="currentColor" />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-base font-black text-orange-900 uppercase tracking-tight leading-none mb-2">Inventory Insight</p>
                        <p className="text-xs font-bold text-orange-800 opacity-70 leading-relaxed">
                          Great job! You have consumed <span className="font-black text-orange-950">{planData.totalMeals - planData.mealsRemaining}</span> meals and still have <span className="font-black text-orange-950">{planData.mealsRemaining}</span> high-quality tiffins left in your account.
                        </p>
                      </div>
                   </div>
                </div>
              )}
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
                onClick={() => {
                  if (hasPlan) {
                    router.push('/customer/pause-meal');
                  } else {
                    toast.error("Please buy a plan to enable the Pause feature.");
                  }
                }}
                className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  hasPlan 
                  ? "bg-gray-900 text-white hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-100" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
               >
                  Manage Pause
                  <Play size={12} fill={hasPlan ? "white" : "gray"} />
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

        {/* Tailored Plans Section */}
        <div className="pt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 px-1">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase leading-none mb-2">Buy a <span className="text-orange-500">New Plan</span></h2>
              <p className="text-sm font-bold text-gray-400">Gourmet experiences curated just for your taste & health</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {availablePlans.length > 0 ? (
              availablePlans.slice(0, 3).map((plan: any, idx: number) => (
                <div key={idx} className="bg-white rounded-[3rem] p-6 sm:p-8 shadow-2xl shadow-gray-200/40 border border-gray-50 group hover:border-orange-500 transition-all duration-500 flex flex-col h-full">
                  <div className="h-48 sm:h-56 w-full rounded-[2rem] bg-gray-100 mb-8 overflow-hidden relative shadow-inner">
                      <img src={`/img${idx+3}.webp`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={plan.name} />
                      <div className="absolute top-5 right-5 bg-black/80 backdrop-blur-md text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/10">{plan.tag || 'Popular'}</div>
                      <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                         <span className="text-amber-500 flex italic">⭐⭐⭐⭐⭐</span>
                         <span className="text-[10px] font-black text-gray-900">4.9</span>
                      </div>
                  </div>
                  
                  <div className="flex justify-between items-start mb-4 px-1">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 mb-1">{plan.name}</h3>
                      <div className="flex items-center gap-2">
                        <Package size={12} className="text-orange-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{plan.duration * (plan.mealsPerDay || 1)} Total Meals</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-8 px-1">
                      <span className="text-2xl font-black text-orange-600">₹{plan.price}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/ {plan.duration} Days</span>
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
                        Activate Plan 🍱
                      </button>
                  </div>
                </div>
              ))
            ) : (
                <div className="col-span-full bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-4">
                   <Package size={32} />
                </div>
                <p className="text-gray-400 font-black uppercase tracking-widest">No plans available at the moment. 🍽️</p>
              </div>
            )}
          </div>
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
                        {loadingCheckout ? "Processing..." : "Pay Securely"}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

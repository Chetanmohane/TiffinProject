"use client";

import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { 
  Calendar, 
  CheckCircle2, 
  Package, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw,
  Star,
  Zap,
  TrendingUp,
  CreditCard,
  MessageCircle,
  Play,
  TrendingUp as TrendingIcon,
  Send,
  Bot,
  User as UserIcon,
  X as CloseIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import dynamic from "next/dynamic";

// Simple celebration effect
const SuccessCelebration = () => (
  <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          top: "-10%", 
          left: `${Math.random() * 100}%`,
          rotate: 0,
          scale: 0
        }}
        animate={{ 
          top: "110%", 
          rotate: 360 * 5,
          scale: [0, 1, 1, 0.5]
        }}
        transition={{ 
          duration: Math.random() * 2 + 2, 
          repeat: Infinity,
          delay: Math.random() * 5
        }}
        className="absolute w-2 h-6 sm:w-3 sm:h-8"
        style={{ 
          backgroundColor: ["#f97316", "#ef4444", "#3b82f6", "#22c55e"][Math.floor(Math.random() * 4)],
          borderRadius: '4px'
        }}
      />
    ))}
  </div>
);

export default function PlanPage() {
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // AI Chat States
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hi! I'm your Tiffin Assistant. How can I help you with your meal plan today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput };
    const history = [...messages, userMsg];
    setMessages(history);
    setChatInput("");
    setChatLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/customer/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages([...history, { role: "assistant", content: data.message }]);
      } else {
        setMessages([...history, { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }]);
      }
    } catch (err) {
      setMessages([...history, { role: "assistant", content: "Oops! Something went wrong." }]);
    } finally {
      setChatLoading(false);
      scrollToBottom();
    }
  };

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || !user.email) {
         setLoading(false);
         return;
      }

      const emailQuery = `?email=${encodeURIComponent(user.email)}`;
      const res = await fetch(`/api/customer/plan${emailQuery}`);
      const data = await res.json();
      setPlanData(data);
    } catch (err) {
      console.error("Failed to fetch current plan");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await fetch("/api/customer/plans");
      const data = await res.json();
      setAvailablePlans(data.plans || []);
    } catch (err) {
      console.error("Failed to fetch available plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  const [checkoutStep, setCheckoutStep] = useState(1);
  const [deliveryInfo, setDeliveryInfo] = useState({ 
    name: "", 
    houseNo: "", 
    area: "", 
    pincode: "",
    phone: "" 
  });

  useEffect(() => {
    if (planData?.user) {
      // Try to split existing address if possible, or just pre-fill name
      setDeliveryInfo({
        name: planData.user.name || "",
        houseNo: "", 
        area: planData.user.address || "", 
        pincode: "",
        phone: planData.user.phone || ""
      });
    }
  }, [planData]);

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
       toast.error("Your session has expired. Please log in again to continue.");
       return;
    }

    setLoading(true);
    try {
      // Update delivery profile first
      await fetch("/api/customer/settings", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ 
           email: user.email, 
           address: fullAddress,
           name: deliveryInfo.name
         }),
      });

      // 1. Create order securely from backend
      const res = await fetch("/api/customer/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planId: selectedPlan._id || selectedPlan.id,
          email: user.email,
          deliveryAddress: fullAddress
        }),
      });
      const data = await res.json();
      
      if (!data.success) {
        toast.error("⚠️ Failed to generate checkout order: " + (data.message || data.error));
        setLoading(false);
        return;
      }

      // 2. Initialize and load Cashfree dynamically
      if (!window.Cashfree) {
         await new Promise((resolve, reject) => {
             const script = document.createElement("script");
             script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
             script.onload = resolve;
             script.onerror = () => reject(new Error("Failed to load Cashfree script"));
             document.body.appendChild(script);
         });
      }
      
      //@ts-ignore
      const cashfree = window.Cashfree({
          mode: data.environment || "sandbox"
      });
      
      cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_modal"
      }).then(async (result: any) => {
          if (result.error) {
              toast.error(`Payment exception: ${result.error.message || "Failed"}`);
              setLoading(false);
          }
          if (result.paymentDetails) {
              toast.success("Payment completed! Verifying receipt securely...");
              const verifyUrl = `/api/customer/payment/verify?order_id=${data.order_id}&plan_id=${selectedPlan._id || selectedPlan.id}&email=${user.email}`;
              window.location.href = verifyUrl;
          }
      });
      
    } catch (err: any) {
      toast.error(`❌ Error initializing gateway: ${err.message || "Please check your network."}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
    fetchAvailablePlans();
    
    // Check for pending purchase after login
    const pending = sessionStorage.getItem("pendingPlan");
    if (pending && localStorage.getItem("user")) {
        const plan = JSON.parse(pending);
        sessionStorage.removeItem("pendingPlan");
        setSelectedPlan(plan);
    }

    // Check payment redirect statuses
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
       setShowSuccess(true);
       window.history.replaceState(null, "", window.location.pathname);
    } else if (params.get("error")) {
       toast.error("⚠️ Payment failed or canceled: " + params.get("error"));
       window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  if (loading && loadingPlans) {
    return (
      <div className="flex min-h-[90vh] items-center justify-center bg-[#FAFCFF]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-[6px] border-orange-100 border-t-orange-500 animate-spin"></div>
            <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" size={32} />
          </div>
          <div className="text-center">
             <p className="text-gray-900 font-black text-xl tracking-tight">Syncing your status...</p>
             <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 animate-pulse">Loading Premium Assets</p>
          </div>
        </div>
      </div>
    );
  }

  const mealsPercentage = planData ? (planData.mealsRemaining / planData.totalMeals) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#FAFCFF] pb-32 pt-4 sm:pt-6 relative">
      <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-orange-100/30 rounded-full blur-[80px] sm:blur-[120px] -mr-32 -mt-16"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4">
                <ShieldCheck size={10} fill="white" />
                Verified Subscription
             </span>
             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Subscription</span>
             </h1>
             <p className="text-gray-500 mt-2 sm:mt-3 max-w-md font-bold text-sm sm:text-lg leading-relaxed opacity-80">
                Manage your active plan, track daily meals, and upgrade your experience.
             </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 sm:gap-6 bg-white p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 w-fit"
          >
             <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                <Calendar size={20} className="sm:w-7 sm:h-7" />
             </div>
             <div>
                <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">Renewal Date</p>
                <p className="text-lg sm:text-2xl font-black text-gray-900">{planData?.endDate || "Not Active"}</p>
             </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
           {/* Current Plan Display */}
           <div className="lg:col-span-8 space-y-6 sm:space-y-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] sm:rounded-[3.5rem] overflow-hidden shadow-2xl shadow-gray-300/40 border border-gray-100 group"
              >
                 <div className="bg-gray-900 p-6 sm:p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 sm:w-80 h-48 sm:h-80 bg-orange-500/20 rounded-full blur-[50px] sm:blur-[80px] -mr-16 -mt-16 sm:-mr-32 sm:-mt-32"></div>
                    
                    <div className="relative z-10">
                       <div className="flex justify-between items-start mb-8 sm:mb-16">
                          <div>
                             <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <TrendingIcon size={14} className="text-orange-500" />
                                <span className="text-orange-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Real-time Status</span>
                             </div>
                             <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight flex items-center gap-3 sm:gap-4 uppercase break-words max-w-[200px] sm:max-w-none">
                                {planData?.status === "Paused" ? "Paused ⏸️" : (planData?.planName || "No Plan")}
                                {planData?.status === "Active" && (
                                   <span className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]"></span>
                                )}
                             </h2>
                          </div>
                          <div className="w-12 h-12 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-5xl group-hover:scale-110 transition-transform duration-700">
                             🍱
                          </div>
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-10">
                          <div className="bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10">
                             <p className="text-gray-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2">Member Since</p>
                             <p className="text-sm sm:text-xl font-black tracking-tight">{planData?.startDate || "--"}</p>
                          </div>
                          <div className="bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10">
                             <p className="text-gray-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2">Cycle</p>
                             <p className="text-sm sm:text-xl font-black tracking-tight capitalize">{planData?.frequency || "Monthly"}</p>
                          </div>
                          <div className="bg-orange-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-orange-400 col-span-2 md:col-span-1 shadow-lg shadow-orange-500/20">
                             <p className="text-orange-100 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2">Subscription</p>
                             <p className="text-sm sm:text-xl font-black tracking-tight">{planData?.status || "Inactive"}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="p-6 sm:p-12">
                    <div className="flex items-end justify-between mb-6 sm:mb-8">
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <Zap className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                             <span className="font-black text-gray-900 uppercase tracking-tight text-xs sm:text-sm">Meal Inventory</span>
                          </div>
                          <p className="text-gray-400 font-bold text-[10px] sm:text-xs uppercase">Check remaining balance</p>
                       </div>
                       <div className="text-right">
                          <p className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter">
                             {planData?.mealsRemaining || 0}
                             <span className="text-gray-300 text-sm sm:text-lg font-bold"> / {planData?.totalMeals || 0}</span>
                          </p>
                       </div>
                    </div>
                    
                    <div className="w-full bg-gray-50 h-4 sm:h-6 rounded-full overflow-hidden mb-6 sm:mb-8 p-1 sm:p-1.5 border border-gray-100 shadow-inner">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${mealsPercentage}%` }}
                         transition={{ duration: 1.5, ease: "circOut" }}
                         className="h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 shadow-[0_4px_12px_-4px_rgba(255,100,0,0.5)] relative flex items-center justify-end pr-1 box-content"
                       >
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/40 rounded-full animate-pulse"></div>
                       </motion.div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-orange-50/50 rounded-2xl border border-orange-100 gap-3">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-white rounded-xl shadow-sm"><TrendingIcon size={16} className="text-orange-600" /></div>
                           <p className="text-xs sm:text-sm font-black text-orange-900 uppercase tracking-tight">Health Status</p>
                        </div>
                        <p className="text-[11px] sm:text-sm font-bold text-orange-800">You&apos;ve enjoyed <span className="font-black">{(planData?.totalMeals || 0) - (planData?.mealsRemaining || 0)}</span> home-style meals.</p>
                    </div>
                 </div>
              </motion.div>

              <div className="grid grid-cols-1 gap-4 sm:gap-8">
                 <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex items-center justify-between group hover:border-orange-200 transition-all">
                    <div className="flex items-center gap-4 sm:gap-6">
                       <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-50 text-red-600 rounded-2xl sm:rounded-3xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                          <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">⭐</span>
                       </div>
                       <div>
                          <p className="text-xl sm:text-3xl font-black text-gray-900 tracking-tighter">4.8/5</p>
                          <p className="text-[9px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Plate Rating</p>
                       </div>
                    </div>
                    <ArrowRight size={18} className="text-gray-200 group-hover:text-red-500 transition-all" />
                 </div>
              </div>
           </div>

           {/* Quick Actions Sidebar */}
           <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-8">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl shadow-gray-200/50 border border-gray-100 hover:border-orange-500/20 transition-all group relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-5 transform rotate-45 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                    <Clock className="w-[120px] h-[120px] sm:w-[160px] sm:h-[160px]" />
                 </div>
                 <div className="relative z-10 h-full flex flex-col">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                      <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 tracking-tighter">Temporarily Pause</h3>
                    <p className="text-gray-500 mb-6 sm:mb-10 font-bold text-sm sm:text-base leading-relaxed opacity-80">Going away? Pause your service and save your meals balance instantly.</p>
                    <button 
                      onClick={() => window.location.href = '/customer/pause-meal'}
                      className="w-full py-4 sm:py-5 rounded-2xl bg-gray-900 text-white font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] hover:bg-orange-500 transition-all hover:shadow-xl hover:shadow-orange-200 flex items-center justify-center gap-2 group/btn active:scale-95"
                    >
                      Pause Service
                      <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 text-white relative overflow-hidden group shadow-2xl"
              >
                  <div className="relative z-10 h-full flex flex-col">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-orange-500">
                         <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <h4 className="font-black text-xl sm:text-2xl mb-2 tracking-tight uppercase">Need Support?</h4>
                      <p className="text-gray-400 text-xs sm:text-sm font-bold mb-6 sm:mb-10 leading-relaxed opacity-80">Chat with our chefs or team for any customizations or queries.</p>
                      <button 
                        onClick={() => { setChatOpen(true); scrollToBottom(); }}
                        className="py-3 sm:py-4 px-6 sm:px-8 bg-orange-500 text-white rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-orange-600 transition-all self-start flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95"
                      >
                          Open Live Chat <ArrowRight size={14} />
                      </button>
                  </div>
              </motion.div>
           </div>
        </div>

        {/* Available Plans Section */}
        <div className="mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 sm:mb-10 gap-6">
                <div className="text-center md:text-left">
                   <h3 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase">Explore <span className="text-orange-500">Premium</span> Packages</h3>
                   <p className="text-gray-400 sm:text-gray-500 font-bold mt-1 sm:mt-2 text-sm sm:text-lg">Tailored offerings for your gourment experience.</p>
                </div>
                <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-2 bg-orange-50 text-orange-600 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] border border-orange-100">
                   <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" />
                   Up to 20% Discount
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12">
               {loadingPlans ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-white rounded-[2rem] sm:rounded-[3rem] p-4 h-[400px] sm:h-[500px] border border-gray-100 animate-pulse">
                        <div className="w-full h-40 sm:h-56 bg-gray-100 rounded-[1.5rem] sm:rounded-[2.5rem] mb-6 sm:mb-8"></div>
                        <div className="h-6 sm:h-8 bg-gray-100 rounded-full w-2/3 mb-4 mx-4 sm:mx-6"></div>
                        <div className="h-10 sm:h-14 bg-gray-100 rounded-xl mx-4 sm:mx-6 mt-auto mb-4"></div>
                    </div>
                  ))
               ) : availablePlans.length > 0 ? (
                  <AnimatePresence>
                    {availablePlans.map((plan, idx) => (
                      <motion.div 
                        key={plan._id || plan.id} 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`
                          relative rounded-[2.5rem] sm:rounded-[3rem] p-3 sm:p-4 flex flex-col group transition-all duration-500
                          ${(plan.tag || idx === 1) ? "bg-gray-900 text-white shadow-2xl sm:scale-105 z-10 border-2 border-orange-500" : "bg-white border border-gray-100 shadow-xl"}
                        `}
                      >
                         <div className="relative w-full h-44 sm:h-56 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden mb-6 sm:mb-8">
                            <img 
                              src={idx === 0 ? "/img3.webp" : (idx === 1 ? "/img4.webp" : "/img5.webp")} 
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                              alt={plan.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
                               <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">{plan.name}</h4>
                            </div>
                            { (plan.tag || idx === 1) && (
                               <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-orange-500 text-white text-[8px] sm:text-[10px] font-black px-3 sm:px-4 py-1 rounded-lg sm:rounded-xl uppercase tracking-widest shadow-lg">
                                  {plan.tag || "Best Seller"}
                                </div>
                            )}
                         </div>

                         <div className="px-3 sm:px-6 pb-6 sm:pb-8 flex flex-col flex-1">
                            <p className="text-xs sm:text-sm font-bold text-gray-500 mb-6 min-h-[40px] leading-relaxed italic opacity-80">
                               {plan.description || "Indulge in home-style gourmet magic delivered right to your table."}
                            </p>
                            
                            <div className="flex items-baseline gap-2 mb-8 sm:mb-10">
                               <span className={`text-3xl sm:text-4xl font-black tracking-tighter ${(plan.tag || idx === 1) ? "text-white" : "text-gray-900"}`}>₹{plan.price}</span>
                               <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${(plan.tag || idx === 1) ? "text-gray-500" : "text-gray-400"}`}>/ {plan.duration} days</span>
                            </div>

                            <button 
                              onClick={() => { setSelectedPlan(plan); setCheckoutStep(1); }}
                              className={`
                                w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95
                                ${(plan.tag || idx === 1) 
                                  ? "bg-white text-gray-900 hover:bg-orange-500 hover:text-white" 
                                  : "bg-gray-900 text-white hover:bg-orange-600 shadow-lg shadow-gray-200"}
                              `}
                            >
                               Select Now
                               <ArrowRight size={14} />
                            </button>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
               ) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-gray-100 shadow-inner">
                     <Package className="mx-auto mb-4 text-gray-200 w-12 h-12 sm:w-16 sm:h-16" />
                     <p className="text-gray-400 font-extrabold uppercase tracking-widest text-xs sm:text-base">Refreshing Package Inventory</p>
                  </div>
               )}
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
                    className="relative bg-white w-full max-w-xl rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden p-6 sm:p-12 border border-gray-100 max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-start mb-6 sm:mb-8">
                      <div>
                         <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg mb-2 inline-block">
                           Step {checkoutStep} of 2
                         </span>
                         <h2 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">
                           {checkoutStep === 1 ? "Delivery Details 🚚" : "Payment 💳"}
                         </h2>
                      </div>
                      <button 
                        onClick={() => setSelectedPlan(null)}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 transition-all font-bold"
                      >
                         ✕
                      </button>
                    </div>

                    {checkoutStep === 1 ? (
                      <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
                        <div className="space-y-2">
                          <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                          <input 
                            type="text"
                            value={deliveryInfo.name}
                            onChange={(e) => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                            placeholder="Receiver's full name"
                            className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-800"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">H.No / Colony</label>
                              <input 
                              type="text"
                              value={deliveryInfo.houseNo}
                              onChange={(e) => setDeliveryInfo({...deliveryInfo, houseNo: e.target.value})}
                              placeholder="e.g. 102, Green City"
                              className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-800"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                              <input 
                              type="text"
                              maxLength={6}
                              value={deliveryInfo.pincode}
                              onChange={(e) => setDeliveryInfo({...deliveryInfo, pincode: e.target.value})}
                              placeholder="6 Digit PIN"
                              className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-800"
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Area / Landmark</label>
                          <textarea 
                            rows={3}
                            value={deliveryInfo.area}
                            onChange={(e) => setDeliveryInfo({...deliveryInfo, area: e.target.value})}
                            placeholder="Nearby landmark or area name"
                            className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-800 resize-none"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            if (!deliveryInfo.name.trim() || !deliveryInfo.houseNo.trim() || !deliveryInfo.area.trim()) {
                              toast.error("Please fill in all delivery details");
                              return;
                            }
                            setCheckoutStep(2);
                          }}
                          className="w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-gray-900 text-white font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2 active:scale-95"
                        >
                           Proceed to Payment <ArrowRight size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10 bg-gray-50 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 border border-gray-100">
                           <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-gray-200/50">
                              <span className="text-gray-400 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest">Item</span>
                              <span className="text-lg sm:text-xl font-black text-gray-900">{selectedPlan.name}</span>
                           </div>
                           <div className="flex flex-col gap-1 pb-3 sm:pb-4 border-b border-gray-200/50">
                              <span className="text-gray-400 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest">Deliver To</span>
                              <span className="text-gray-800 font-black text-sm">{deliveryInfo.name}</span>
                              <span className="text-gray-500 text-[9px] font-bold italic line-clamp-1">{deliveryInfo.houseNo}, {deliveryInfo.area} - {deliveryInfo.pincode}</span>
                           </div>
                           <div className="flex justify-between items-center pt-2">
                              <span className="text-orange-600 font-black uppercase text-[11px] sm:text-sm tracking-widest">Amount</span>
                              <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter">₹{selectedPlan.price}</span>
                           </div>
                        </div>

                        <div className="flex gap-3 sm:gap-4">
                           <button 
                            onClick={() => setCheckoutStep(1)}
                            className="flex-1 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-gray-50 text-gray-400 font-black uppercase text-[9px] sm:text-[10px] tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                           >
                              Back
                           </button>
                           <button 
                            onClick={confirmPurchase}
                            disabled={loading}
                            className="flex-[2] py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-orange-600 text-white font-black uppercase text-[9px] sm:text-[10px] tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 flex items-center justify-center gap-2 group/btn active:scale-95"
                           >
                              {loading ? "..." : "Pay Now"}
                              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                           </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      
      {/* ================= AI CHATBOT MODAL ================= */}
      <AnimatePresence>
        {chatOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-end p-2 sm:p-10 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] pointer-events-auto"
              onClick={() => setChatOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="relative w-full sm:max-w-lg bg-white rounded-t-[2rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden pointer-events-auto border border-gray-100 h-[80vh] sm:h-[600px]"
            >
              {/* Header */}
              <div className="bg-gray-900 p-6 sm:p-8 text-white flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-black tracking-tight">Chef Assistant</h4>
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-green-400">Online Now</span>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <CloseIcon size={18} />
                </button>
              </div>

              {/* Messages */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-6 bg-[#FAFCFF]"
                style={{ scrollbarWidth: 'none' }}
              >
                {messages.map((m, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2 sm:gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0
                      ${m.role === 'user' ? 'bg-orange-500 text-white' : 'bg-white text-gray-900 border border-gray-100 shadow-sm'}`}
                    >
                      {m.role === 'user' ? <UserIcon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" /> : <Bot className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />}
                    </div>
                    <div className={`max-w-[85%] sm:max-w-[75%] p-3 sm:p-4 rounded-xl sm:rounded-[1.5rem] text-[13px] sm:text-sm font-bold leading-relaxed
                      ${m.role === 'user' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none shadow-sm'}`}
                    >
                      {m.content}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 sm:p-8 bg-white border-t border-gray-50">
                <div className="relative flex items-center">
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="w-full pl-5 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={chatLoading}
                    className="absolute right-2 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-50 shadow-blue-500/20 shadow-lg"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= SUCCESS CELEBRATION MODAL ================= */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl"
            />
            
            <SuccessCelebration />

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 sm:p-16 text-center shadow-2xl border border-white/20"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                className="w-24 h-24 sm:w-32 sm:h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 sm:mb-12 shadow-lg shadow-green-500/30"
              >
                 <CheckCircle2 size={64} className="text-white" />
              </motion.div>

              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter mb-4 uppercase">
                Payment <span className="text-green-600">Successful!</span>
              </h2>
              
              <div className="w-16 h-1.5 bg-orange-500 mx-auto rounded-full mb-8"></div>

              <p className="text-gray-500 text-lg sm:text-xl font-bold leading-relaxed mb-12 opacity-80">
                Congratulations! You have successfully subscribed to your new plan. Your premium home-style gourmet experience starts now.
              </p>

              <button 
                onClick={() => {
                  setShowSuccess(false);
                  fetchPlan(); // Refresh the plan data
                }}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs sm:text-sm tracking-[0.3em] overflow-hidden relative group active:scale-95 shadow-xl hover:shadow-orange-200 transition-all"
              >
                <div className="absolute inset-0 bg-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Back to Dashboard <ArrowRight size={18} />
                </span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
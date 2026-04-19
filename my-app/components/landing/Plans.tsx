"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, Star, Zap, ShieldCheck, ArrowRight } from "lucide-react";

export default function Plans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/customer/plans");
        const data = await res.json();
        setPlans(data.plans || []);
      } catch (err) {
        console.error("Failed to fetch landing plans");
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const handleChoice = (plan: any) => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || !user.name) {
      sessionStorage.setItem("pendingPlan", JSON.stringify(plan));
      window.location.href = "/login?redirect=purchase";
    } else {
      sessionStorage.setItem("pendingPlan", JSON.stringify(plan));
      window.location.href = "/customer/dashboard/plan";
    }
  };

  return (
    <section id="plans" className="w-full bg-[#FAFBFF] py-16 sm:py-24 relative overflow-hidden">
      <div className="hidden sm:block absolute top-0 right-0 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-[100px] -mr-48 -mt-24"></div>
      <div className="hidden sm:block absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-50/50 rounded-full blur-[100px] -ml-48 -mb-24"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-widest mb-4 border border-orange-100/50">
            <Star size={12} fill="currentColor" />
            Pricing Packages
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight">
            Tailored <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Plans</span> for You
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            Experience premium tiffin service with flexible subscriptions. No hidden fees, just pure taste delivered to your doorstep.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="h-16 w-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
              <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" size={20} />
            </div>
            <p className="mt-4 text-gray-400 font-extrabold text-xs tracking-widest uppercase animate-pulse">Loading plans...</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            <AnimatePresence>
              {plans.map((plan, idx) => (
                <PlanCard
                  key={plan._id || plan.id}
                  idx={idx}
                  plan={plan}
                  onSelect={() => handleChoice(plan)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Trusted Footer */}
        <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-50">
          <div className="flex items-center gap-2 font-black text-sm sm:text-lg italic">
            <ShieldCheck size={22} className="text-orange-500" /> ISO CERTIFIED
          </div>
          <div className="flex items-center gap-2 font-black text-sm sm:text-lg italic">
            <span className="text-orange-500 font-black text-xl">₹</span> SECURE PAY
          </div>
          <div className="flex items-center gap-2 font-black text-sm sm:text-lg italic">
            <Flame size={22} className="text-orange-500" /> HOT DELIVERY
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- PLAN CARD ---------------- */
function PlanCard({ plan, onSelect, idx }: { plan: any, onSelect: () => void, idx: number }) {
  const isPopular = plan.tag?.toLowerCase().includes("popular") || plan.tag?.toLowerCase().includes("best") || idx === 1;
  const image = idx === 0 ? "/img3.webp" : (idx === 1 ? "/img4.webp" : "/img5.webp");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1, duration: 0.5 }}
      className={`
        relative rounded-[2rem] sm:rounded-[3rem] transition-all duration-500 flex flex-col h-full
        ${isPopular 
          ? "bg-gray-900 text-white shadow-[0_20px_40px_-10px_rgba(255,100,0,0.25)] border-2 border-orange-500" 
          : "bg-white border border-gray-100 shadow-lg hover:shadow-xl"}
      `}
    >
      {/* POPULAR BADGE */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2 rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-lg tracking-widest uppercase whitespace-nowrap">
          <Flame size={13} fill="white" className="animate-pulse" />
          {plan.tag?.toUpperCase() || "Most Popular"}
        </div>
      )}

      {/* IMAGE */}
      <div className="p-3 sm:p-4">
        <div className="relative w-full h-44 sm:h-56 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden">
          <Image
            src={image}
            alt={plan.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase text-white border border-white/10">
                {plan.duration} Days
              </span>
              <span className="px-2.5 py-1 bg-orange-500 rounded-lg text-[10px] font-black uppercase text-white">
                Hot Thali
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{plan.name}</h3>
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-8 pb-6 sm:pb-10 flex flex-col flex-1">
        {/* PRICING */}
        <div className="my-5 sm:my-8 flex flex-col">
          <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isPopular ? "text-orange-400" : "text-gray-400"}`}>Starting from</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl sm:text-5xl font-black tracking-tighter ${isPopular ? "text-white" : "text-gray-900"}`}>
              ₹{plan.price}
            </span>
            <span className={`text-xs font-bold uppercase tracking-widest ${isPopular ? "text-gray-500" : "text-gray-400"}`}>
              / cycle
            </span>
          </div>
        </div>

        {/* FEATURES */}
        <div className={`mb-6 sm:mb-10 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex-1 ${isPopular ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-100"}`}>
          <ul className="space-y-3 sm:space-y-4">
            {[
              `${plan.mealsPerDay} Premium Meals Daily`,
              `${plan.duration} Days Regular Delivery`,
              "Home-Style Kitchen Prep",
              "Advanced Pause/Cancel",
              "Eco-Friendly Packaging"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className={`shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${isPopular ? "bg-orange-500 text-white" : "bg-green-500 text-white"}`}>
                  <Check size={12} strokeWidth={4} />
                </div>
                <span className={`text-xs sm:text-sm font-bold ${isPopular ? "text-gray-300" : "text-gray-600"}`}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Button */}
        <button
          onClick={onSelect}
          className={`
            w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95
            ${isPopular 
              ? "bg-white text-gray-900 hover:bg-orange-500 hover:text-white" 
              : "bg-gray-900 text-white hover:bg-orange-600"}
          `}
        >
          Book Now
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, ChefHat, Sparkles, Package, AlertTriangle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface MealData {
  type: string;
  items: string;
  deliveryTime: string;
  status: string;
}

interface MealHeroProps {
  meal?: MealData;
  dinner?: MealData;
}

// IST cutoff: 10:00 AM
const CANCEL_CUTOFF_HOUR_IST = 10;

function getISTMinutes(): number {
  const nowUTC = new Date();
  const nowIST = new Date(nowUTC.getTime() + (5 * 60 + 30) * 60 * 1000);
  return nowIST.getUTCHours() * 60 + nowIST.getUTCMinutes();
}

// ============================================================
export default function MealHero({ meal, dinner }: MealHeroProps) {
  const lunchData = meal || {
    type: "Lunch",
    items: "4 Butter Roti, Paneer Makhani, Dal Tadka, Jeera Rice, Gulab Jamun",
    deliveryTime: "01:00 PM",
    status: "Out for Delivery",
  };

  const dinnerData = dinner || {
    type: "Dinner",
    items: "4 Roti, Veg Gravy, Dal, Rice, Salad",
    deliveryTime: "08:00 PM",
    status: "Scheduled",
  };

  const isKitchenClosed = lunchData.status?.includes("Closed") || dinnerData.status?.includes("Closed");

  // --- State ---
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason]       = useState("");
  const [cancelLoading, setCancelLoading]     = useState(false);
  const [cancelMsg, setCancelMsg]             = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isCancelledToday, setIsCancelledToday] = useState(false);

  // Is it before 10 AM IST?
  const canCancel = getISTMinutes() < CANCEL_CUTOFF_HOUR_IST * 60;
  const minutesLeft = CANCEL_CUTOFF_HOUR_IST * 60 - getISTMinutes();
  const hoursLeft = Math.floor(minutesLeft / 60);
  const minsLeft  = minutesLeft % 60;
  const cutoffLabel = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m left` : `${minsLeft}m left`;

  // ---- Cancel Meal ----
  async function handleCancelMeal() {
    setCancelLoading(true);
    setCancelMsg(null);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.email) {
        setCancelMsg({ type: "error", text: "Please log in first." });
        return;
      }

      const res  = await fetch("/api/customer/cancel-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, reason: cancelReason }),
      });
      const data = await res.json();

      if (data.success) {
        setCancelMsg({ type: "success", text: "✅ Meal cancelled successfully for today!" });
        setIsCancelledToday(true);
        setTimeout(() => setShowCancelModal(false), 1800);
      } else {
        setCancelMsg({ type: "error", text: data.error || "Something went wrong." });
      }
    } catch (error: any) {
      setCancelMsg({ type: "error", text: error.message });
    } finally {
      setCancelLoading(false);
    }
  }

  // ============================================================
  return (
    <>
      {/* ---- MAIN CARD ---- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[3xl] p-6 lg:px-10 lg:py-8 shadow-xl overflow-hidden min-h-[300px] flex flex-col justify-center"
        style={{
          backgroundColor: "#050505",
          backgroundImage:
            "radial-gradient(at 100% 0%, rgba(255, 100, 0, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(255, 50, 0, 0.1) 0px, transparent 50%)",
        }}
      >
        {/* Grid Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Orb */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-20 w-[600px] h-[600px] bg-orange-600 rounded-full blur-[120px] pointer-events-none"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 h-full">
          {/* Left Block - Meals info */}
          <div className="space-y-6 sm:space-y-8 w-full max-w-xl">
            
            {/* Lunch Row */}
            <div className="space-y-3">
               {/* Badges */}
               <div className="flex flex-wrap items-center gap-2">
                  <motion.div className="px-2.5 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-md flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#ff6a00] animate-pulse" />
                     <span className="text-orange-400 text-[8px] sm:text-[10px] font-black tracking-widest uppercase">
                       {isCancelledToday ? "Meal Cancelled ❌" : lunchData.status}
                     </span>
                  </motion.div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-[9px] sm:text-xs font-semibold tracking-wider bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                     <Clock size={10} className="text-gray-300" />
                     {lunchData.deliveryTime}
                  </div>
               </div>
               
               <div>
                  <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 leading-tight mb-1 uppercase tracking-tight">Today&apos;s Lunch</h2>
                  <p className="text-gray-400 text-[10px] sm:text-sm leading-relaxed font-medium">
                    {isCancelledToday ? "You have cancelled today's meal. See you tomorrow! 🙏" : lunchData.items}
                  </p>
               </div>
            </div>

            {/* Separator */}
            <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

            {/* Dinner Row */}
            <div className="space-y-3">
               <div className="flex flex-wrap items-center gap-2">
                  <motion.div className="px-2.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse" />
                     <span className="text-indigo-400 text-[8px] sm:text-[10px] font-black tracking-widest uppercase">{dinnerData.status}</span>
                  </motion.div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-[9px] sm:text-xs font-semibold tracking-wider bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                     <Clock size={10} className="text-gray-300" />
                     {dinnerData.deliveryTime}
                  </div>
               </div>
               
               <div>
                  <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-400 leading-tight mb-1 uppercase tracking-tight">Today&apos;s Dinner</h2>
                  <p className="text-gray-400 text-[10px] sm:text-sm leading-relaxed font-medium">
                    {dinnerData.items}
                  </p>
               </div>
            </div>

            {/* Action Row */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              {isKitchenClosed ? (
                <div className="flex items-center gap-2 bg-gray-500/10 border border-gray-500/20 px-6 py-3.5 rounded-2xl">
                  <span className="text-gray-400 text-sm font-black uppercase tracking-widest">Kitchen Closed Today</span>
                </div>
              ) : lunchData.status.includes("Paused") ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                   <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-6 py-3.5 rounded-2xl">
                      <span className="text-orange-400 text-sm font-black uppercase tracking-widest">Service Paused</span>
                   </div>
                </div>
              ) : (
                <>
                  {canCancel && !isCancelledToday && (
                    <button
                      onClick={() => { setShowCancelModal(true); setCancelMsg(null); setCancelReason(""); }}
                      className="flex items-center gap-2 bg-transparent text-gray-400 border border-gray-700 text-[10px] sm:text-xs font-black uppercase tracking-widest px-7 py-3.5 rounded-2xl hover:text-white hover:border-red-500 hover:bg-red-500/10 transition-all active:scale-95"
                    >
                      <X size={16} />
                      Cancel Today&apos;s Meals
                    </button>
                  )}

                  {!canCancel && !isCancelledToday && (
                    <span className="flex items-center gap-2 text-gray-600 text-[10px] font-black uppercase tracking-widest border border-gray-800 px-5 py-3.5 rounded-2xl">
                      <AlertTriangle size={14} /> Cancel window closed (after 10 AM)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring" as const, stiffness: 80 }}
            className="hidden md:flex relative items-center justify-center p-6 lg:p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 rounded-full blur-xl border border-white/10" />
            <div className="absolute inset-4 border border-orange-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="relative z-10 bg-black/40 p-5 rounded-[2rem] border border-gray-800 backdrop-blur-2xl shadow-2xl">
              <ChefHat size={50} className="text-orange-500 drop-shadow-[0_0_15px_rgba(255,100,0,0.8)]" />
              <Sparkles size={18} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* CANCEL MEAL MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: "spring" as const, stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-3xl p-6 sm:p-8 w-full max-w-sm border border-gray-800 shadow-2xl"
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <AlertTriangle size={32} className="text-red-400" />
                </div>
              </div>

              <h3 className="text-xl font-black text-white text-center mb-1">Cancel Today&apos;s Meal?</h3>
              <p className="text-gray-400 text-xs text-center mb-5">
                You can only cancel before <span className="text-orange-400 font-bold">10:00 AM IST</span>.
                {canCancel && <span className="block text-yellow-400 font-bold mt-1">⏰ {cutoffLabel} remaining</span>}
              </p>

              {/* Reason textarea */}
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)..."
                rows={3}
                className="w-full bg-white/5 border border-gray-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-orange-500 transition mb-4"
              />

              {/* Message */}
              {cancelMsg && (
                <div
                  className={`text-xs font-bold px-4 py-2.5 rounded-xl mb-4 text-center ${
                    cancelMsg.type === "success"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {cancelMsg.text}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-700 text-gray-300 text-sm font-bold hover:bg-white/5 transition"
                >
                  Keep Meal
                </button>
                <button
                  onClick={handleCancelMeal}
                  disabled={cancelLoading}
                  className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelLoading ? "Cancelling…" : "Yes, Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

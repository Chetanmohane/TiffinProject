"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Navigation2, X, ChefHat, Sparkles, MapPin, CheckCircle2, Bike, Package, Home, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface MealHeroProps {
  meal?: {
    type: string;
    items: string;
    deliveryTime: string;
    status: string;
  };
}

// ---- Delivery Tracking Types ----
interface DeliveryInfo {
  id: string | null;
  status: string;
  type: string;
  targetTime: string;
  date: string;
  currentStep: number;
  customerName: string;
  address: string;
}

const TRACKING_STEPS = [
  { label: "Order Placed",      icon: Package,      desc: "Your meal order has been placed." },
  { label: "Out for Delivery",  icon: Bike,         desc: "Your tiffin is on the way!" },
  { label: "Delivered",         icon: Home,         desc: "Meal delivered. Enjoy your food! 🍽️" },
  { label: "Cancelled",         icon: X,            desc: "This delivery was cancelled." },
];

// IST cutoff: 10:00 AM
const CANCEL_CUTOFF_HOUR_IST = 10;

function getISTHour(): number {
  const nowUTC = new Date();
  const nowIST = new Date(nowUTC.getTime() + (5 * 60 + 30) * 60 * 1000);
  return nowIST.getUTCHours();
}
function getISTMinutes(): number {
  const nowUTC = new Date();
  const nowIST = new Date(nowUTC.getTime() + (5 * 60 + 30) * 60 * 1000);
  return nowIST.getUTCHours() * 60 + nowIST.getUTCMinutes();
}

// ============================================================
export default function MealHero({ meal }: MealHeroProps) {
  const data = meal || {
    type: "Premium Lunch",
    items: "4 Butter Roti, Paneer Makhani, Dal Tadka, Jeera Rice, Gulab Jamun",
    deliveryTime: "01:00 PM",
    status: "Out for Delivery",
  };

  // --- State ---
  const [showTrackModal, setShowTrackModal]   = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [deliveryInfo, setDeliveryInfo]       = useState<DeliveryInfo | null>(null);
  const [trackLoading, setTrackLoading]       = useState(false);
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

  // ---- Fetch Delivery Info ----
  async function fetchDelivery() {
    setTrackLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.email) { setTrackLoading(false); return; }

      const res  = await fetch(`/api/customer/delivery?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        setDeliveryInfo(data.delivery);
        if (data.delivery.status === "Cancelled") setIsCancelledToday(true);
      }
    } catch (e) {
      console.error("Track order fetch error", e);
    } finally {
      setTrackLoading(false);
    }
  }

  function openTrackModal() {
    setShowTrackModal(true);
    fetchDelivery();
  }

  // Auto-refresh every 30s when modal is open
  useEffect(() => {
    if (!showTrackModal) return;
    const interval = setInterval(fetchDelivery, 30_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTrackModal]);

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
    } catch (e: any) {
      setCancelMsg({ type: "error", text: e.message });
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
        className="relative rounded-[2rem] sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl overflow-hidden h-full flex flex-col justify-center"
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

        {/* Conte         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 h-full">
          {/* Left Block */}
          <div className="space-y-3 sm:space-y-4 max-w-xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="px-2.5 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-md flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#ff6a00] animate-pulse" />
                <span className="text-orange-400 text-[8px] sm:text-[10px] font-black tracking-widest uppercase">
                  {isCancelledToday ? "Meal Cancelled ❌" : data.status}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-1.5 text-gray-400 text-[9px] sm:text-xs font-semibold tracking-wider bg-white/5 px-2.5 py-1 rounded-full border border-white/5"
              >
                <Clock size={10} className="text-gray-300" />
                {data.deliveryTime}
              </motion.div>

              {canCancel && !isCancelledToday && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-1.5 text-yellow-400 text-[8px] font-black tracking-wider bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20"
                >
                  ⏰ Cutoff: 10 AM
                </motion.div>
              )}
            </div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 leading-tight mb-1">
                Today&apos;s {data.type}
              </h2>
              <p className="text-gray-400 text-[10px] sm:text-sm leading-relaxed font-medium line-clamp-2">
                {isCancelledToday
                  ? "You have cancelled today's meal. See you tomorrow! 🙏"
                  : data.items}
              </p>
            </motion.div>    </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-3 pt-4"
            >
              {data.status.includes("Paused") ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                   <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-6 py-3.5 rounded-2xl">
                      <span className="text-orange-400 text-sm font-black uppercase tracking-widest">Service Paused</span>
                   </div>
                   <Link 
                     href="/customer/pause-meal" 
                     className="text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest underline decoration-orange-500 underline-offset-4"
                   >
                     Manage Pause Period
                   </Link>
                </div>
              ) : (
                <>
                  {/* Track Order Button */}
                  <button
                    onClick={openTrackModal}
                    className="group relative flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-7 py-3.5 rounded-2xl shadow-[0_4px_20px_rgba(255,100,0,0.3)] hover:shadow-[0_4px_30px_rgba(255,100,0,0.5)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <Navigation2 size={18} className="relative z-10" />
                    <span className="relative z-10">Track Order</span>
                  </button>

                  {/* Cancel Meal Button — only visible before 10 AM and not already cancelled */}
                  {canCancel && !isCancelledToday && (
                    <button
                      onClick={() => { setShowCancelModal(true); setCancelMsg(null); setCancelReason(""); }}
                      className="flex items-center gap-2 bg-transparent text-gray-400 border border-gray-700 text-sm font-bold px-7 py-3.5 rounded-2xl hover:text-white hover:border-red-500 hover:bg-red-500/10 transition-all active:scale-95"
                    >
                      <X size={18} />
                      Cancel Meal
                    </button>
                  )}

                  {/* Already Cancelled badge */}
                  {isCancelledToday && (
                    <span className="flex items-center gap-2 text-red-400 text-sm font-bold border border-red-500/30 bg-red-500/10 px-5 py-3.5 rounded-2xl">
                      <X size={16} /> Meal Cancelled Today
                    </span>
                  )}

                  {/* After cutoff — show info */}
                  {!canCancel && !isCancelledToday && (
                    <span className="flex items-center gap-2 text-gray-600 text-xs font-bold border border-gray-800 px-5 py-3.5 rounded-2xl">
                      <AlertTriangle size={14} /> Cancel window closed (after 10 AM)
                    </span>
                  )}
                </>
              )}
            </motion.div>
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
      {/* TRACK ORDER MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showTrackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTrackModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: "spring" as const, stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-3xl p-6 sm:p-8 w-full max-w-md border border-gray-800 shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-white">Track Your Order</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Live delivery status</p>
                </div>
                <button
                  onClick={() => setShowTrackModal(false)}
                  className="text-gray-500 hover:text-white transition p-2 rounded-xl hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              {trackLoading ? (
                <div className="flex flex-col items-center gap-3 py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-100 border-t-orange-500" />
                  <p className="text-gray-400 text-sm">Fetching delivery status…</p>
                </div>
              ) : deliveryInfo ? (
                <>
                  {/* Address */}
                  <div className="flex items-start gap-3 bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
                    <MapPin size={18} className="text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-300 text-sm font-semibold">{deliveryInfo.customerName}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{deliveryInfo.address}</p>
                    </div>
                  </div>

                  {/* ETA */}
                  <div className="flex items-center gap-2 mb-6">
                    <Clock size={14} className="text-orange-400" />
                    <span className="text-gray-300 text-sm font-bold">ETA: {deliveryInfo.targetTime}</span>
                    <span className="ml-auto text-[10px] bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                      {deliveryInfo.type}
                    </span>
                  </div>

                  {/* Progress Steps */}
                  <div className="space-y-1">
                    {TRACKING_STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      // For cancelled: only show step 0 (placed) and the cancelled step
                      if (deliveryInfo.status === "Cancelled" && idx === 1) return null;
                      if (deliveryInfo.status === "Cancelled" && idx === 2) return null;

                      const isActive   = idx === deliveryInfo.currentStep;
                      const isDone     = idx < deliveryInfo.currentStep;
                      const isCancFinal = deliveryInfo.status === "Cancelled" && idx === 3;

                      return (
                        <div key={idx} className="flex items-start gap-4">
                          {/* Icon column */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all
                                ${isCancFinal ? "bg-red-500/20 border-red-500 text-red-400"
                                  : isActive  ? "bg-orange-500 border-orange-400 text-white shadow-[0_0_12px_rgba(255,100,0,0.5)]"
                                  : isDone    ? "bg-green-500/20 border-green-500 text-green-400"
                                              : "bg-white/5 border-gray-700 text-gray-600"}`}
                            >
                              {isDone ? (
                                <CheckCircle2 size={16} />
                              ) : (
                                <Icon size={16} />
                              )}
                            </div>
                            {idx < TRACKING_STEPS.length - 1 &&
                              !(deliveryInfo.status === "Cancelled" && (idx === 1 || idx === 2)) && (
                                <div
                                  className={`w-0.5 h-8 mt-1 rounded-full transition-all
                                    ${isDone ? "bg-green-500" : "bg-gray-800"}`}
                                />
                              )}
                          </div>

                          {/* Label column */}
                          <div className="pb-6">
                            <p className={`text-sm font-bold ${isActive || isCancFinal ? "text-white" : isDone ? "text-green-400" : "text-gray-600"}`}>
                              {step.label}
                            </p>
                            {(isActive || isCancFinal) && (
                              <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Auto-refresh note */}
                  <p className="text-center text-[10px] text-gray-600 mt-2">
                    🔄 Auto-refreshes every 30 seconds
                  </p>
                </>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">No delivery record found for today.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

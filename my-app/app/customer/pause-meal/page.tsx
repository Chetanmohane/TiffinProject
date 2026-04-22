"use client";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type PauseItem = {
  from: string;
  to: string;
  reason: string;
};

export default function PauseMealPage() {
  const router = useRouter();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [pausedList, setPausedList] = useState<PauseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActivePlan, setHasActivePlan] = useState(true);
  const [planStartDate, setPlanStartDate] = useState("");
  const [planEndDate, setPlanEndDate] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const name = user.name || "Chetan";
    const email = user.email || "";
    const query = email ? `email=${encodeURIComponent(email)}` : `name=${encodeURIComponent(name)}`;
    
    fetch(`/api/customer/pause-meal?${query}`)
      .then(res => res.json())
      .then(data => {
        setPausedList(data.pausedList || []);
        setHasActivePlan(data.hasActivePlan);
        setPlanStartDate(data.planStartDate || "");
        setPlanEndDate(data.planEndDate || "");
        setLoading(false);
      });
  }, []);

  const pauseMeal = async () => {
    if (!hasActivePlan) {
      toast.error("You don't have any active plan. Please buy a plan to pause your meals.");
      return;
    }
    if (!fromDate || !toDate || !reason) {
      toast.error("Please select From Date, To Date and a Reason.");
      return;
    }
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const name = user.name || "Chetan";
    const email = user.email || "";
    
    const newItem = { from: fromDate, to: toDate, reason };
    
    const res = await fetch("/api/customer/pause-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", item: newItem, name, email })
    });
    
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || "Failed to pause meal.");
      return;
    }

    // Refresh list
    setPausedList(result.pausedList || []);
    
    toast.success("Meal paused successfully");
    setFromDate(""); setToDate(""); setReason("");
  };

  const resumeMeal = async (item: any) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const name = user.name || "Chetan";
    const email = user.email || "";
    
    await fetch("/api/customer/pause-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", id: item.id, name, email })
    });
    
    // Refresh list
    const query = email ? `email=${encodeURIComponent(email)}` : `name=${encodeURIComponent(name)}`;
    const res = await fetch(`/api/customer/pause-meal?${query}`);
    const data = await res.json();
    setPausedList(data.pausedList || []);
    
    toast.success("Meal resumed");
  };

  const today = new Date().toISOString().split("T")[0];
  const minFromDate = planStartDate && planStartDate > today ? planStartDate : today;
  const maxToDate = planEndDate || undefined;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-5 sm:p-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-all mb-6 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Pause Meal 🍽️</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Pause your tiffin delivery for selected dates.
          {planStartDate && planEndDate && (
             <span className="block mt-2 font-bold text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-100">
               ⚠️ You can only pause between your active plan dates: {planStartDate} to {planEndDate}
             </span>
          )}
        </p>

        {!hasActivePlan && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-red-600">
                You don&apos;t have any active plan.
              </p>
              <p className="text-[10px] sm:text-xs text-red-500 mt-0.5">
                Please <a href="/customer/dashboard/plan" className="underline font-black hover:text-red-700">buy a plan here</a> to enable the Pause Meal feature.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">From Date</label>
              <input type="date" min={minFromDate} max={maxToDate} value={fromDate} onChange={(e) => setFromDate(e.target.value)} disabled={!hasActivePlan} className="mt-1 w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none disabled:opacity-50" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">To Date</label>
              <input type="date" min={fromDate || minFromDate} max={maxToDate} value={toDate} onChange={(e) => setToDate(e.target.value)} disabled={!hasActivePlan} className="mt-1 w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none disabled:opacity-50" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} disabled={!hasActivePlan} className="mt-1 w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none disabled:opacity-50">
              <option value="">Select reason</option>
              <option>Vacation</option>
              <option>Out of Station</option>
              <option>Medical</option>
              <option>Personal</option>
            </select>
          </div>
          <button 
            onClick={pauseMeal} 
            disabled={!hasActivePlan}
            className={`w-full py-2.5 rounded-lg font-semibold transition ${!hasActivePlan ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
          >
            Pause Meal
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3">Paused Periods</h2>
          {pausedList.length === 0 && (
            <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">No paused meals</p>
          )}
          <div className="space-y-3">
            {pausedList.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-xl p-4 bg-gray-50">
                <div>
                  <p className="font-medium text-sm sm:text-base">{item.from} → {item.to}</p>
                  <span className="text-xs sm:text-sm text-gray-600">Reason: {item.reason}</span>
                </div>
                <button onClick={() => resumeMeal(item)} className="text-sm text-green-600 font-semibold hover:underline self-start sm:self-auto">
                  Resume
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

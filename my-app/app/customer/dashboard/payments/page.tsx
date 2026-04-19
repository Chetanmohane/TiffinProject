"use client";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { CreditCard, History, Wallet, Sparkles, Loader2, IndianRupee } from "lucide-react";

export default function PaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const currentUser = userStr ? JSON.parse(userStr) : null;
    setUser(currentUser);
    fetchData(currentUser);
  }, []);

  const fetchData = async (currentUser: any) => {
    try {
      setLoading(true);
      const emailQuery = currentUser?.email ? `?email=${encodeURIComponent(currentUser.email)}` : "";
      const res = await fetch(`/api/customer/payments${emailQuery}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (amount: number | string) => {
    const finalAmount = Number(amount);
    if (!finalAmount || finalAmount <= 0) {
      toast.success("Please enter a valid amount");
      return;
    }

    try {
      setProcessing(true);
      const res = await fetch("/api/customer/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          email: user?.email,
          name: user?.name
        })
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`Successfully recharged ₹${finalAmount}!`);
        setRechargeAmount("");
        fetchData(user);
        // Trigger global wallet update event
        window.dispatchEvent(new Event("walletUpdate"));
      } else {
        toast.error(result.error || "Recharge failed");
      }
    } catch (error) {
      console.error("Recharge error:", error);
      toast.success("Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-100 border-t-orange-500"></div>
          <p className="text-sm font-bold text-gray-500">Fetching wallet details...</p>
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-3xl border border-red-100">
          <p className="text-red-500 font-bold">{data.error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl font-bold">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             My Wallet <Wallet className="text-orange-500" />
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">Manage your balance and view transaction history</p>
        </div>        <div className="grid grid-cols-1 gap-8 mb-10">
          {/* Status Card */}
          <div className="relative rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl shadow-orange-200/50 overflow-hidden bg-gradient-to-br from-orange-500 to-red-500">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <Sparkles size={16} />
                  <p className="text-xs sm:text-sm font-black uppercase tracking-widest">Payment Support</p>
                </div>
                <h2 className="text-4xl sm:text-5xl font-black mt-2 tracking-tighter">
                  Direct Payments Enabled
                </h2>
                <p className="mt-4 text-white/80 font-bold max-w-md">All your subscriptions are now processed directly via secure payment gateways for instant activation.</p>
              </div>
              <div className="flex flex-col items-center sm:items-end">
                 <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 mb-4">
                    <CreditCard size={32} />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest bg-white text-orange-600 px-4 py-2 rounded-full shadow-lg">Secure Gateway</span>
              </div>
            </div>
            
            {/* Design Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
            <div className="flex items-center gap-3 text-gray-800">
              <div className="bg-gray-100 p-2 rounded-xl">
                 <History size={18} />
              </div>
              <h3 className="font-black tracking-tight uppercase text-sm">Wallet History</h3>
            </div>
            <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">Live Updates</span>
          </div>

          <div className="divide-y divide-gray-50">
            {data?.history?.length > 0 ? (
              data.history.map((row: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-8 py-5 gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${row.type === "Credit" ? "bg-green-100 text-green-600" : "bg-orange-50 text-orange-600"}`}>
                      {row.type === "Credit" ? "↓" : "↑"}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">{row.desc}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">{row.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                    <p className={`font-black text-base sm:text-lg ${row.type === "Credit" ? "text-green-600" : "text-gray-900"}`}>
                      {row.amt}
                    </p>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${row.status === "Success" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {row.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                   <History size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-bold">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

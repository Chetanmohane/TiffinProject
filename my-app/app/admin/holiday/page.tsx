"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Calendar, Plus, Trash2, ShieldAlert, Zap } from "lucide-react";

export default function AdminHolidayPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newHoliday, setNewHoliday] = useState({
    title: "",
    startDate: "",
    endDate: "",
    reason: ""
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/holiday");
    const data = await res.json();
    setHolidays(data.holidays || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newHoliday.title || !newHoliday.startDate || !newHoliday.endDate) {
      toast.error("Please fill all required fields");
      return;
    }
    
    toast.loading("🛎️ Declaring Holiday & Extending All Plans...", { id: "holiday" });
    
    try {
      const res = await fetch("/api/admin/holiday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", holiday: newHoliday })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message, { id: "holiday" });
        setIsAdding(false);
        setNewHoliday({ title: "", startDate: "", endDate: "", reason: "" });
        fetchHolidays();
      } else {
        toast.error(data.error, { id: "holiday" });
      }
    } catch (e) {
      toast.error("Failed to add holiday", { id: "holiday" });
    }
  };

  const [holidayToDelete, setHolidayToDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setHolidayToDelete(null);
    toast.loading("🔄 Reverting Holiday Extensions...", { id: "revert" });
    
    try {
      const res = await fetch("/api/admin/holiday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message, { id: "revert" });
        fetchHolidays();
      } else {
        toast.error(data.error, { id: "revert" });
      }
    } catch (e) {
      toast.error("Failed to delete holiday", { id: "revert" });
    }
  };

  if (loading) {
     return <div className="p-20 text-center animate-pulse font-black text-gray-400">LOADING HOLIDAY CONFIG...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Calendar size={32} className="text-orange-500" />
              Service Holidays
            </h1>
            <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest">
              Manage global service pauses and plan extensions
            </p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95"
          >
            {isAdding ? "Cancel" : <><Plus size={16} /> Declare Holiday</>}
          </button>
        </div>

        {/* ADD FORM */}
        {isAdding && (
          <div className="mb-10 bg-white p-8 rounded-[2.5rem] border border-orange-100 shadow-xl shadow-orange-900/5 animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="flex items-center gap-3 mb-6 text-orange-600">
                <Zap size={20} fill="currentColor" />
                <h3 className="font-black uppercase text-sm tracking-tight">Holiday Declaration</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Event Title (e.g. Diwali Break)</label>
                  <input 
                    value={newHoliday.title}
                    onChange={(e) => setNewHoliday({...newHoliday, title: e.target.value})}
                    placeholder="Enter holiday name..."
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Start Date</label>
                  <input 
                    type="date"
                    value={newHoliday.startDate}
                    onChange={(e) => setNewHoliday({...newHoliday, startDate: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">End Date</label>
                  <input 
                    type="date"
                    value={newHoliday.endDate}
                    onChange={(e) => setNewHoliday({...newHoliday, endDate: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Reason (Optional)</label>
                  <textarea 
                    value={newHoliday.reason}
                    onChange={(e) => setNewHoliday({...newHoliday, reason: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-orange-500 outline-none font-bold h-24"
                  />
                </div>
             </div>
             
             <div className="mt-8 flex items-center gap-4 bg-orange-50 p-5 rounded-2xl border border-orange-100/50">
                <ShieldAlert className="text-orange-600 shrink-0" size={24} />
                <p className="text-[10px] font-bold text-orange-900 leading-relaxed uppercase tracking-tight">
                  <span className="font-black block text-xs mb-1">CRITICAL NOTICE:</span>
                  Adding this holiday will immediately extend the subscription end date of ALL customers with an active plan by the duration of the holiday. This action cannot be easily undone without deleting the holiday record.
                </p>
             </div>

             <button 
               onClick={handleAdd}
               className="w-full mt-10 py-5 bg-orange-600 hover:bg-orange-700 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-orange-900/20 transition-all active:scale-95"
             >
               Confirm & Apply Global Extension
             </button>
          </div>
        )}

        {/* LIST */}
        <div className="space-y-6">
          {holidays.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
               <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
               <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No holidays declared yet</p>
            </div>
          ) : (
            holidays.map((h: any) => (
              <div key={h._id} className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[9px] font-black uppercase tracking-widest mb-3">
                    {h.isActive ? "Scheduled" : "Completed"}
                  </span>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1">{h.title}</h3>
                  <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                     <span className="flex items-center gap-1.5"><Calendar size={14} className="text-orange-400" /> {h.startDate} → {h.endDate}</span>
                     {h.reason && <span className="opacity-50">| Reason: {h.reason}</span>}
                  </div>
                </div>

                <button 
                  onClick={() => setHolidayToDelete(h._id)}
                  className="relative z-10 w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all active:scale-90 shadow-sm"
                  title="Delete Holiday & Revert"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      {holidayToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setHolidayToDelete(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl border border-red-100 flex flex-col items-center text-center animate-in scale-in-95 duration-200">
             <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert size={40} />
             </div>
             <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">Are you sure?</h3>
             <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed mb-10">
               Deleting this holiday will <span className="text-red-600">REVERT</span> plan extensions for all customers.
             </p>
             <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => handleDelete(holidayToDelete)}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
                >
                   Yes, Revert & Delete
                </button>
                <button 
                  onClick={() => setHolidayToDelete(null)}
                  className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                >
                   Cancel
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

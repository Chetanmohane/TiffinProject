"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Tag as TagIcon, 
  Clock, 
  IndianRupee, 
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List as ListIcon
} from "lucide-react";
import { useRBAC } from "@/hooks/useRBAC";

interface Plan {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  tag: string;
  price: number;
  duration: number;
  mealsPerDay: number;
  visible: boolean;
}

const emptyPlan: Plan = {
  name: "",
  description: "",
  tag: "",
  price: 0,
  duration: 30,
  mealsPerDay: 2,
  visible: true,
};

export default function PlanManagement() {
  const { can } = useRBAC();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState<Plan>(emptyPlan);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target as any;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (type === "number" ? Number(value) : value),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/plans", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        await fetchPlans();
        setForm(emptyPlan);
        setIsSidebarOpen(false);
      }
    } catch (err) {
      console.error("Failed to save plan");
    }
  };

  const editPlan = (plan: Plan) => {
    setForm(plan);
    setIsSidebarOpen(true);
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      const response = await fetch("/api/admin/plans", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchPlans();
      }
    } catch (err) {
      console.error("Failed to delete plan");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1600px] mx-auto p-6 md:p-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Package className="text-orange-500" size={36} />
              Tailored <span className="text-orange-500">Plans</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">Design and manage subscription packages for your customers.</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="bg-white border p-1 rounded-xl flex gap-1 shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <ListIcon size={20} />
                </button>
             </div>
             
             {can('create') && (
               <button 
                  onClick={() => { setForm(emptyPlan); setIsSidebarOpen(true); }}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  <Plus size={20} />
                  Create New Plan
                </button>
             )}
          </div>
        </div>

        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
               <div className="h-12 w-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
               <p className="text-slate-400 font-bold">Syncing Plans...</p>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-4"}>
            {(plans || []).map((plan) => (
              <div 
                key={plan._id || plan.id} 
                className={`bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group hover:border-orange-200 transition-all duration-300 ${viewMode === 'list' ? 'flex items-center p-4' : 'flex flex-col'}`}
              >
                {/* Visual Header */}
                {viewMode === 'grid' && (
                  <div className="bg-slate-50 p-8 flex items-center justify-center relative">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                      🍱
                    </div>
                    {plan.tag && (
                       <div className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                          {plan.tag}
                       </div>
                    )}
                    {!plan.visible && (
                       <div className="absolute top-4 left-4 bg-slate-400 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter flex items-center gap-1">
                          <EyeOff size={10} /> Hidden
                       </div>
                    )}
                  </div>
                )}

                <div className={`p-8 ${viewMode === 'list' ? 'flex-1 py-4 flex items-center justify-between' : ''}`}>
                  <div className={viewMode === 'list' ? 'flex items-center gap-6' : ''}>
                     {viewMode === 'list' && (
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl">
                          🍱
                        </div>
                     )}
                     <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">{plan.name}</h3>
                        <p className="text-slate-400 text-sm font-medium line-clamp-1">{plan.description || "No description provided."}</p>
                     </div>
                  </div>

                  <div className={`flex items-baseline gap-1 mt-6 ${viewMode === 'list' ? 'mt-0 mx-10' : ''}`}>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{plan.price}</span>
                    <span className="text-slate-400 font-bold text-sm">/ {plan.duration}d</span>
                  </div>

                  <div className={`grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50 ${viewMode === 'list' ? 'hidden' : ''}`}>
                     <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={16} />
                        <span className="text-xs font-bold">{plan.duration} Days</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-500">
                        <Package size={16} />
                        <span className="text-xs font-bold">{plan.mealsPerDay} Meals/Day</span>
                     </div>
                  </div>

                  <div className={`flex items-center gap-3 mt-8 ${viewMode === 'list' ? 'mt-0' : ''}`}>
                    {can('edit') && (
                      <button 
                        onClick={() => editPlan(plan)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-orange-50 text-orange-600 rounded-xl font-black text-xs hover:bg-orange-500 hover:text-white transition-all"
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>
                    )}
                    {can('delete') && (
                      <button 
                        onClick={() => deletePlan((plan._id || plan.id)!)}
                        className="w-12 h-12 flex items-center justify-center bg-slate-50 text-red-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    {!can('edit') && !can('delete') && (
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 italic">View Only</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && plans.length === 0 && (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-100 shadow-sm">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="text-slate-300" size={40} />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">No Plans Created</h3>
             <p className="text-slate-400 font-medium mb-8 max-w-sm mx-auto">Start by creating your first tailored plan to offer to your customers.</p>
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-slate-800 transition-all"
              >
                Create First Plan
              </button>
          </div>
        )}
      </div>

      {/* Editor Sidebar */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed right-0 top-0 h-screen w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300">
            <div className="p-8 border-b flex items-center justify-between bg-white sticky top-0">
               <div>
                  <h2 className="text-2xl font-black text-slate-900">{form._id || form.id ? 'Edit' : 'Create'} Tailored Plan</h2>
                  <p className="text-slate-400 text-sm font-bold">Fill in the details to customize the offering.</p>
               </div>
               <button onClick={() => setIsSidebarOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Plus size={24} className="rotate-45" />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Plan Name</label>
                        <input 
                           name="name"
                           value={form.name}
                           onChange={handleChange}
                           placeholder="Eg: Premium Monthly Veg"
                           className="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                           required
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Tag (Tailored Message)</label>
                        <div className="relative">
                           <input 
                              name="tag"
                              value={form.tag}
                              onChange={handleChange}
                              placeholder="Eg: Best Seller / New / Featured"
                              className="w-full bg-slate-50 border-0 rounded-2xl p-4 pl-12 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                           />
                           <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Plan Description</label>
                        <textarea 
                           name="description"
                           value={form.description}
                           onChange={handleChange}
                           rows={3}
                           placeholder="Short description for customers..."
                           className="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 transition-all outline-none resize-none"
                        />
                     </div>
                  </div>

                  {/* Pricing & Scheduling */}
                  <div className="grid md:grid-cols-3 gap-6 pt-4">
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Price (₹)</label>
                        <div className="relative">
                           <input 
                              type="number"
                              name="price"
                              value={form.price}
                              onChange={handleChange}
                              className="w-full bg-slate-50 border-0 rounded-2xl p-4 pl-10 font-black text-slate-900"
                              required
                           />
                           <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Days</label>
                        <div className="relative">
                           <input 
                              type="number"
                              name="duration"
                              value={form.duration}
                              onChange={handleChange}
                              className="w-full bg-slate-50 border-0 rounded-2xl p-4 pl-10 font-black text-slate-900"
                              required
                           />
                           <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Meals/d</label>
                        <div className="relative">
                           <input 
                              type="number"
                              name="mealsPerDay"
                              value={form.mealsPerDay}
                              onChange={handleChange}
                              className="w-full bg-slate-50 border-0 rounded-2xl p-4 pl-10 font-black text-slate-900"
                              required
                           />
                           <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        </div>
                     </div>
                  </div>

                  {/* Visibility Toggle */}
                  <div className="pt-6">
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                           <input 
                              type="checkbox"
                              name="visible"
                              checked={form.visible}
                              onChange={handleChange}
                              className="sr-only"
                           />
                           <div className={`w-14 h-8 rounded-full transition-colors ${form.visible ? 'bg-orange-500' : 'bg-slate-200'}`}>
                              <div className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform ${form.visible ? 'translate-x-[24px]' : ''}`}></div>
                           </div>
                        </div>
                        <span className="text-slate-700 font-bold group-hover:text-orange-600 transition-colors">Visible to Customers</span>
                     </label>
                  </div>
               </div>

               {/* Tips Section */}
               <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100 flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 text-orange-500">
                     <AlertCircle size={24} />
                  </div>
                  <div>
                     <p className="text-sm font-black text-orange-900">Tailored Plan Tip</p>
                     <p className="text-xs text-orange-700 font-bold mt-1 leading-relaxed">Plans with specific tags like "Best Seller" or "Budget Friendly" see 40% more conversions. Descriptions should be clear and descriptive.</p>
                  </div>
               </div>
            </form>

            <div className="p-8 border-t bg-slate-50 sticky bottom-0">
               <div className="flex gap-4">
                  <button 
                     type="button"
                     onClick={() => setIsSidebarOpen(false)}
                     className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                     Cancel
                  </button>
                  <button 
                     type="submit"
                     onClick={(e:any) => handleSubmit(e)}
                     className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 shadow-xl shadow-orange-100 transition-all active:scale-[0.98]"
                  >
                     {form._id || form.id ? 'Save Changes' : 'Publish Plan'}
                  </button>
               </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
         .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;  
            overflow: hidden;
         }
      `}</style>
    </div>
  );
}

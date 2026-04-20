"use client";

import React, { useState, useEffect } from "react";
import { 
  Home, 
  Save, 
  Image as ImageIcon, 
  Type, 
  Layout, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  Star,
  Users
} from "lucide-react";
import toast from "react-hot-toast";

export default function SiteContentManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Site content updated successfully! 🎉");
      }
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
          <p className="text-slate-400 font-bold">Loading CMS Assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto p-4 md:p-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Layout className="text-orange-500" size={36} />
              Site <span className="text-orange-500">CMS</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">Update landing page headlines, descriptions and imagery.</p>
          </div>
          
          <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
             {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
             {saving ? "Saving Changes..." : "Push Updates Live"}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
           {/* Hero Section Card */}
           <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-3 mb-10">
                 <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                    <Home size={20} />
                 </div>
                 <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Hero Section</h2>
              </div>

              <div className="grid gap-10">
                 {/* Headlines Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Title Line 1</label>
                       <input 
                          value={settings.hero.line1}
                          onChange={(e) => setSettings({...settings, hero: {...settings.hero, line1: e.target.value}})}
                          className="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-orange-400 tracking-widest ml-1">Accent Line (Orange)</label>
                       <input 
                          value={settings.hero.accentLine}
                          onChange={(e) => setSettings({...settings, hero: {...settings.hero, accentLine: e.target.value}})}
                          className="w-full bg-orange-50 border-0 rounded-2xl p-4 font-bold text-orange-600 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-red-400 tracking-widest ml-1">Main Focus (Red)</label>
                       <input 
                          value={settings.hero.redLine}
                          onChange={(e) => setSettings({...settings, hero: {...settings.hero, redLine: e.target.value}})}
                          className="w-full bg-red-50 border-0 rounded-2xl p-4 font-bold text-red-600 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                       />
                    </div>
                 </div>

                 {/* Description */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Main Description</label>
                    <textarea 
                       rows={3}
                       value={settings.hero.description}
                       onChange={(e) => setSettings({...settings, hero: {...settings.hero, description: e.target.value}})}
                       className="w-full bg-slate-50 border-0 rounded-3xl p-6 font-bold text-slate-600 focus:ring-2 focus:ring-orange-500 outline-none transition-all leading-relaxed"
                    />
                 </div>

                 {/* Image URL */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Main Hero Image URL</label>
                          <div className="relative">
                             <input 
                                value={settings.hero.mainImage}
                                onChange={(e) => setSettings({...settings, hero: {...settings.hero, mainImage: e.target.value}})}
                                className="w-full bg-slate-50 border-0 rounded-2xl p-4 pl-12 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                             />
                             <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-1"><Star size={10} className="text-orange-500" /> Rating Text</label>
                             <input 
                                value={settings.hero.ratingText}
                                onChange={(e) => setSettings({...settings, hero: {...settings.hero, ratingText: e.target.value}})}
                                className="w-full bg-slate-50 border-0 rounded-xl p-3 font-bold text-slate-900 outline-none text-xs"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-1"><Users size={10} className="text-blue-500" /> Users Text</label>
                             <input 
                                value={settings.hero.activeUsersText}
                                onChange={(e) => setSettings({...settings, hero: {...settings.hero, activeUsersText: e.target.value}})}
                                className="w-full bg-slate-50 border-0 rounded-xl p-3 font-bold text-slate-900 outline-none text-xs"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Image Preview</label>
                       <div className="relative rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100 aspect-video">
                          <img 
                             src={settings.hero.mainImage} 
                             alt="Preview" 
                             className="w-full h-full object-cover"
                             onError={(e:any) => e.target.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                          <div className="absolute bottom-4 left-4 right-4 text-white text-[10px] font-black uppercase tracking-widest text-center">Live Site Preview</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Tips Card */}
           <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 flex gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 text-blue-500 border border-blue-100">
                 <AlertCircle size={24} />
              </div>
              <div>
                 <p className="text-sm font-black text-blue-900 uppercase tracking-tight">Content Tip</p>
                 <p className="text-xs text-blue-700 font-bold mt-1 leading-relaxed max-w-2xl italic opacity-80">
                    Keep your hero title short and impactful. High-quality images of fresh meals increase customer trust by 60%. Always check how the text aligns with your chosen image.
                 </p>
              </div>
           </div>
        </form>
      </div>
    </div>
  );
}

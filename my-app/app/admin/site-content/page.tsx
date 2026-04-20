"use client";

import React, { useState, useEffect } from "react";
import { 
  Home, 
  Save, 
  Image as ImageIcon, 
  Layout, 
  Loader2,
  AlertCircle,
  Star,
  Users,
  Info,
  Target,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";

type Tab = 'hero' | 'about' | 'mission';

export default function SiteContentManagement() {
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    hero: { 
      line1: "Taste the", 
      accentLine: "Comfort", 
      redLine: "Home-Cooked Meals", 
      description: "Fresh, hygienic, and deliciously crafted tiffin meals delivered daily. We bring the warmth of a mother's kitchen straight to your doorstep.", 
      mainImage: "/food2.PNG", 
      ratingText: "4.9/5 Rating", 
      activeUsersText: "500+ Active" 
    },
    about: { 
      heading: "OUR HUMBLE BEGINNINGS", 
      titleLine1: "Cooking with", 
      titleAccent: "Tradition", 
      titleLine2: "Serving with Soul", 
      description: "Annapurna Delight started in a small kitchen with a big dream: to provide the warmth and comfort of 'Ghar Ka Khana' to everyone living away from home.", 
      image: "/food1.PNG", 
      experienceText: "10+", 
      experienceSub: "YEARS OF LOVE" 
    },
    mission: { 
      heading: "WHY WE DO IT", 
      titleLine1: "More Than Just a", 
      titleAccent: "Tiffin Service", 
      description: "We understand that food is more than just fuel—it's an emotion. Our mission is to serve happiness in every bite.", 
      image: "/food3.jpg" 
    }
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { 
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({
          ...settings,
          ...data.settings
        });
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

  const handleSave = async () => {
    console.log("Attempting to save Site Settings:", settings);
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
        console.log("Successfully saved settings:", data.settings);
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (err) {
      console.error("Frontend Save Error:", err);
      toast.error("Network error: Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
          <p className="text-slate-400 font-bold">Loading Web Assets...</p>
        </div>
      </div>
    );
  }

  const SectionTitle = ({ icon: Icon, title, subtitle }: any) => (
    <div className="flex items-center gap-4 mb-10">
      <div className="bg-orange-100 p-3 rounded-2xl text-orange-600 shadow-sm border border-orange-200/50">
        <Icon size={24} />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest leading-none">{title}</h2>
        <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1200px] mx-auto p-4 md:p-10 pb-32">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Layout className="text-orange-500" size={36} />
              Website <span className="text-orange-500">CMS</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">Manage all primary text and images on your landing page.</p>
          </div>
          
          <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 active:scale-95"
          >
             {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
             {saving ? "Deploying..." : "Push Updates Live"}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-10 bg-white p-2 rounded-3xl shadow-sm border border-slate-100 w-fit">
           {[
             { id: 'hero', name: 'Hero Section', icon: Home },
             { id: 'about', name: 'About Section', icon: Info },
             { id: 'mission', name: 'Our Mission', icon: Target }
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as Tab)}
               className={`
                 flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                 ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}
               `}
             >
               <tab.icon size={16} />
               {tab.name}
             </button>
           ))}
        </div>

        <div className="grid gap-10">
           {/* Section Card */}
           <div className="bg-white rounded-[3rem] p-8 sm:p-16 shadow-2xl shadow-slate-200/40 border border-white">
              
              {/* HERO TAB */}
              {activeTab === 'hero' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <SectionTitle icon={Home} title="Hero Header" subtitle="Main landing page entry point" />
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Title Line 1</label>
                         <input 
                            value={settings.hero.line1}
                            onChange={(e) => setSettings({...settings, hero: {...settings.hero, line1: e.target.value}})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-orange-500 tracking-widest ml-1">Orange Accent</label>
                         <input 
                            value={settings.hero.accentLine}
                            onChange={(e) => setSettings({...settings, hero: {...settings.hero, accentLine: e.target.value}})}
                            className="w-full bg-orange-50/50 border border-orange-100 rounded-2xl p-5 font-bold text-orange-600 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-red-500 tracking-widest ml-1">Red Emphasis</label>
                         <input 
                            value={settings.hero.redLine}
                            onChange={(e) => setSettings({...settings, hero: {...settings.hero, redLine: e.target.value}})}
                            className="w-full bg-red-50/50 border border-red-100 rounded-2xl p-5 font-bold text-red-600 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                         />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Main Narrative</label>
                      <textarea 
                         rows={4}
                         value={settings.hero.description}
                         onChange={(e) => setSettings({...settings, hero: {...settings.hero, description: e.target.value}})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 font-bold text-slate-600 focus:ring-2 focus:ring-orange-500 outline-none transition-all leading-relaxed"
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                      <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Background Image URL</label>
                            <div className="relative">
                               <input 
                                  value={settings.hero.mainImage}
                                  onChange={(e) => setSettings({...settings, hero: {...settings.hero, mainImage: e.target.value}})}
                                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 pl-12 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                               />
                               <ImageIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Badge: Rating</label>
                               <input 
                                  value={settings.hero.ratingText}
                                  onChange={(e) => setSettings({...settings, hero: {...settings.hero, ratingText: e.target.value}})}
                                  className="w-full bg-slate-50 border-0 rounded-xl p-4 font-black text-slate-900 outline-none text-[10px] uppercase tracking-wider"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Badge: Active Users</label>
                               <input 
                                  value={settings.hero.activeUsersText}
                                  onChange={(e) => setSettings({...settings, hero: {...settings.hero, activeUsersText: e.target.value}})}
                                  className="w-full bg-slate-50 border-0 rounded-xl p-4 font-black text-slate-900 outline-none text-[10px] uppercase tracking-wider"
                               />
                            </div>
                         </div>
                      </div>
                      <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-slate-50 shadow-2xl bg-slate-100 aspect-video">
                          <img src={settings.hero.mainImage} alt="Hero Preview" className="w-full h-full object-cover" />
                      </div>
                   </div>
                </div>
              )}

              {/* ABOUT TAB */}
              {activeTab === 'about' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <SectionTitle icon={Info} title="Our Story" subtitle="About us section details" />
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sub-heading</label>
                         <input 
                            value={settings.about.heading}
                            onChange={(e) => setSettings({...settings, about: {...settings.about, heading: e.target.value}})}
                            placeholder="Eg: OUR HUMBLE BEGINNINGS"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold text-slate-900 outline-none"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-orange-500 tracking-widest ml-1">Accent Word (Tradition)</label>
                         <input 
                            value={settings.about.titleAccent}
                            onChange={(e) => setSettings({...settings, about: {...settings.about, titleAccent: e.target.value}})}
                            className="w-full bg-orange-50 border border-orange-100 rounded-2xl p-5 font-bold text-orange-600 outline-none"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Title Line 1</label>
                         <input 
                            value={settings.about.titleLine1}
                            onChange={(e) => setSettings({...settings, about: {...settings.about, titleLine1: e.target.value}})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Title Line 2 (Serving with...)</label>
                         <input 
                            value={settings.about.titleLine2}
                            onChange={(e) => setSettings({...settings, about: {...settings.about, titleLine2: e.target.value}})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold"
                         />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">About Narrative</label>
                      <textarea 
                         rows={4}
                         value={settings.about.description}
                         onChange={(e) => setSettings({...settings, about: {...settings.about, description: e.target.value}})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 font-bold text-slate-600 outline-none leading-relaxed"
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                      <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">About Image URL</label>
                            <input 
                               value={settings.about.image}
                               onChange={(e) => setSettings({...settings, about: {...settings.about, image: e.target.value}})}
                               className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold outline-none"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Badge: Exp (10+)</label>
                               <input 
                                  value={settings.about.experienceText}
                                  onChange={(e) => setSettings({...settings, about: {...settings.about, experienceText: e.target.value}})}
                                  className="w-full bg-slate-50 border-0 rounded-xl p-4 font-black"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Badge: Text (YEARS OF LOVE)</label>
                               <input 
                                  value={settings.about.experienceSub}
                                  onChange={(e) => setSettings({...settings, about: {...settings.about, experienceSub: e.target.value}})}
                                  className="w-full bg-slate-50 border-0 rounded-xl p-4 font-black"
                               />
                            </div>
                         </div>
                      </div>
                      <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-slate-100 shadow-2xl aspect-square">
                          <img src={settings.about.image} alt="About Preview" className="w-full h-full object-cover" />
                      </div>
                   </div>
                </div>
              )}

              {/* MISSION TAB */}
              {activeTab === 'mission' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <SectionTitle icon={Target} title="Our Mission" subtitle="Why we do it section" />
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sub-heading</label>
                         <input 
                            value={settings.mission.heading}
                            onChange={(e) => setSettings({...settings, mission: {...settings.mission, heading: e.target.value}})}
                            placeholder="Eg: WHY WE DO IT"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-orange-500 tracking-widest ml-1 flex items-center gap-2">Accent Title <ChevronRight size={14} /></label>
                         <input 
                            value={settings.mission.titleAccent}
                            onChange={(e) => setSettings({...settings, mission: {...settings.mission, titleAccent: e.target.value}})}
                            className="w-full bg-orange-50 border border-orange-100 rounded-2xl p-5 font-bold text-orange-600 outline-none"
                         />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Mission Title Line 1</label>
                      <input 
                         value={settings.mission.titleLine1}
                         onChange={(e) => setSettings({...settings, mission: {...settings.mission, titleLine1: e.target.value}})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold outline-none"
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                      <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Mission Narrative</label>
                            <textarea 
                               rows={4}
                               value={settings.mission.description}
                               onChange={(e) => setSettings({...settings, mission: {...settings.mission, description: e.target.value}})}
                               className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-bold text-slate-600 outline-none"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Mission Image URL</label>
                            <input 
                               value={settings.mission.image}
                               onChange={(e) => setSettings({...settings, mission: {...settings.mission, image: e.target.value}})}
                               className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold outline-none"
                            />
                         </div>
                      </div>
                      <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-slate-100 shadow-2xl aspect-video">
                          <img src={settings.mission.image} alt="Mission Preview" className="w-full h-full object-cover" />
                      </div>
                   </div>
                </div>
              )}

           </div>

           {/* Save Bar (Fixed Bottom on Mobile) */}
           <div className="bg-orange-600 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-orange-500/20 text-white flex items-center justify-between gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-150 group-hover:rotate-12 transition-transform duration-1000">
                 <Save size={100} />
              </div>
              <div className="relative z-10 flex-1">
                 <p className="text-xl sm:text-2xl font-black tracking-tight uppercase">Ready to update your site?</p>
                 <p className="text-orange-100 text-xs sm:text-sm font-bold opacity-80 mt-1 max-w-lg">All text and imagery changes will reflect globally. Ensure URLs are accessible and content is accurate.</p>
              </div>
              <button 
                 onClick={handleSave}
                 disabled={saving}
                 className="relative z-10 px-8 py-4 bg-white text-orange-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                 {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                 {saving ? "Deploying..." : "Confirm Push"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

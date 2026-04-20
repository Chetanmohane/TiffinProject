"use client";

import React, { useState, useEffect } from "react";
import { 
  Home, 
  Save, 
  Image as ImageIcon, 
  Layout, 
  Loader2,
  Star,
  Users,
  Info,
  Target,
  ChevronRight,
  CheckCircle2,
  Utensils,
  Phone,
  Mail,
  MapPin,
  Quote
} from "lucide-react";
import toast from "react-hot-toast";

type Tab = 'hero' | 'about' | 'mission' | 'services' | 'contact';

export default function SiteContentManagement() {
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    hero: { line1: "Taste the", accentLine: "Comfort", redLine: "Home-Cooked Meals", description: "Fresh, hygienic, and deliciously crafted tiffin meals delivered daily.", mainImage: "/food2.PNG", ratingText: "4.9/5 Rating", activeUsersText: "500+ Active" },
    about: { heading: "OUR HUMBLE BEGINNINGS", titleLine1: "Cooking with", titleAccent: "Tradition", titleLine2: "Serving with Soul", description: "Annapurna Delight started in a small kitchen with a big dream.", image: "/food1.PNG", experienceText: "10+", experienceSub: "YEARS OF LOVE", feature1Title: "Pure Veg", feature1Sub: "Strictly vegetarian", feature2Title: "Best Quality", feature2Sub: "Premium masalas", quoteText: "Every meal we prepare is treated as if it's for our own family." },
    mission: { heading: "WHY WE DO IT", titleLine1: "More Than Just a", titleAccent: "Tiffin Service", description: "We understand that food is more than just fuel—it's an emotion.", image: "/food3.jpg", image2: "/food2.PNG" },
    services: { heading: "OUR SERVICES", title: "We Provide Best Quality Items", item1Title: "Fresh Ingredients", item1Desc: "Freshest produce.", item2Title: "On-Time Delivery", item2Desc: "Hot meals delivered right when you need them.", item3Title: "Customizable Plans", item3Desc: "Variety of options." },
    contact: { phone: "+91 91316 48092", email: "support@annapurnadelight.com", address: "Indore, India", instagram: "#", facebook: "#" }
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { cache: 'no-store', next: { revalidate: 0 } });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({ ...settings, ...data.settings });
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
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Site content pushed live! 🎉");
      }
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading CMS Engine...</p>
      </div>
    </div>
  );

  const SectionTitle = ({ icon: Icon, title, subtitle }: any) => (
    <div className="flex items-center gap-4 mb-10">
      <div className="bg-orange-100 p-3 rounded-2xl text-orange-600 shadow-sm border border-orange-200/50">
        <Icon size={24} />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest leading-none">{title}</h2>
        <p className="text-slate-400 text-[10px] font-black mt-1.5 uppercase tracking-[0.2em]">{subtitle}</p>
      </div>
    </div>
  );

  const Input = ({ label, value, onChange, placeholder, accent = false, icon: Icon = null }: any) => (
    <div className="space-y-3">
      <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${accent ? "text-orange-500" : "text-slate-400"}`}>{label}</label>
      <div className="relative">
        <input 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${accent ? "bg-orange-50/50 border-orange-100 text-orange-600" : "bg-slate-50 border-slate-100 text-slate-900"} border rounded-2xl p-5 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all ${Icon ? 'pl-14' : ''}`}
        />
        {Icon && <Icon size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto p-4 md:p-10 pb-32">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 px-4">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
              <Layout className="text-orange-500" size={44} />
              Website <span className="text-orange-510 bg-orange-100 px-3 rounded-2xl">CMS</span>
            </h1>
            <p className="text-slate-400 font-bold mt-3 text-lg uppercase tracking-tight opacity-70">Hyper-Granular Live Content Management</p>
          </div>
          
          <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-3 px-12 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black hover:bg-slate-800 transition-all shadow-3xl shadow-slate-200 disabled:opacity-50 active:scale-95 text-lg"
          >
             {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
             {saving ? "Deploying Assets..." : "Push Updates Live"}
          </button>
        </div>

        {/* Dynamic Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-12 bg-white p-3 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 w-fit mx-4">
           {[
             { id: 'hero', name: 'Hero Header', icon: Home },
             { id: 'about', name: 'Story & Details', icon: Info },
             { id: 'mission', name: 'Mission Content', icon: Target },
             { id: 'services', name: 'Service Cards', icon: Utensils },
             { id: 'contact', name: 'Contact & Social', icon: Phone }
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as Tab)}
               className={`
                 flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300
                 ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-2xl scale-105' : 'text-slate-400 hover:bg-slate-50'}
               `}
             >
               <tab.icon size={18} />
               {tab.name}
             </button>
           ))}
        </div>

        <div className="grid gap-12 px-4">
           {/* Section Card */}
           <div className="bg-white rounded-[4rem] p-10 md:p-20 shadow-3xl shadow-slate-200/40 border-4 border-white/50">
              
              {activeTab === 'hero' && (
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                   <SectionTitle icon={Home} title="Landing Entrance" subtitle="Above index fold hero content" />
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <Input label="Top Title Line" value={settings.hero.line1} onChange={(val:any) => setSettings({...settings, hero: {...settings.hero, line1: val}})} />
                      <Input label="Orange Accent Word" value={settings.hero.accentLine} onChange={(val:any) => setSettings({...settings, hero: {...settings.hero, accentLine: val}})} accent={true} />
                      <Input label="Red Emphasis Phrase" value={settings.hero.redLine} onChange={(val:any) => setSettings({...settings, hero: {...settings.hero, redLine: val}})} />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Main Narrative Text</label>
                      <textarea rows={4} value={settings.hero.description} onChange={(e) => setSettings({...settings, hero: {...settings.hero, description: e.target.value}})} className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 font-bold text-slate-600 focus:ring-2 focus:ring-orange-500 outline-none transition-all leading-relaxed" />
                   </div>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                      <div className="grid grid-cols-2 gap-8">
                         <Input label="Floating Rating Badge" value={settings.hero.ratingText} onChange={(val:any) => setSettings({...settings, hero: {...settings.hero, ratingText: val}})} />
                         <Input label="Floating Users Badge" value={settings.hero.activeUsersText} onChange={(val:any) => setSettings({...settings, hero: {...settings.hero, activeUsersText: val}})} />
                         <div className="col-span-2">
                           <Input label="Hero Image URL" value={settings.hero.mainImage} onChange={(val:any) => setSettings({...settings, hero: {...settings.hero, mainImage: val}})} icon={ImageIcon} />
                         </div>
                      </div>
                      <div className="relative rounded-[3rem] overflow-hidden border-[12px] border-slate-50 shadow-3xl aspect-[16/10]">
                          <img src={settings.hero.mainImage} alt="Hero Preview" className="w-full h-full object-cover" />
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                   <SectionTitle icon={Info} title="Brand Story" subtitle="Historical background and features" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <Input label="Section Heading" value={settings.about.heading} onChange={(val:any) => setSettings({...settings, about: {...settings.about, heading: val}})} />
                      <Input label="Experience Number" value={settings.about.experienceText} onChange={(val:any) => setSettings({...settings, about: {...settings.about, experienceText: val}})} accent={true} />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <Input label="Title Line 1" value={settings.about.titleLine1} onChange={(val:any) => setSettings({...settings, about: {...settings.about, titleLine1: val}})} />
                      <Input label="Accent Word" value={settings.about.titleAccent} onChange={(val:any) => setSettings({...settings, about: {...settings.about, titleAccent: val}})} accent={true} />
                      <Input label="Title Line 2" value={settings.about.titleLine2} onChange={(val:any) => setSettings({...settings, about: {...settings.about, titleLine2: val}})} />
                   </div>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                      <div className="space-y-12">
                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">Service Feature 1</p>
                               <Input label="Title" value={settings.about.feature1Title} onChange={(val:any) => setSettings({...settings, about: {...settings.about, feature1Title: val}})} />
                               <Input label="Description" value={settings.about.feature1Sub} onChange={(val:any) => setSettings({...settings, about: {...settings.about, feature1Sub: val}})} />
                            </div>
                            <div className="space-y-6">
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">Service Feature 2</p>
                               <Input label="Title" value={settings.about.feature2Title} onChange={(val:any) => setSettings({...settings, about: {...settings.about, feature2Title: val}})} />
                               <Input label="Description" value={settings.about.feature2Sub} onChange={(val:any) => setSettings({...settings, about: {...settings.about, feature2Sub: val}})} />
                            </div>
                         </div>
                         <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Quote size={12} className="text-orange-500" /> Brand Promise (Quote)</label>
                           <textarea rows={3} value={settings.about.quoteText} onChange={(e) => setSettings({...settings, about: {...settings.about, quoteText: e.target.value}})} className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 font-bold text-slate-700 italic outline-none" />
                         </div>
                      </div>
                      <div className="space-y-10">
                         <Input label="About Image URL" value={settings.about.image} onChange={(val:any) => setSettings({...settings, about: {...settings.about, image: val}})} icon={ImageIcon} />
                         <div className="relative rounded-[3rem] overflow-hidden border-8 border-slate-50 shadow-3xl aspect-square bg-slate-50">
                            <img src={settings.about.image} alt="About Preview" className="w-full h-full object-cover" />
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'mission' && (
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                   <SectionTitle icon={Target} title="Purpose & Values" subtitle="The why behind the service" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <Input label="Sub-heading" value={settings.mission.heading} onChange={(val:any) => setSettings({...settings, mission: {...settings.mission, heading: val}})} />
                      <Input label="Accent Title" value={settings.mission.titleAccent} onChange={(val:any) => setSettings({...settings, mission: {...settings.mission, titleAccent: val}})} accent={true} />
                   </div>
                   <Input label="Main Purpose Title Line" value={settings.mission.titleLine1} onChange={(val:any) => setSettings({...settings, mission: {...settings.mission, titleLine1: val}})} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                      <div className="space-y-10">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Mission Narrative</label>
                            <textarea rows={6} value={settings.mission.description} onChange={(e) => setSettings({...settings, mission: {...settings.mission, description: e.target.value}})} className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 font-bold text-slate-600 outline-none" />
                         </div>
                         <Input label="Primary Image URL" value={settings.mission.image} onChange={(val:any) => setSettings({...settings, mission: {...settings.mission, image: val}})} icon={ImageIcon} />
                         <Input label="Secondary Image URL (Why We Do It)" value={settings.mission.image2} onChange={(val:any) => setSettings({...settings, mission: {...settings.mission, image2: val}})} icon={ImageIcon} />
                      </div>
                      <div className="relative rounded-[3.5rem] border-[14px] border-slate-50 shadow-3xl aspect-[9/12] bg-slate-50 p-4 flex flex-col gap-4">
                          <div className="h-1/2 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                            <img src={settings.mission.image} alt="Preview 1" className="w-full h-full object-cover" />
                          </div>
                          <div className="h-1/2 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                            <img src={settings.mission.image2} alt="Preview 2" className="w-full h-full object-cover" />
                          </div>
                          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full backdrop-blur-sm">Dual Section Preview</p>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'services' && (
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                   <SectionTitle icon={Utensils} title="Service Highlights" subtitle="Core offerings showcase" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <Input label="Section Heading" value={settings.services.heading} onChange={(val:any) => setSettings({...settings, services: {...settings.services, heading: val}})} />
                      <Input label="Main Title" value={settings.services.title} onChange={(val:any) => setSettings({...settings, services: {...settings.services, title: val}})} accent={true} />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                           <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Card {num}</p>
                           <Input label="Card Title" value={settings.services[`item${num}Title`]} onChange={(val:any) => setSettings({...settings, services: {...settings.services, [`item${num}Title`]: val}})} />
                           <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Description</label>
                             <textarea rows={3} value={settings.services[`item${num}Desc`]} onChange={(e) => setSettings({...settings, services: {...settings.services, [`item${num}Desc`]: e.target.value}})} className="w-full bg-white border border-slate-100 rounded-2xl p-4 font-bold text-slate-600 outline-none" />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                   <SectionTitle icon={Phone} title="Global Contact" subtitle="Website footer & support info" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <Input label="Support Phone Number" value={settings.contact.phone} onChange={(val:any) => setSettings({...settings, contact: {...settings.contact, phone: val}})} icon={Phone} />
                      <Input label="Support Email Address" value={settings.contact.email} onChange={(val:any) => setSettings({...settings, contact: {...settings.contact, email: val}})} icon={Mail} />
                      <Input label="Business Address" value={settings.contact.address} onChange={(val:any) => setSettings({...settings, contact: {...settings.contact, address: val}})} icon={MapPin} />
                      <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-8 flex flex-col justify-center">
                         <p className="text-[10px] font-black uppercase text-orange-500 tracking-[0.3em]">Social Footprint</p>
                         <Input label="Instagram URL" value={settings.contact.instagram} onChange={(val:any) => setSettings({...settings, contact: {...settings.contact, instagram: val}})} accent={true} />
                         <Input label="Facebook URL" value={settings.contact.facebook} onChange={(val:any) => setSettings({...settings, contact: {...settings.contact, facebook: val}})} accent={true} />
                      </div>
                   </div>
                </div>
              )}

           </div>

           {/* Deployment Bar */}
           <div className="bg-orange-600 p-8 md:p-14 rounded-[4rem] shadow-3xl shadow-orange-500/30 text-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-10 transform scale-150 group-hover:rotate-12 transition-transform duration-1000">
                 <Save size={150} />
              </div>
              <div className="relative z-10 flex-1 text-center md:text-left">
                 <h4 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none">Apply Content Patch?</h4>
                 <p className="text-orange-100 text-sm md:text-lg font-bold opacity-80 mt-4 max-w-2xl leading-relaxed">Changes to text, structure, and imagery will be pushed to the global live engine. Your customers will see the new content instantly.</p>
              </div>
              <button 
                 onClick={handleSave}
                 disabled={saving}
                 className="relative z-10 px-12 py-6 bg-white text-orange-600 rounded-[2rem] font-black uppercase text-sm tracking-widest hover:scale-105 hover:bg-orange-50 transition-all shadow-3xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
              >
                 {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={24} />}
                 {saving ? "Deploying..." : "Publish Now"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

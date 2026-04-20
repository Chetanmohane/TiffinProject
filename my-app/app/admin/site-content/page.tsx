"use client";

import React, { useState, useEffect } from "react";
import { 
  Home, 
  Save, 
  Image as ImageIcon, 
  Layout, 
  Loader2,
  Info,
  Target,
  CheckCircle2,
  Utensils,
  Phone,
  Mail,
  MapPin,
  Quote,
  MessageSquare,
  Globe,
  Monitor
} from "lucide-react";
import toast from "react-hot-toast";

type Tab = 'hero' | 'about' | 'mission' | 'services' | 'contact';

// --- SUB-COMPONENTS (Defined OUTSIDE to prevent focus loss) ---

const SectionHeader = ({ icon: Icon, title, subtitle, section, onSave, saving }: any) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12 bg-slate-50 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100">
    <div className="flex items-center gap-4 sm:gap-5">
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl text-orange-600 shadow-sm border border-slate-200">
        <Icon size={24} className="sm:w-7 sm:h-7" />
      </div>
      <div>
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">{title}</h2>
        <p className="text-slate-400 text-[10px] sm:text-xs font-bold mt-1.5 sm:mt-2 uppercase tracking-wide opacity-80">{subtitle}</p>
      </div>
    </div>
    <button 
       onClick={() => onSave(section)}
       disabled={saving}
       className="group flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 active:scale-95 text-xs sm:text-sm"
    >
       {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover:scale-125 transition-transform" />}
       {saving ? "SAVING..." : `UPDATE ${section.toUpperCase()}`}
    </button>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, accent = false, icon: Icon = null, isTextarea = false }: any) => (
  <div className="space-y-2 sm:space-y-3 flex-1">
    <div className="flex items-center justify-between px-1">
      <label className={`text-[9px] sm:text-[11px] font-black uppercase tracking-widest ${accent ? "text-orange-500" : "text-slate-400"}`}>{label}</label>
    </div>
    <div className="relative group">
      {isTextarea ? (
        <textarea 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`w-full ${accent ? "bg-orange-50/30 border-orange-100 text-orange-700" : "bg-slate-50 border-slate-100 text-slate-900"} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 font-bold text-sm sm:text-base outline-none focus:border-orange-500 focus:bg-white transition-all resize-none leading-relaxed`}
        />
      ) : (
        <input 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${accent ? "bg-orange-50/30 border-orange-100 text-orange-700" : "bg-slate-50 border-slate-100 text-slate-900"} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 font-bold text-sm sm:text-base outline-none focus:border-orange-500 focus:bg-white transition-all ${Icon ? 'pl-12 sm:pl-14' : ''}`}
        />
      )}
      {Icon && <Icon size={18} className={`absolute ${Icon ? 'left-4 sm:left-5' : ''} ${isTextarea ? 'top-5' : 'top-1/2 -translate-y-1/2'} text-slate-300 group-focus-within:text-orange-500 transition-colors sm:w-[20px] sm:h-[20px]`} />}
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export default function SiteContentManagement() {
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({
    hero: { line1: "Taste the", accentLine: "Comfort", redLine: "Home-Cooked Meals", description: "Fresh, hygienic, and deliciously crafted tiffin meals delivered daily.", mainImage: "/food2.PNG", ratingText: "4.9/5 Rating", activeUsersText: "500+ Active" },
    about: { heading: "OUR HUMBLE BEGINNINGS", titleLine1: "Cooking with", titleAccent: "Tradition", titleLine2: "Serving with Soul", description: "Annapurna Delight started in a small kitchen with a big dream.", image: "/food1.PNG", experienceText: "10+", experienceSub: "YEARS OF LOVE", feature1Title: "Pure Veg", feature1Sub: "Strictly vegetarian", feature2Title: "Best Quality", feature2Sub: "Premium masalas", quoteText: "Every meal we prepare is treated as if it's for our own family." },
    mission: { heading: "WHY WE DO IT", titleLine1: "More Than Just a", titleAccent: "Tiffin Service", description: "We understand that food is more than just fuel—it's an emotion.", image: "/food2.PNG", image2: "/food2.PNG" },
    services: { heading: "OUR SERVICES", title: "We Provide Best Quality Items", subDesc: "We don't just deliver food; we deliver health, convenience, and a taste of home.", item1Title: "Fresh Ingredients", item1Desc: "Freshest produce.", item2Title: "On-Time Delivery", item2Desc: "Hot meals delivered right when you need them.", item3Title: "Customizable Plans", item3Desc: "Variety of options." },
    contact: { phone: "+91 91316 48092", email: "support@annapurnadelight.com", address: "Indore, India", instagram: "#", facebook: "#", footerMsg: "Subscribe for daily menu updates & offers.", footerTitle: "Annapurna Delight Tiffin Centre", workingHours: "9:00 AM - 10:00 PM" }
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings?t=" + new Date().getTime(), { cache: 'no-store', next: { revalidate: 0 } });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({ ...settings, ...data.settings });
      }
    } catch (err) {
      toast.error("Cloud sync failed. Using local state.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (section: string) => {
    setSavingSection(section);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${section.toUpperCase()} updated successfully! 🎉`);
      }
    } catch (err) {
      toast.error("Network error. Check your connection.");
    } finally {
      setSavingSection(null);
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-100 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Site Engine...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="max-w-[1500px] mx-auto p-4 md:p-12 pb-32">
        
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-12 sm:mb-20 px-2 sm:px-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-orange-600 font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em]">
              <Globe size={14} className="sm:w-4 sm:h-4" /> Admin Engine v2.0
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter flex flex-wrap items-baseline gap-2">
              Site <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent italic">Content</span>
            </h1>
            <p className="text-slate-400 font-bold text-sm sm:text-lg max-w-xl leading-snug">Empowering you to manage every visual and textual element of your digital storefront.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-2xl sm:rounded-3xl border border-slate-200 w-fit">
             <button onClick={() => window.open('/', '_blank')} className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-white text-slate-900 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm hover:shadow-lg transition-all border border-slate-200 uppercase">
                <Monitor size={16} /> View Live Site
             </button>
          </div>
        </div>

        {/* Modular Navigation - Scrollable on mobile */}
        <div className="mb-12 sm:mb-16 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 sm:gap-3 bg-slate-50 p-2 sm:p-3 rounded-2xl sm:rounded-[2.5rem] border border-slate-200/50 w-max sm:w-fit">
             {[
               { id: 'hero', name: 'Header', icon: Home },
               { id: 'about', name: 'Story', icon: Info },
               { id: 'mission', name: 'Mission', icon: Target },
               { id: 'services', name: 'Services', icon: Utensils },
               { id: 'contact', name: 'Contact', icon: Phone }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as Tab)}
                 className={`
                   flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap
                   ${activeTab === tab.id ? 'bg-white text-orange-600 shadow-lg sm:shadow-xl border border-orange-100 sm:scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}
                 `}
               >
                 <tab.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                 {tab.name}
               </button>
             ))}
          </div>
        </div>

        <div className="space-y-24 animate-in fade-in duration-700">
              
              {activeTab === 'hero' && (
                <div className="space-y-16">
                   <SectionHeader icon={Home} title="Entrance & Hero" subtitle="Main headline and call-to-action" section="hero" onSave={handleSave} saving={savingSection === 'hero'} />
                   <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-16 border-2 border-slate-50 shadow-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                         <InputField label="Headline Line 1 (Taste the)" value={settings.hero.line1} onChange={(val:any) => setSettings({...settings, hero: {...settings.hero, line1: val}})} placeholder="Ex: Taste the" />
                         <InputField label="Accent Word (Comfort)" value={settings.hero.accentLine} onChange={(val:any) => setSettings({...settings, hero: {...settings.hero, accentLine: val}})} accent={true} placeholder="Ex: Comfort" />
                         <InputField label="Emphasis Text (Home-Cooked..)" value={settings.hero.redLine} onChange={(val:any) => setSettings({...settings, hero: {...settings.hero, redLine: val}})} placeholder="Ex: Quality Meals" />
                      </div>
                      <div className="mt-12">
                         <InputField isTextarea label="Main Narrative Subtext" value={settings.hero.description} onChange={(val:any) => setSettings({...settings, hero: {...settings.hero, description: val}})} />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-16 items-start border-t border-slate-100 pt-16">
                         <div className="space-y-10">
                            <div className="grid grid-cols-2 gap-8">
                               <InputField label="Rating Badge" value={settings.hero.ratingText} onChange={(val:any) => setSettings({...settings, hero: {...settings.hero, ratingText: val}})} />
                               <InputField label="Customer Badge" value={settings.hero.activeUsersText} onChange={(val:any) => setSettings({...settings, hero: {...settings.hero, activeUsersText: val}})} />
                            </div>
                            <InputField label="Main Visual URL" value={settings.hero.mainImage} onChange={(val:any) => setSettings({...settings, hero: {...settings.hero, mainImage: val}})} icon={ImageIcon} />
                         </div>
                         <div className="rounded-[4rem] overflow-hidden border-[20px] border-slate-50 shadow-inner group relative">
                             <div className="absolute inset-0 bg-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10">
                                <span className="bg-white text-slate-900 px-6 py-2 rounded-full font-black text-xs uppercase">Live Preview</span>
                             </div>
                             <img src={settings.hero.mainImage} alt="Hero" className="w-full aspect-[16/10] object-cover transition-transform duration-1000 group-hover:scale-110" />
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-16">
                   <SectionHeader icon={Info} title="Our Story" subtitle="About experience and core values" section="about" onSave={handleSave} saving={savingSection === 'about'} />
                   <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-16 border-2 border-slate-50 shadow-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <InputField label="Section Accent Label" value={settings.about.heading} onChange={(val:any) => setSettings({...settings, about: {...settings.about, heading: val}})} />
                         <InputField label="Exp Counter Text" value={settings.about.experienceText} onChange={(val:any) => setSettings({...settings, about: {...settings.about, experienceText: val}})} accent={true} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
                         <InputField label="Title Segment 1" value={settings.about.titleLine1} onChange={(val:any) => setSettings({...settings, about: {...settings.about, titleLine1: val}})} />
                         <InputField label="Title Accent" value={settings.about.titleAccent} onChange={(val:any) => setSettings({...settings, about: {...settings.about, titleAccent: val}})} accent={true} />
                         <InputField label="Title Segment 2" value={settings.about.titleLine2} onChange={(val:any) => setSettings({...settings, about: {...settings.about, titleLine2: val}})} />
                      </div>
                      <div className="mt-12">
                         <InputField isTextarea label="Brand Narrative" value={settings.about.description} onChange={(val:any) => setSettings({...settings, about: {...settings.about, description: val}})} />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mt-16 border-t border-slate-100 pt-16">
                         <div className="space-y-12">
                            <div className="grid grid-cols-2 gap-10">
                               <div className="space-y-6">
                                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">Feature 01</p>
                                  <InputField label="Card Title" value={settings.about.feature1Title} onChange={(val:any) => setSettings({...settings, about: {...settings.about, feature1Title: val}})} />
                                  <InputField label="Description" value={settings.about.feature1Sub} onChange={(val:any) => setSettings({...settings, about: {...settings.about, feature1Sub: val}})} />
                               </div>
                               <div className="space-y-6">
                                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">Feature 02</p>
                                  <InputField label="Card Title" value={settings.about.feature2Title} onChange={(val:any) => setSettings({...settings, about: {...settings.about, feature2Title: val}})} />
                                  <InputField label="Description" value={settings.about.feature2Sub} onChange={(val:any) => setSettings({...settings, about: {...settings.about, feature2Sub: val}})} />
                               </div>
                            </div>
                            <div className="bg-slate-50 p-10 rounded-[2.5rem] relative">
                               <Quote size={40} className="text-orange-200 absolute -top-5 -left-5 bg-white rounded-full p-2" />
                               <InputField isTextarea label="Main Philosophical Quote" value={settings.about.quoteText} onChange={(val:any) => setSettings({...settings, about: {...settings.about, quoteText: val}})} />
                            </div>
                         </div>
                         <div className="space-y-10">
                            <InputField label="Story Visual URL" value={settings.about.image} onChange={(val:any) => setSettings({...settings, about: {...settings.about, image: val}})} icon={ImageIcon} />
                            <div className="rounded-[4rem] overflow-hidden border-[16px] border-slate-50 shadow-2xl relative group">
                               <img src={settings.about.image} alt="About" className="w-full aspect-square object-cover" />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'mission' && (
                <div className="space-y-16">
                   <SectionHeader icon={Target} title="Mission & Purpose" subtitle="Core values and mission statement" section="mission" onSave={handleSave} saving={savingSection === 'mission'} />
                   <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-16 border-2 border-slate-50 shadow-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <InputField label="Value Label" value={settings.mission.heading} onChange={(val:any) => setSettings({...settings, mission: {...settings.mission, heading: val}})} />
                         <InputField label="Power Phrase" value={settings.mission.titleAccent} onChange={(val:any) => setSettings({...settings, mission: {...settings.mission, titleAccent: val}})} accent={true} />
                      </div>
                      <div className="mt-12">
                         <InputField label="Primary Mission Headline" value={settings.mission.titleLine1} onChange={(val:any) => setSettings({...settings, mission: {...settings.mission, titleLine1: val}})} />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mt-16 border-t border-slate-100 pt-16">
                         <div className="space-y-10">
                            <InputField isTextarea label="Full Mission Text" value={settings.mission.description} onChange={(val:any) => setSettings({...settings, mission: {...settings.mission, description: val}})} />
                            <div className="space-y-6">
                               <InputField label="Primary Visual" value={settings.mission.image} onChange={(val:any) => setSettings({...settings, mission: {...settings.mission, image: val}})} icon={ImageIcon} />
                               <InputField label="Secondary Visual" value={settings.mission.image2} onChange={(val:any) => setSettings({...settings, mission: {...settings.mission, image2: val}})} icon={ImageIcon} />
                            </div>
                         </div>
                         <div className="grid grid-cols-1 gap-8 rounded-[4rem] bg-slate-50 p-8 border-2 border-slate-100">
                             <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-white h-[200px]">
                                <img src={settings.mission.image} alt="M1" className="w-full h-full object-cover" />
                             </div>
                             <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-white h-[200px]">
                                <img src={settings.mission.image2} alt="M2" className="w-full h-full object-cover" />
                             </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'services' && (
                <div className="space-y-16">
                   <SectionHeader icon={Utensils} title="Service Showcase" subtitle="Manage your service items and headings" section="services" onSave={handleSave} saving={savingSection === 'services'} />
                   <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-16 border-2 border-slate-50 shadow-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <InputField label="Intro Small Label" value={settings.services.heading} onChange={(val:any) => setSettings({...settings, services: {...settings.services, heading: val}})} />
                         <InputField label="Main Grid Title" value={settings.services.title} onChange={(val:any) => setSettings({...settings, services: {...settings.services, title: val}})} accent={true} />
                      </div>
                      <div className="mt-12">
                         <InputField isTextarea label="Services Section Subtext" value={settings.services.subDesc} onChange={(val:any) => setSettings({...settings, services: {...settings.services, subDesc: val}})} />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 border-t border-slate-100 pt-16">
                         {[1, 2, 3].map((num) => (
                           <div key={num} className="bg-slate-50 p-10 rounded-[3rem] border border-slate-200/40 space-y-8 flex flex-col justify-between hover:bg-orange-50/20 transition-colors">
                              <div className="space-y-6">
                                 <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">Card Item 0{num}</p>
                                 <InputField label="Item Title" value={settings.services[`item${num}Title`]} onChange={(val:any) => setSettings({...settings, services: {...settings.services, [`item${num}Title`]: val}})} />
                                 <InputField isTextarea label="Item Description" value={settings.services[`item${num}Desc`]} onChange={(val:any) => setSettings({...settings, services: {...settings.services, [`item${num}Desc`]: val}})} />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-16">
                   <SectionHeader icon={Phone} title="Global Configuration" subtitle="Contact info and footer branding" section="contact" onSave={handleSave} saving={savingSection === 'contact'} />
                   <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-16 border-2 border-slate-50 shadow-2xl">
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
                          <InputField label="Support Phone" value={settings.contact.phone} onChange={(val:any) => setSettings({...settings, contact: {...settings.contact, phone: val}})} icon={Phone} />
                          <InputField label="Official Email" value={settings.contact.email} onChange={(val:any) => setSettings({...settings, contact: {...settings.contact, email: val}})} icon={Mail} />
                          <InputField label="Business Address" value={settings.contact.address} onChange={(val:any) => setSettings({...settings, contact: {...settings.contact, address: val}})} icon={MapPin} />
                          <InputField label="Working Hours" value={settings.contact.workingHours} onChange={(val:any) => setSettings({...settings, contact: {...settings.contact, workingHours: val}})} icon={Clock} />
                       </div>
                      
                      <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-16 border-t border-slate-100 pt-16">
                         <div className="space-y-12">
                            <p className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] flex items-center gap-2 underline underline-offset-8">Social Ecosystem</p>
                            <div className="grid grid-cols-1 gap-8">
                               <InputField label="Instagram Profile Link" value={settings.contact.instagram} onChange={(val:any) => setSettings({...settings, contact: {...settings.contact, instagram: val}})} accent={true} />
                               <InputField label="Facebook Page Link" value={settings.contact.facebook} onChange={(val:any) => setSettings({...settings, contact: {...settings.contact, facebook: val}})} accent={true} />
                            </div>
                         </div>
                         <div className="bg-slate-900 p-12 rounded-[4rem] text-white space-y-10 shadow-2xl shadow-slate-300">
                            <div className="space-y-2">
                               <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><MessageSquare size={14} /> Global Footer Settings</p>
                               <h4 className="text-2xl font-black tracking-tight">Identity Branding</h4>
                            </div>
                            <div className="space-y-8">
                               <InputField label="Footer Name/Title" value={settings.contact.footerTitle} onChange={(val:any) => setSettings({...settings, contact: {...settings.contact, footerTitle: val}})} />
                               <InputField label="Footer Tagline/Msg" value={settings.contact.footerMsg} onChange={(val:any) => setSettings({...settings, contact: {...settings.contact, footerMsg: val}})} />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}

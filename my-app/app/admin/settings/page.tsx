"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save, Mail, Phone, MapPin, Clock, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    email: "",
    phone: "",
    address: "",
    workingHours: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data);
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
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (err) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading Settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 uppercase">Site Configuration</h1>
        <p className="text-gray-500 font-bold">Manage the information displayed on the website's contact sections.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-3">
              <Mail size={14} /> Support Email
            </label>
            <input 
              type="email" 
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-orange-500 transition-all font-bold text-gray-800"
              placeholder="e.g. support@tiffin.app"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-3">
              <Phone size={14} /> Contact Phone
            </label>
            <input 
              type="text" 
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-orange-500 transition-all font-bold text-gray-800"
              placeholder="e.g. +91 99999 99999"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-3">
            <MapPin size={14} /> Physical Address
          </label>
          <textarea 
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            rows={2}
            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-orange-500 transition-all font-bold text-gray-800 resize-none"
            placeholder="Kitchen HQ address..."
          />
        </div>

        <div>
           <label className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-3">
             <Clock size={14} /> Working Hours
           </label>
           <input 
             type="text" 
             value={settings.workingHours}
             onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
             className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-orange-500 transition-all font-bold text-gray-800"
             placeholder="e.g. 9:00 AM - 10:00 PM"
           />
        </div>

        <div className="pt-6 border-t border-gray-50 flex justify-end">
           <button 
             type="submit" 
             disabled={saving}
             className="flex items-center gap-2 px-10 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all active:scale-95 disabled:opacity-50"
           >
             {saving ? "Saving Changes..." : <><Save size={18} /> Update Content</>}
           </button>
        </div>
      </form>
      
      <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-4">
         <Globe className="text-blue-500 shrink-0 mt-1" size={20} />
         <p className="text-sm font-bold text-blue-900/70 leading-relaxed">
           <strong>Pro Tip:</strong> Updates made here will reflect globally across the main website's Footer, Contact Page, and Support sections in real-time.
         </p>
      </div>
    </div>
  );
}

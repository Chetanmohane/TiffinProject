"use client";
import { useEffect, useState } from "react";
import { User, Shield, MapPin, Phone, Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    password: "",
  });
  const [originalEmail, setOriginalEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const email = user?.email;

    if (email) {
      setOriginalEmail(email);
      fetch(`/api/customer/settings?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          setForm({ ...data, password: "" });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/customer/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, originalEmail })
      });
      
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        // Update local storage if email/name changed
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...user, name: form.name, email: form.email }));
        setOriginalEmail(form.email);
        setForm(prev => ({ ...prev, password: "" }));
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update profile" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-100 border-t-orange-500"></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase">
            Profile Settings <span className="text-orange-500">⚙️</span>
          </h1>
          <p className="text-sm font-bold text-gray-400">Manage your account preferences and security</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm animate-in fade-in slide-in-from-top-4 ${
            message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
                <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                   👤
                </div>
                <h3 className="text-xl font-black text-gray-900 truncate">{form.name || "User"}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 mb-4">Premium Member</p>
                <div className="inline-flex px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-lg uppercase tracking-widest">Active Status</div>
                
                <div className="absolute top-0 right-0 p-8 text-gray-50 opacity-10 group-hover:rotate-12 transition-transform">
                   <User size={120} />
                </div>
             </div>

             <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-gray-300">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Need Help?</h4>
                <p className="text-sm font-bold text-gray-300 mb-6 italic">"Our support team is here for you 24/7 if you have any issues with your profile."</p>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors">Contact Support</button>
             </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Info Card */}
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
               <div className="flex items-center gap-3 mb-8">
                  <div className="bg-orange-100 p-2.5 rounded-2xl text-orange-600">
                     <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 uppercase text-sm tracking-tight">Personal Information</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Basic details about you</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Full Name</label>
                    <div className="relative">
                       <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input 
                         type="text" 
                         value={form.name} 
                         onChange={(e) => setForm({...form, name: e.target.value})}
                         className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold border-none outline-none ring-2 ring-transparent focus:ring-orange-500/20 transition-all" 
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email Address</label>
                    <div className="relative">
                       <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input 
                         type="email" 
                         value={form.email} 
                         onChange={(e) => setForm({...form, email: e.target.value})}
                         className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold border-none outline-none ring-2 ring-transparent focus:ring-orange-500/20 transition-all" 
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Phone Number</label>
                    <div className="relative">
                       <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input 
                         type="tel" 
                         value={form.phone} 
                         onChange={(e) => setForm({...form, phone: e.target.value})}
                         className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold border-none outline-none ring-2 ring-transparent focus:ring-orange-500/20 transition-all" 
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Delivery Address</label>
                    <div className="relative">
                       <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input 
                         type="text" 
                         value={form.address} 
                         onChange={(e) => setForm({...form, address: e.target.value})}
                         className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold border-none outline-none ring-2 ring-transparent focus:ring-orange-500/20 transition-all" 
                       />
                    </div>
                  </div>
               </div>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
               <div className="flex items-center gap-3 mb-8">
                  <div className="bg-orange-100 p-2.5 rounded-2xl text-orange-600">
                     <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 uppercase text-sm tracking-tight">Security & Password</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Secure your authentication</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Manual Password Update</label>
                    <div className="relative md:w-2/3">
                       <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input 
                         type="password" 
                         autoComplete="new-password"
                         placeholder="Type new password here..." 
                         value={form.password}
                         onChange={(e) => setForm({...form, password: e.target.value})}
                         className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-orange-500/20 transition-all" 
                       />
                    </div>
                  </div>

                   <div className="pt-6 border-t border-dashed border-gray-100">
                    <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-1 text-center md:text-left">
                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">One-Click Security Reset</p>
                        <p className="text-xs font-bold text-gray-400 max-w-xs">We&apos;ll send a secure, time-limited link to <span className="text-orange-500">{form.email}</span> to reset your password safely.</p>
                      </div>
                      <button 
                        disabled={emailSending}
                        onClick={async () => {
                          setEmailSending(true);
                           try {
                             const res = await fetch("/api/auth/forgot-password", {
                               method: "POST",
                               body: JSON.stringify({ email: form.email })
                             });
                             const data = await res.json();
                             if (data.success) {
                               setMessage({ type: "success", text: "Magic link sent to your inbox! Check now. 🎉" });
                             } else {
                               setMessage({ type: "error", text: data.error || "Failed to send link" });
                             }
                           } catch (e) {
                              setMessage({ type: "error", text: "Error sending email" });
                           } finally {
                              setEmailSending(false);
                           }
                        }}
                        className={`
                          px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap flex items-center gap-3
                          ${emailSending ? "bg-gray-100 text-gray-400" : "bg-gray-900 text-white hover:bg-orange-600 shadow-xl shadow-gray-200 hover:shadow-orange-200 active:scale-95"}
                        `}
                      >
                        {emailSending ? <Loader2 className="animate-spin" size={14} /> : <Shield size={14} />}
                        {emailSending ? "Sending Link..." : "Send Reset Link"}
                      </button>
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-end gap-4">
               <button 
                 onClick={() => window.location.reload()}
                 className="px-8 py-3 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSave} 
                 disabled={saving}
                 className="px-10 py-4 bg-orange-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
               >
                 {saving ? <Loader2 className="animate-spin" size={16} /> : "Update Profile"}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

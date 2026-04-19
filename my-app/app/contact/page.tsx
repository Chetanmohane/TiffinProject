"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/common/Navbar";
import { Mail, MapPin, Phone, Send, Bot, User as UserIcon, Clock, ShieldCheck, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hi! I'm Tiffin's AI Chef Assistant powered by Groq. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => setSiteSettings(data))
      .catch(err => console.error("Failed to load settings", err));
  }, []);
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput };
    const history = [...messages, userMsg];
    setMessages(history);
    setChatInput("");
    setChatLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/customer/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages([...history, { role: "assistant", content: data.message }]);
      } else {
        setMessages([...history, { role: "assistant", content: "I am having trouble picking up the signal." }]);
      }
    } catch (err) {
      setMessages([...history, { role: "assistant", content: "Oops! Something went wrong on my end." }]);
    } finally {
      setChatLoading(false);
      scrollToBottom();
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAFCFF] pt-8 pb-16 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-100/40 rounded-full blur-[150px] -mr-64 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px] -ml-48"></div>
 
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-6">
             <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-widest mb-6 border border-orange-100 shadow-sm">
                <Zap size={14} fill="currentColor" />
                24/7 Instant Support
             </span>
             <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-4">
                Let's stay in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Touch.</span>
             </h1>
             <p className="text-xl text-gray-500 font-bold leading-relaxed opacity-80">
                Whether you need help with a custom meal plan, delivery status, or feedback—we are here for you.
             </p>
          </div>
 
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Formal Contact Form */}
            <div className="lg:col-span-5 space-y-6">
               <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-white rounded-[3rem] p-6 lg:p-8 shadow-2xl shadow-gray-200/50 border border-gray-100"
               >
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
                        <Mail size={28} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Email us</h3>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Formal Inquiries</p>
                     </div>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const payload = Object.fromEntries(formData.entries());
                      const btn = e.currentTarget.querySelector('button');
                      if(btn) btn.disabled = true;
                      
                      try {
                        const res = await fetch("/api/contact", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload)
                        });
                        const data = await res.json();
                        if(data.success) {
                          toast.success("🎉 Message sent successfully! We will get back to you soon.");
                          (e.target as HTMLFormElement).reset();
                        } else {
                          toast.error("⚠️ Oops: " + (data.error || data.message));
                        }
                      } catch (err) {
                        toast.error("❌ Failed to send message.");
                      } finally {
                        if(btn) btn.disabled = false;
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <input type="text" name="name" required placeholder="Full Name" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-orange-500/50 transition-all font-bold text-sm" />
                    </div>
                    <div>
                      <input type="email" name="email" required placeholder="Email Address" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-orange-500/50 transition-all font-bold text-sm" />
                    </div>
                    <div>
                      <textarea name="message" required rows={2} placeholder="How can we help you?" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-orange-500/50 transition-all font-bold text-sm resize-none"></textarea>
                    </div>

                    <button type="submit" className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-orange-600 transition-all flex items-center justify-center gap-2 group shadow-xl hover:shadow-orange-200">
                      Send Message
                      <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
               </motion.div>

               <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-white rounded-[2.5rem] p-5 border border-gray-100 shadow-xl flex flex-col items-center text-center group hover:bg-orange-50 transition-all"
                  >
                     <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-2 group-hover:bg-white shadow-sm transition-all">
                        <MapPin size={18} />
                     </div>
                     <p className="font-bold text-[10px] text-gray-700 leading-tight">{siteSettings?.address || "Tech Park, Mumbai"}</p>
                  </motion.div>
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.1 }}
                     className="bg-white rounded-[2.5rem] p-5 border border-gray-100 shadow-xl flex flex-col items-center text-center group hover:bg-blue-50 transition-all"
                  >
                     <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-2 group-hover:bg-white shadow-sm transition-all">
                        <Phone size={18} />
                     </div>
                     <p className="font-bold text-[10px] text-gray-700 leading-tight">{siteSettings?.phone || "+91 999 9999"}</p>
                  </motion.div>
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                     className="bg-white rounded-[2.5rem] p-5 border border-gray-100 shadow-xl flex flex-col items-center text-center group hover:bg-orange-50 transition-all"
                  >
                     <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-2 group-hover:bg-white shadow-sm transition-all">
                        <Clock size={18} />
                     </div>
                     <p className="font-bold text-[10px] text-gray-700 leading-tight">{siteSettings?.workingHours || "9:00 AM - 10:00 PM"}</p>
                  </motion.div>
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.3 }}
                     className="bg-white rounded-[2.5rem] p-5 border border-gray-100 shadow-xl flex flex-col items-center text-center group hover:bg-green-50 transition-all"
                  >
                     <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-2 group-hover:bg-white shadow-sm transition-all">
                        <Globe size={18} />
                     </div>
                     <p className="font-bold text-[10px] text-gray-700 leading-tight">@tiffin_official</p>
                  </motion.div>
               </div>
            </div>

            {/* Right Side: Groq AI Chat */}
            <div className="lg:col-span-7">
               <motion.div 
                 initial={{ opacity: 0, x: 30 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col h-[700px] overflow-hidden relative"
               >
                  <div className="bg-gray-900 p-8 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                         <div className="w-14 h-14 bg-orange-500 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-orange-500/40">
                           <Bot size={28} />
                         </div>
                         <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-gray-900 rounded-full animate-pulse"></div>
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-2xl font-black tracking-tight">Tiffin AI bot</h4>
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1">
                            <Zap size={10} fill="currentColor" />
                            Powered by LLaMA 3.3 (Groq Node)
                         </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-8 bg-gradient-to-b from-gray-50 to-white"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {messages.map((m, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-md border
                          ${m.role === 'user' ? 'bg-orange-500 text-white border-orange-400' : 'bg-white text-gray-900 border-gray-100'}`}
                        >
                          {m.role === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
                        </div>
                        <div className={`max-w-[70%] p-5 rounded-[1.5rem] text-[15px] font-bold leading-relaxed shadow-sm
                          ${m.role === 'user' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}
                        >
                          {m.content}
                        </div>
                      </motion.div>
                    ))}
                    {chatLoading && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100 text-gray-900 flex items-center justify-center shadow-md">
                          <Bot size={20} />
                        </div>
                        <div className="p-5 bg-white border border-gray-100 rounded-[1.5rem] rounded-tl-none flex gap-2 items-center h-[62px]">
                          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                    <div className="relative flex items-center bg-gray-50 rounded-[2.5rem] border border-gray-200 p-2 focus-within:ring-2 ring-orange-500/50 transition-all shadow-inner">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask me anything..."
                        className="w-full pl-6 pr-16 py-4 bg-transparent text-sm font-bold outline-none text-gray-800 placeholder:text-gray-400"
                      />
                      <button 
                        onClick={handleSendMessage}
                        disabled={chatLoading}
                        className="group absolute right-3 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                      >
                        <Send size={18} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                       <ShieldCheck size={12} />
                       AI Moderated End-to-End Encrypted Session
                    </div>
                  </div>
               </motion.div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <motion.div 
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mt-32 max-w-4xl mx-auto"
        >
           <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Frequently Asked <span className="text-orange-600">Questions</span></h2>
              <p className="text-gray-500 font-bold">Everything you need to know about our service and delivery.</p>
           </div>
           
           <div className="space-y-4">
              {[
                 { q: "How do I pause my meal delivery?", a: "You can easily pause your meals from the Customer Dashboard under the 'Pause' section. Simply select your dates and we'll handle the rest." },
                 { q: "What are your delivery timings?", a: "We deliver breakfast from 7-9 AM and lunch/dinner from 11-1 PM & 7-9 PM respectively." },
                 { q: "Can I customize my menu?", a: "Yes! Our AI Chef can help you with specific dietary requirements, or you can use the 'Menu' section in your dashboard." },
                 { q: "How secure is my payment?", a: "We use Cashfree Payments, which is PCI-DSS compliant and supports 128-bit encryption for all transactions." }
              ].map((faq, i) => (
                 <div key={i} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-md hover:shadow-xl transition-all cursor-pointer group">
                    <h4 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-3">
                       <div className="w-2 h-2 bg-orange-500 rounded-full group-hover:scale-150 transition-all"></div>
                       {faq.q}
                    </h4>
                    <p className="text-gray-500 font-bold text-sm leading-relaxed pl-5">{faq.a}</p>
                 </div>
              ))}
           </div>
        </motion.div>

        {/* Footer Note */}
        <div className="mt-24 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
             © 2026 Annapurna Tiffin Services • Made with ❤️ for food lovers
           </p>
        </div>
      </div>
    </>
  );
}

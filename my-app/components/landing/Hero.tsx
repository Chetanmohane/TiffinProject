"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Clock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const Hero = ({ initialData }: { initialData?: any }) => {
  const [user, setUser] = useState<any>(null);
  const [cms, setCms] = useState<any>(initialData || null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }

    // Still fetch fresh data just in case, but initial state is already set from server props
    const fetchCms = async () => {
      try {
        const res = await fetch("/api/admin/settings?t=" + new Date().getTime(), { 
          cache: 'no-store'
        });
        const data = await res.json();
        if (data.success && data.settings) {
          setCms(data.settings.hero);
        }
      } catch (err) {}
    };
    fetchCms();
  }, []);

  const line1 = cms?.line1 || "Taste the";
  const accentLine = cms?.accentLine || "Comfort";
  const redLine = cms?.redLine || "Home-Cooked Meals";
  const heroDesc = cms?.description || "Fresh, hygienic, and deliciously crafted tiffin meals delivered daily. We bring the warmth of a mother's kitchen straight to your doorstep.";
  const heroImg = cms?.mainImage || "/food2.PNG";
  const ratingText = cms?.ratingText || "4.9/5 Rating";
  const activeText = cms?.activeUsersText || "500+ Active";

  return (
    <section id="home" className="w-full min-h-screen pt-20 sm:pt-28 pb-12 sm:pb-20 bg-white relative overflow-hidden flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-20">
        
        {/* TEXT CONTENT */}
        <div className="w-full lg:w-[55%] text-center lg:text-left z-10 pt-10 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-50 rounded-full text-orange-600 font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Premium Tiffin Service
          </motion.div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-gray-900 leading-[1.2] sm:leading-tight tracking-tight mb-6">
            <span className="block mb-2">{line1}</span>
            <span className="relative inline-block mr-2 sm:mr-3">
              <span className="relative z-10 text-orange-600 italic px-1 sm:px-2">{accentLine}</span>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute bottom-1 sm:bottom-2 left-0 h-2 sm:h-4 bg-orange-100 -z-0"
              />
            </span>
            <span className="text-red-500">{redLine}</span>
          </h1>

          <p className="text-sm sm:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
            {heroDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            {user ? (
              <Link
                href="/customer/dashboard"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-orange-200 text-xs sm:text-sm uppercase tracking-widest"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <Link href="/register" className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-orange-200 text-xs sm:text-sm uppercase tracking-widest border border-orange-500">
                Order Your First Meal <ArrowRight size={18} />
              </Link>
            )}
            <Link href="#plans" className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-gray-900 font-black rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all active:scale-95 text-center text-xs sm:text-sm uppercase tracking-widest">
              View Plans
            </Link>
          </div>

          <div className="mt-10 sm:mt-12 flex items-center justify-center lg:justify-start gap-6 sm:gap-8 border-t border-gray-100 pt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-black text-gray-900 uppercase">100% Hygienic</p>
                <p className="text-[10px] text-gray-400 font-bold">FSSAI Certified</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Clock size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-black text-gray-900 uppercase">Daily Fresh</p>
                <p className="text-[10px] text-gray-400 font-bold">Hot & Timing</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT - IMAGE */}
        <div className="w-full lg:flex-1 relative mt-10 lg:mt-0">
          <div className="relative group max-w-2xl mx-auto">
            {/* Background decorative glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500/20 to-red-500/20 rounded-[3rem] blur-2xl group-hover:scale-105 transition-transform duration-700" />
            
            <div className="relative z-10 rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden border-4 sm:border-8 border-white shadow-2xl">
              <Image
                src={heroImg}
                alt="Delicious Tiffin Food"
                width={800}
                height={800}
                className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-1000"
                priority
              />
            </div>

            {/* Float Badges - Hidden on very small screens to avoid clutter */}
            <div className="absolute -top-5 -right-2 sm:-right-8 bg-white p-3 sm:p-4 rounded-2xl shadow-2xl z-20 flex items-center gap-3 border border-orange-50 transform hover:scale-105 transition-transform scale-75 sm:scale-100">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-200">
                <Star size={16} fill="currentColor" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-gray-900">{ratingText}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Global Rating</p>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-2 sm:-left-8 bg-white p-3 sm:p-4 rounded-2xl shadow-2xl z-20 flex items-center gap-3 border border-orange-50 transform hover:scale-105 transition-transform scale-75 sm:scale-100">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-gray-900">{activeText}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Verified Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

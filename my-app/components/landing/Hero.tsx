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
    <section id="home" className="w-full min-h-[90vh] sm:min-h-screen pt-24 sm:pt-28 pb-12 sm:pb-20 bg-white relative overflow-hidden flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        
        {/* TEXT CONTENT */}
        <div className="w-full lg:w-[55%] text-center lg:text-left z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full text-orange-600 font-bold text-xs sm:text-sm uppercase tracking-widest mb-6 sm:mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Premium Tiffin Service
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] sm:leading-tight tracking-tight mb-6 sm:mb-8">
            <span className="block mb-2">{line1}</span>
            <span className="relative inline-block mr-3">
              <span className="relative z-10 text-orange-600 italic px-2">{accentLine}</span>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute bottom-1 sm:bottom-2 left-0 h-3 sm:h-4 bg-orange-100 -z-0"
              />
            </span>
            <span className="text-red-500">{redLine}</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed">
            {heroDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
            {user ? (
              <Link
                href="/customer/dashboard"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <Link href="/register" className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                Order Your First Meal <ArrowRight size={18} />
              </Link>
            )}
            <Link href="#plans" className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-gray-900 font-bold rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all active:scale-95 text-center">
              View Plans
            </Link>
          </div>

          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-8 border-t border-gray-100 pt-6 sm:pt-8">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <ShieldCheck size={18} />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-gray-900">100% Hygienic</p>
                <p className="text-xs text-gray-500">FSSAI Certified</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Clock size={18} />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-gray-900">On-time Delivery</p>
                <p className="text-xs text-gray-500">Hot & Fresh</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT - IMAGE */}
        <div className="flex-1 relative w-full">
          <div className="relative z-10">
            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-4 sm:border-8 border-white shadow-2xl">
              <Image
                src={heroImg}
                alt="Delicious Tiffin Food"
                width={800}
                height={800}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            <div className="absolute -top-3 right-3 sm:-right-8 bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl z-20 flex items-center gap-2 sm:gap-3 border border-orange-50">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                <Star size={14} fill="currentColor" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">{ratingText}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Global Customer Rating</p>
              </div>
            </div>

            <div className="absolute -bottom-3 left-3 sm:-left-8 bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl z-20 flex items-center gap-2 sm:gap-3 border border-orange-50">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">{activeText}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Active Subscribers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

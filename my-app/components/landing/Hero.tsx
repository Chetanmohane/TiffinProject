"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Clock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const Hero = () => {
  const [user, setUser] = useState<any>(null);
  const [cms, setCms] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }

    const fetchCms = async () => {
      try {
        const res = await fetch("/api/admin/settings", { 
          cache: 'no-store',
          next: { revalidate: 0 } 
        });
        const data = await res.json();
        if (data.success && data.settings) {
          setCms(data.settings.hero);
        }
      } catch (err) {}
    };
    fetchCms();
  }, []);

  const heroLine1 = cms?.line1 || "Taste the";
  const heroAccent = cms?.accentLine || "Comfort";
  const heroFocus = cms?.redLine || "Home-Cooked";
  const heroDesc = cms?.description || "Fresh, hygienic, and deliciously crafted tiffin meals delivered daily. We bring the warmth of a mother's kitchen straight to your doorstep.";
  const heroImg = cms?.mainImage || "/food2.PNG";
  const ratingText = cms?.ratingText || "4.9/5 Rating";
  const activeText = cms?.activeUsersText || "500+ Active";

  return (
    <section className="relative w-full min-h-screen pt-20 sm:pt-24 pb-12 overflow-hidden bg-gradient-to-b from-orange-50/50 to-white">
      {/* Background Orbs - hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[400px] h-[400px] bg-orange-200/30 rounded-full blur-3xl -z-10"></div>
      <div className="hidden sm:block absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[300px] h-[300px] bg-red-100/40 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
        
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 font-semibold text-xs sm:text-sm mb-4 sm:mb-6">
            <Star size={14} fill="currentColor" />
            Top Rated Tiffin Service in the City
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-4 sm:mb-6">
            {heroLine1} <span className="text-orange-600 italic">{heroAccent}</span> of{" "}
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {heroFocus}
            </span>{" "}Meals
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

          {/* Trust Badges */}
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
        </motion.div>

        {/* RIGHT CONTENT - IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 relative w-full"
        >
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

            {/* Floating Badges - repositioned for mobile */}
            <div className="absolute -top-3 right-3 sm:-right-8 bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl z-20 flex items-center gap-2 sm:gap-3 border border-orange-50">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                <Star size={14} fill="currentColor" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">{ratingText}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">From 2k+ Users</p>
              </div>
            </div>

            <div className="absolute -bottom-3 left-3 sm:-left-8 bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl z-20 flex items-center gap-2 sm:gap-3 border border-orange-50">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <Image src={`https://i.pravatar.cc/100?u=${i}`} alt="user" width={32} height={32} />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">{activeText}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Daily Subscribers</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <StatsSection />
    </section>
  );
};

export default Hero;

const stats = [
  { value: "500+", label: "Daily Customers" },
  { value: "50k+", label: "Meals Delivered" },
  { value: "4.9", label: "Customer Rating" },
  { value: "15+", label: "Expert Chefs" },
];

export function StatsSection() {
  return (
    <section className="w-full mt-12 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-[2rem] sm:rounded-[3rem] px-6 sm:px-8 py-10 sm:py-16 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl"></div>
          {stats.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center relative z-10"
            >
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-1 sm:mb-2 tracking-tight">
                {item.value}
              </h3>
              <p className="text-gray-400 font-medium uppercase text-[10px] sm:text-xs tracking-wide">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

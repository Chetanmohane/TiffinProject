"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Star, Clock, ShieldCheck } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen pt-24 pb-12 overflow-hidden bg-gradient-to-b from-orange-50/50 to-white">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-red-100/40 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-center lg:text-left"
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm mb-6"
          >
            <Star size={16} fill="currentColor" />
             Top Rated Tiffin Service in the City
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6">
            Taste the <span className="text-orange-600 italic">Comfort</span> of <br />
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Home-Cooked
            </span> Meals
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
            Fresh, hygienic, and deliciously crafted tiffin meals delivered daily. We bring the warmth of a mother&apos;s kitchen straight to your doorstep.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button className="group relative px-8 py-4 bg-orange-600 text-white font-bold rounded-2xl overflow-hidden transition-all hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-200 active:scale-95">
              <span className="relative z-10 flex items-center gap-2">
                Order Your First Meal <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl border-2 border-gray-100 transition-all hover:border-orange-200 hover:bg-orange-50 active:scale-95">
              View Menu
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-8 border-t border-gray-100 pt-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">100% Hygienic</p>
                <p className="text-xs text-gray-500">FSSAI Certified</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Clock size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">On-time Delivery</p>
                <p className="text-xs text-gray-500">Hot & Fresh</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT CONTENT - IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex-1 relative"
        >
          {/* Main Image Container */}
          <div className="relative z-10 group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-orange-400 to-red-500 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl">
              <Image
                src="/food2.PNG"
                alt="Delicious Tiffin Food"
                width={800}
                height={800}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                priority
              />
            </div>

            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 lg:-right-12 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 border border-orange-50"
            >
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
                <Star size={18} fill="currentColor" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">4.9/5 Rating</p>
                <p className="text-xs text-gray-500">From 2k+ Users</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -left-6 lg:-left-12 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 border border-orange-50"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <Image src={`https://i.pravatar.cc/100?u=${i}`} alt="user" width={32} height={32} />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">500+ Active</p>
                <p className="text-xs text-gray-500">Daily Subscribers</p>
              </div>
            </motion.div>
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
    <section className="w-full mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-[3rem] px-8 py-12 md:py-16 grid grid-cols-2 lg:grid-cols-4 gap-8 relative overflow-hidden shadow-2xl">
          {/* Decorative Background for Stats */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl"></div>

          {stats.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center relative z-10"
            >
              <h3 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                {item.value}
              </h3>
              <p className="text-gray-400 font-medium tracking-wide uppercase text-xs sm:text-sm">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

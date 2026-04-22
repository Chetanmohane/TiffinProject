"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, CalendarDays, Utensils } from "lucide-react";

export default function MenuPage() {
  const [weeklyMenu, setWeeklyMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/menu")
      .then((res) => res.json())
      .then((data) => {
        // Filter out inactive days just in case
        const visibleMenu = (data.menu || []).filter((m: any) => m.isActive !== false);
        setWeeklyMenu(visibleMenu);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const currentDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Header Banner - Compact & Clean */}
      <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white pt-8 pb-16 px-6 shadow-md rounded-b-[2rem]">
        {/* Subtle patterned overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />
        
        <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-sm flex items-center gap-3">
              Weekly Menu 🍽️
            </h1>
            <p className="text-white/90 text-sm sm:text-base font-medium max-w-lg leading-snug">
              Explore our crafted, high-protein Tiffin meals mapped out for your week.
            </p>
          </div>
          
          <div className="hidden md:flex ml-auto items-center px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse mr-2" />
            Live Updates
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {weeklyMenu.map((item, index) => {
            const isToday = item.day === currentDayName;

            return (
              <motion.div
                variants={itemVariants}
                key={item.day}
                className={`relative bg-white rounded-3xl p-6 sm:p-8 flex flex-col transition-all duration-300
                  ${isToday ? 'border-2 border-orange-500 shadow-[0_10px_40px_rgba(255,100,0,0.15)] scale-[1.02]' : 'border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 hover:-translate-y-1'}
                `}
              >
                {/* Active Tag */}
                {isToday && (
                  <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-orange-400/50 backdrop-blur-md">
                    Today
                  </div>
                )}

                {/* Day Header */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100/80">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-[1.25rem] font-bold text-lg
                    ${isToday ? 'bg-orange-100 text-orange-600 shadow-inner' : 'bg-gray-50 text-gray-500'}`}
                  >
                    {item.day.substring(0, 1)}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    {item.day}
                  </h2>
                </div>

                {/* Meals */}
                <div className="space-y-5 flex-1">
                  
                  {/* Lunch Block */}
                  <div className="group">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun size={18} className="text-orange-500" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 group-hover:text-orange-500 transition-colors">
                        Lunch
                      </h3>
                    </div>
                    <div className="bg-gray-50/50 border border-gray-50 rounded-2xl p-4 group-hover:bg-orange-50/30 transition-colors">
                      <p className="text-gray-800 text-sm font-semibold leading-relaxed">
                        {item.lunch}
                      </p>
                    </div>
                  </div>

                  {/* Dinner Block */}
                  <div className="group">
                    <div className="flex items-center gap-2 mb-2">
                      <Moon size={18} className="text-indigo-400" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 group-hover:text-indigo-400 transition-colors">
                        Dinner
                      </h3>
                    </div>
                    <div className="bg-gray-50/50 border border-gray-50 rounded-2xl p-4 group-hover:bg-indigo-50/30 transition-colors">
                      <p className="text-gray-800 text-sm font-semibold leading-relaxed">
                        {item.dinner}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Action button mock hover */}
                {isToday && (
                  <div className="mt-auto pt-6 text-center">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 py-2 rounded-xl">Today's Selection</p>
                  </div>
                )}

              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}

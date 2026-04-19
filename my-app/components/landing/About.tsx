"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Utensils, Heart, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <section id="about" className="w-full bg-white py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* STORY SECTION 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
          {/* IMAGE SIDE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-xl">
              <Image
                src="/img1.webp"
                alt="Home style cooking"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Experience Badge */}
            <div className="absolute -bottom-4 right-4 sm:-bottom-8 sm:-right-4 bg-orange-600 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl">
              <p className="text-2xl sm:text-3xl font-black">10+</p>
              <p className="text-[10px] sm:text-xs uppercase font-bold tracking-widest opacity-80">Years of Love</p>
            </div>
          </motion.div>

          {/* TEXT SIDE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-1/2 pt-6 lg:pt-0"
          >
            <div className="flex items-center gap-2 text-orange-600 mb-4">
              <div className="h-0.5 w-6 bg-orange-600"></div>
              <span className="font-bold uppercase tracking-widest text-xs sm:text-sm">Our Humble Beginnings</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-5 sm:mb-8 leading-tight">
              Cooking with <span className="text-orange-600 italic">Tradition</span>, Serving with Soul
            </h2>

            <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
              Annapurna Delight started in a small kitchen with a big dream: to provide the warmth and comfort of <span className="text-gray-950 font-bold italic">&quot;Ghar Ka Khana&quot;</span> to everyone living away from home.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <Utensils size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-0.5">Pure Veg</h4>
                  <p className="text-sm text-gray-500 italic">Strictly vegetarian & fresh</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-0.5">Best Quality</h4>
                  <p className="text-sm text-gray-500 italic">Premium masalas & oil</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* STORY SECTION 2 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-24">
          {/* IMAGE SIDE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-xl">
              <Image
                src="/img2.webp"
                alt="Delicious Tiffin Meal"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          {/* TEXT SIDE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-1/2"
          >
            <div className="flex items-center gap-2 text-orange-600 mb-4">
              <div className="h-0.5 w-6 bg-orange-600"></div>
              <span className="font-bold uppercase tracking-widest text-xs sm:text-sm">Why We Do It</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-5 sm:mb-8 leading-tight">
              More Than Just a <span className="text-orange-600 italic">Tiffin</span> Service
            </h2>

            <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
              We understand that food is more than just fuel—it&apos;s an emotion. Our mission is to ensure that no student or professional has to compromise on their health or taste while chasing their dreams.
            </p>

            <div className="p-5 sm:p-8 bg-gray-50 rounded-[1.5rem] sm:rounded-[2rem] border-l-4 border-orange-500">
              <Heart className="text-orange-600 mb-3" size={28} fill="currentColor" opacity={0.2} />
              <p className="text-gray-900 font-bold italic text-base sm:text-xl">
                &quot;Every meal we prepare is treated as if it&apos;s for our own family. That is the Annapurna promise.&quot;
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

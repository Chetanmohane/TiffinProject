"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Utensils, Heart, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <section id="about" className="w-full bg-white py-24 sm:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* STORY SECTION 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 mb-32">
          {/* IMAGE SIDE */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-orange-100 rounded-full -z-10"></div>
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image
                src="/img1.webp"
                alt="Home style cooking"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Experience Badge */}
            <div className="absolute -bottom-8 -right-8 bg-orange-600 text-white p-8 rounded-3xl shadow-xl">
              <p className="text-3xl font-black">10+</p>
              <p className="text-xs uppercase font-bold tracking-widest opacity-80">Years of Love</p>
            </div>
          </motion.div>

          {/* TEXT SIDE */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <div className="flex items-center gap-2 text-orange-600 mb-6">
              <div className="h-0.5 w-8 bg-orange-600"></div>
              <span className="font-bold uppercase tracking-widest text-sm text-[0.7rem] sm:text-sm">Our Humble Beginnings</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-8 leading-tight">
              Cooking with <span className="text-orange-600 italic">Tradition</span>, Serving with Soul
            </h2>

            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              Annapurna Delight started in a small kitchen with a big dream: to provide the warmth and comfort of <span className="text-gray-950 font-bold italic">&quot;Ghar Ka Khana&quot;</span> to everyone living away from home.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <Utensils size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Pure Veg</h4>
                  <p className="text-sm text-gray-500 italic">Strictly vegetarian & fresh</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <Award size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Best Quality</h4>
                  <p className="text-sm text-gray-500 italic">Premium masalas & oil</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* STORY SECTION 2 */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-24">
          {/* TEXT SIDE */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
             <div className="flex items-center gap-2 text-orange-600 mb-6">
              <div className="h-0.5 w-8 bg-orange-600"></div>
              <span className="font-bold uppercase tracking-widest text-[0.7rem] sm:text-sm">Why We Do It</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-8 leading-tight">
              More Than Just a <span className="text-orange-600 italic">Tiffin</span> Service
            </h2>

            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              We understand that food is more than just fuel—it&apos;s an emotion. Our mission is to ensure that no student or professional has to compromise on their health or taste while chasing their dreams.
            </p>

            <div className="p-8 bg-gray-50 rounded-[2rem] border-l-4 border-orange-500">
               <Heart className="text-orange-600 mb-4" size={32} fill="currentColor" opacity={0.2} />
               <p className="text-gray-900 font-bold italic text-xl">
                 &quot;Every meal we prepare is treated as if it&apos;s for our own family. That is the Annapurna promise.&quot;
               </p>
            </div>
          </motion.div>

          {/* IMAGE SIDE */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-100 rounded-full -z-10"></div>
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl -rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image
                src="/img2.webp"
                alt="Delicious Tiffin Meal"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";

const items = [
  "Fresh Ingredients",
  "Home-Style Taste",
  "Hygienically Packed",
  "On-Time Delivery",
  "Weekly Specials",
  "Eco-Friendly Packaging",
  "Customize Menu",
  "No Preservatives",
];

export default function Marquee() {
  return (
    <div className="w-full bg-orange-600 py-6 overflow-hidden flex whitespace-nowrap border-y-4 border-orange-700">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
        className="flex gap-12 items-center"
      >
        {[...items, ...items].map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="text-white text-2xl font-black uppercase tracking-tighter">
              {item}
            </span>
            <span className="w-3 h-3 rounded-full bg-orange-300"></span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

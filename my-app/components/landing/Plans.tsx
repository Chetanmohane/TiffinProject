"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Flame } from "lucide-react";

export default function Plans() {
  return (
    <section id="plans" className="w-full bg-white py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Tailored <span className="text-orange-600">Plans</span> for You
          </h2>
          <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto">
            Choose a plan that fits your lifestyle. Flexible subscriptions with the ability to pause or cancel anytime.
          </p>
        </motion.div>

        {/* PLANS GRID */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <PlanCard
            title="Student Lite"
            price="₹2,200"
            desc="Perfect for light eaters or busy students."
            image="/img3.webp"
            features={[
              "Lunch OR Dinner",
              "5 Homestyle Rotis + Sabzi",
              "Mon–Sat Fresh Delivery",
              "Standard Packaging",
            ]}
            button="Get Started"
          />

          <PlanCard
            title="Standard Full"
            price="₹3,500"
            desc="A complete, balanced nutritional meal."
            image="/img4.webp"
            isPopular={true}
            features={[
              "Lunch AND Dinner",
              "Roti, Sabzi, Dal, & Rice",
              "Sunday Special Treat 🍰",
              "Flexible Pause/Resume",
              "Eco-friendly Packaging",
            ]}
            button="Most Popular"
          />

          <PlanCard
            title="Executive Premium"
            price="₹4,500"
            desc="For those who want variety and extra."
            image="/img5.webp"
            features={[
              "Lunch AND Dinner",
              "Salad + Sweet Included Daily",
              "Custom Menu Preferences",
              "Priority Customer Support",
              "Premium Reusable Tiffin",
            ]}
            button="Go Premium"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------- PLAN CARD ---------------- */

function PlanCard({
  title,
  price,
  desc,
  image,
  features,
  button,
  isPopular = false,
}: {
  title: string;
  price: string;
  desc: string;
  image: string;
  features: string[];
  button: string;
  isPopular?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className={`
        relative rounded-[2.5rem] p-8 flex flex-col h-full transition-all duration-500
        ${isPopular 
          ? "bg-gray-900 text-white shadow-2xl shadow-orange-200 ring-4 ring-orange-500/20" 
          : "bg-white border border-gray-100 shadow-xl hover:shadow-2xl shadow-gray-100"}
      `}
    >
      {isPopular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
          <Flame size={16} fill="white" />
          POPULAR CHOICE
        </div>
      )}

      {/* IMAGE */}
      <div className="relative w-full h-48 rounded-3xl overflow-hidden mb-8 group">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* CONTENT */}
      <div className="mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${isPopular ? "text-white" : "text-gray-900"}`}>
          {title}
        </h3>
        <p className={`text-sm ${isPopular ? "text-gray-400" : "text-gray-500"}`}>
          {desc}
        </p>
      </div>

      <div className="mb-8 flex items-baseline gap-1">
        <span className={`text-4xl font-black ${isPopular ? "text-orange-500" : "text-gray-900"}`}>
          {price}
        </span>
        <span className={`text-sm font-medium ${isPopular ? "text-gray-500" : "text-gray-400"}`}>
          / month
        </span>
      </div>

      {/* FEATURES */}
      <ul className="space-y-4 mb-10 flex-1">
        {features.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3"
          >
            <div className={`mt-1 p-0.5 rounded-full ${isPopular ? "bg-orange-500/20 text-orange-500" : "bg-green-100 text-green-600"}`}>
              <Check size={14} strokeWidth={4} />
            </div>
            <span className={`text-sm font-medium ${isPopular ? "text-gray-300" : "text-gray-600"}`}>
              {item}
            </span>
          </li>
        ))}
      </ul>

      {/* BUTTON */}
      <button
        className={`
          w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95
          ${isPopular 
            ? "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-900/20" 
            : "bg-gray-50 text-gray-900 border-2 border-gray-100 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600"}
        `}
      >
        {button}
      </button>
    </motion.div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Soup, 
  CalendarCheck, 
  IndianRupee, 
  Truck, 
  ShieldCheck, 
  Heart 
} from "lucide-react";

const services = [
  {
    title: "Home-Style Food",
    desc: "Authentic taste, cooked fresh daily using traditional recipes and premium ingredients.",
    icon: <Soup />,
    color: "bg-amber-100 text-amber-600",
  },
  {
    title: "Flexible Plans",
    desc: "Customized tiffin options to suit your schedule. Pause or resume with a single click.",
    icon: <CalendarCheck />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Budget Friendly",
    desc: "Quality meals at pocket-friendly prices. No hidden costs or delivery fees.",
    icon: <IndianRupee />,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Express Delivery",
    desc: "Our delivery partners ensure your meal arrives hot and on time, every single day.",
    icon: <Truck />,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "FSSAI Certified",
    desc: "We maintain the highest standards of kitchen hygiene and food safety protocols.",
    icon: <ShieldCheck />,
    color: "bg-red-100 text-red-600",
  },
  {
    title: "Made with Love",
    desc: "We treat every tiffin like it's for our own family, ensuring nutritional balance.",
    icon: <Heart />,
    color: "bg-pink-100 text-pink-600",
  },
];

const Services = () => {
  return (
    <section id="services" className="w-full bg-gray-50 py-24 sm:py-32 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center mb-20">
          <motion.h4 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-orange-600 font-bold uppercase tracking-widest text-sm mb-4"
          >
            The Annapurna Advantage
          </motion.h4>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 tracking-tight"
          >
            Why Thousands <span className="text-orange-600 italic underline decoration-orange-200">Trust</span> Us
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto"
          >
            We don&apos;t just deliver food; we deliver health, convenience, and a taste of home. Here is why we are unique.
          </motion.p>
        </div>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all group"
            >
              <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {React.isValidElement(item.icon) && React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 30 })}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                {item.title}
              </h3>

              <p className="text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="w-full bg-gradient-to-b from-orange-50 to-white overflow-hidden">
      <div className="w-full  mx-auto flex flex-col-reverse lg:flex-row items-center justify-between py-12 sm:py-16 px-4 sm:px-6 lg:px-16">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full lg:pl-45  lg:text-left sm:text-center "
        >
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-tight max-w-xl mx-auto lg:mx-0 lg:mt-14   ">
            <span className="text-orange-600">Home-Style</span> <span className="text-gray-900">Meals,</span>
            <br />
            <span className="text-gray-900">Delivered With{" "}</span>
            <span className="bg-linear-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Responsibility
            </span>{" "}
            🍽️
          </h1>

          <p className="mt-5 text-gray-500 text-base sm:text-lg lg:text-xl max-w-lg mx-auto lg:mx-0">
            Fresh, hygienic and delicious tiffin meals delivered daily to your
            doorstep. Taste the comfort of home in every bite.
          </p>

          {/* CTA BUTTONS */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start lg:my-10">
            <button className="bg-orange-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-orange-700 hover:scale-105 transition">
              View Plans
            </button>

            <button className="border border-orange-600 text-orange-600 px-6 py-3 rounded-lg hover:bg-orange-50 hover:scale-105 transition">
              Order Today
            </button>
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative w-full lg:w-1/2 flex justify-center mb-10 lg:mb-0 lg:pr-50"
        >
          {/* Glow */}
          <div className="absolute -inset-6 bg-orange-200 rounded-full blur-3xl opacity-40"></div>

          <Image
            src="/food2.PNG"
            alt="Delicious Tiffin Food"
            width={600}
            height={520}
            className="relative z-10 w-full lg:w-200 lg:w-100 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg drop-shadow-2xl hover:scale-105 transition duration-300"
            priority
          />
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
  { value: "4.8", label: "⭐ Rating" },
  { value: "15+", label: "Delivery Partners" },
];

export function StatsSection() {
  return (
    <section className="w-full overflow-hidden lg:mt-12">
      <div
        className="
          w-full
          bg-gradient-to-r from-orange-400 to-red-400
          px-4 sm:px-6 lg:px-12
          py-8 sm:py-10
          grid grid-cols-2 lg:grid-cols-4
          gap-y-6 gap-x-4
          place-items-center
        "
      >
        {stats.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.08 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-amber-50 drop-shadow-md">
              {item.value}
            </h1>

            <p className="text-gray-200 tracking-wide text-sm sm:text-base lg:text-lg mt-1 sm:mt-2">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

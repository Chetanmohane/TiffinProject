"use client";

import Image from "next/image";

export default function Plans() {
  return (
    <section className="w-full bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">
            Simple Plans
          </h2>
          <p className="text-orange-500 mt-2 text-base sm:text-lg lg:text-xl">
            Pause your subscription anytime. Money back for skipped meals.
          </p>
        </div>

        {/* PLANS GRID */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <PlanCard
            title="Student Lite"
            price="₹2200"
            desc="Perfect for light eaters or students."
            image="/img3.webp"
            features={[
              "Lunch OR Dinner",
              "5 Rotis + Sabzi",
              "Mon–Sat Delivery",
            ]}
            button="Select Plan"
          />

          <PlanCard
            title="Standard Full"
            price="₹3500"
            desc="A complete balanced meal."
            image="/img4.webp"
            features={[
              "Lunch AND Dinner",
              "Roti, Sabzi, Dal, Rice",
              "Sunday Special Treat",
              "Free Cancellation",
            ]}
            button="Select Plan"
          />

          <PlanCard
            title="Executive Premium"
            price="₹4500"
            desc="For those who want variety."
            image="/img5.webp"
            features={[
              "Lunch AND Dinner",
              "Salad + Sweet Daily",
              "Custom Menu Choice",
            ]}
            button="Select Plan"
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
}: {
  title: string;
  price: string;
  desc: string;
  image: string;
  features: string[];
  button: string;
}) {
  return (
    <div
      className="
        relative rounded-2xl border-2 border-orange-500 bg-white p-6
        flex flex-col
        transition-all duration-300 ease-out
        hover:-translate-y-2 hover:shadow-xl
        active:scale-[0.98]
      "
    >
      {/* IMAGE */}
      <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden mb-6">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="
            object-fill
            transition-transform duration-500 ease-in-out
            hover:scale-110 hover:rotate-2
            sm:hover:rotate-3
          "
        />
      </div>

      {/* CONTENT */}
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
        {title}
      </h3>

      <div className="mt-3">
        <span className="text-3xl sm:text-4xl font-bold text-gray-900">
          {price}
        </span>
        <span className="text-gray-500"> /mo</span>
      </div>

      <p className="text-gray-600 mt-2 text-sm sm:text-base">
        {desc}
      </p>

      {/* FEATURES */}
      <ul className="mt-6 space-y-3 flex-1">
        {features.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-gray-700 text-sm sm:text-base"
          >
            <span className="w-5 h-5 min-w-[20px] rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>

      {/* BUTTON */}
      <button
        className="
          mt-8 w-full py-3
          bg-orange-100 border-2 border-orange-400 text-orange-600
          rounded-lg font-semibold
          transition-all duration-300
          hover:bg-orange-500 hover:text-white
          focus:outline-none focus:ring-2 focus:ring-orange-400
        "
      >
        {button}
      </button>
    </div>
  );
}

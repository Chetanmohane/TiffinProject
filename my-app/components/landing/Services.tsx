import React from "react";
import { MdOutlineFoodBank } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { FaRupeeSign } from "react-icons/fa";
import { FiClock } from "react-icons/fi";

const Services = () => {
  return (
    <section className="w-full bg-gray-100 py-12 sm:py-16">
      {/* WHY CHOOSE US */}
      <div className="py-12 sm:py-16 px-4 sm:px-8 lg:px-20">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl text-center font-bold text-gray-800 mb-15">
          Why Choose Us?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {[
            {
              title: "Home-Style Food",
              desc: "Authentic taste, cooked fresh daily",
              icon: <MdOutlineFoodBank />,
            },
            {
              title: "Flexible Plans",
              desc: "Customized tiffin options to suit your needs",
              icon: <SlCalender />,
            },
            {
              title: "Affordable Pricing",
              desc: "Quality meals at pocket-friendly prices",
              icon: <FaRupeeSign />,
            },
            {
              title: "On-Time Delivery",
              desc: "Hot meals delivered when you need them",
              icon: <FiClock />,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="
                bg-gradient-to-r from-orange-100 to-red-50
                p-6 
                rounded-xl 
                shadow-md 
                text-center
                hover:shadow-lg
                hover:-translate-y-1
                transition py-10
              "
            >
              {/* ICON WRAPPER */}
              <div
                className="
                  w-20 h-20 sm:w-24 sm:h-24
                  bg-orange-500
                  flex items-center justify-center
                  mx-auto mb-6
                  rounded-2xl mt-5
                "
              >
                <div className="text-6xl sm:text-4xl text-white">
                  {item.icon}
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-2">
                {item.title}
              </h3>

              <p className="text-sm sm:text-base text-gray-600 mt-5">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

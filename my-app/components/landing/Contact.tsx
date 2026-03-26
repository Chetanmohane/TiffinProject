"use client";

export default function Contact() {
  return (
    <section
      id="contact"
      className="w-full bg-gradient-to-b from-orange-50 to-white py-12 sm:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">
            Contact Us
          </h2>
          <p className="text-gray-600 mt-2 text-base sm:text-lg lg:text-xl">
            Have questions? We’d love to hear from you.
          </p>
        </div>

        {/* CONTENT */}
        <div className="grid gap-8 lg:gap-10 md:grid-cols-2 items-stretch">

          {/* MAP */}
          <div className="w-full h-[260px] sm:h-[320px] md:h-full rounded-2xl overflow-hidden shadow-md">
            <iframe
              title="Location Map"
              src="https://www.google.com/maps?q=India&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>

          {/* FORM */}
          <form
            className="bg-white rounded-2xl shadow-md
            p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-5"
          >
            {/* NAME + EMAIL */}
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border border-gray-300 rounded-lg
                px-4 py-3 text-sm sm:text-base text-black
                focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full border border-gray-300 rounded-lg
                px-4 py-3 text-sm sm:text-base text-black
                focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* MOBILE */}
            <input
              type="tel"
              placeholder="Mobile Number"
              className="w-full border border-gray-300 rounded-lg
              px-4 py-3 text-sm sm:text-base text-black
              focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            {/* MESSAGE */}
            <textarea
              rows={4}
              placeholder="Your Message"
              className="w-full border border-gray-300 rounded-lg
              px-4 py-3 text-sm sm:text-base text-black
              focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />

            {/* BUTTON */}
            <button
              type="submit"
              className="
                w-full bg-orange-500 text-white py-3 rounded-lg
                font-semibold text-sm sm:text-base
                transition-all duration-300
                hover:bg-orange-600 active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-orange-400
              "
            >
              Send Message
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}

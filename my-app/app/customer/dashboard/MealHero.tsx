export default function MealHero() {
  return (
    <div
      className="relative bg-orange-400 rounded-3xl 
                    p-5 sm:p-6 lg:p-8 
                    border border-orange-100 shadow-sm 
                    overflow-hidden h-full"
    >
      {/* Background Decoration */}
      <div
        className="absolute -top-20 -right-20 w-40 sm:w-48 lg:w-56 h-40 sm:h-48 lg:h-56 
                      bg-orange-100/40 rounded-full"
      />

      <div
        className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 
                      text-4xl sm:text-5xl lg:text-7xl 
                      opacity-90 select-none"
      >
        🍴
      </div>

      <div
        className="relative flex flex-col md:flex-row 
                      justify-between items-start gap-6"
      >
        {/* Left Content */}
        <div className="space-y-4 sm:space-y-5 max-w-md">
          {/* Badge + Time */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className="bg-orange-100 text-[#FF7A00] 
                             text-[9px] sm:text-[10px] 
                             font-extrabold px-3 py-1 
                             rounded-full tracking-wide"
            >
              NEXT MEAL
            </span>

            <span
              className="text-gray-500 
                             text-xs sm:text-sm 
                             font-semibold uppercase tracking-wider"
            >
              ⏰ 01:00 PM
            </span>
          </div>

          {/* Meal Info */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 leading-tight">
              Lunch
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-2 leading-relaxed">
              4 Roti, Paneer Butter Masala, Dal Fry, Jeera Rice, Fresh Salad
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              className="bg-gradient-to-r from-orange-500 to-orange-400 
                         text-white text-xs font-extrabold 
                         px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl
                         shadow-lg shadow-orange-200/60
                         hover:opacity-90 transition"
            >
              Track Order
            </button>

            <button
              className="bg-white text-red-500 border border-red-200
                         text-xs font-extrabold 
                         px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl
                         hover:bg-red-50 transition"
            >
              Cancel Meal
            </button>
          </div>
        </div>

        {/* Right Icon (Tablet/Desktop) */}
        <div
          className="hidden md:flex items-center justify-center 
                        text-5xl lg:text-7xl"
        >
          🍱
        </div>
      </div>
    </div>
  );
}

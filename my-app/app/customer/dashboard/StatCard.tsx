interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  subtextClass?: string;
  buttonText?: string;
  icon: string;
}

export default function StatCard({
  title,
  value,
  subtext,
  subtextClass,
  buttonText,
  icon,
}: StatCardProps) {
  return (
    <div
      className="
        bg-orange-400 rounded-2xl sm:rounded-3xl
        p-4 sm:p-6
        border border-gray-300
        shadow-sm
        hover:shadow-xl hover:-translate-y-1
        transition-all duration-300
        h-full flex flex-col justify-between
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          {title}
        </p>

        <div
          className="
            w-8 h-8 sm:w-10 sm:h-10
            flex items-center justify-center
            rounded-lg sm:rounded-xl
            text-orange-600
            text-2xl sm:text-3xl
          "
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div>
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
          {value}
        </h3>

        {subtext && (
          <p
            className={`text-[10px] sm:text-[11px] font-bold mt-1 ${
              subtextClass ?? "text-gray-600"
            }`}
          >
            {subtext}
          </p>
        )}
      </div>

      {/* CTA Button */}
      {buttonText && (
        <button
          className="
            w-full mt-4 sm:mt-6
            py-2 sm:py-2.5
            rounded-lg sm:rounded-xl
            text-[11px] sm:text-xs font-extrabold
            text-orange-600
            border border-orange-200
            hover:bg-orange-500 hover:text-white
            hover:border-orange-500
            transition-all duration-300
          "
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

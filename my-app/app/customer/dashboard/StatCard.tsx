interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  subtextClass?: string;
  buttonText?: string;
  icon: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  subtext,
  subtextClass,
  buttonText,
  icon,
  onClick,
}: StatCardProps) {
  return (
    <div
      className="
        bg-white rounded-2xl sm:rounded-3xl
        p-5 sm:p-6
        border border-gray-100
        shadow-sm
        hover:shadow-xl hover:border-orange-200 hover:-translate-y-1
        transition-all duration-300
        h-full flex flex-col justify-between
      "
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <p className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
          {title}
        </p>

        <div
          className="
            w-10 h-10 sm:w-12 sm:h-12
            flex items-center justify-center
            rounded-full bg-orange-50
            text-orange-500
            text-xl sm:text-2xl
            shadow-sm
          "
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="mt-2 overflow-hidden">
        <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 leading-tight truncate">
          {value}
        </h3>

        {subtext && (
          <p
            className={`text-[10px] sm:text-xs font-bold mt-1.5 line-clamp-1 ${
              subtextClass ?? "text-gray-500"
            }`}
          >
            {subtext}
          </p>
        )}
      </div>

      {/* CTA Button */}
      {buttonText && (
        <button
          onClick={onClick}
          className="
            w-full mt-5 
            py-2.5 sm:py-3
            rounded-xl
            text-xs font-extrabold
            text-orange-600 bg-orange-50
            border border-orange-100
            hover:bg-orange-500 hover:text-white
            hover:border-orange-500 hover:shadow-lg hover:shadow-orange-200
            transition-all duration-300
          "
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

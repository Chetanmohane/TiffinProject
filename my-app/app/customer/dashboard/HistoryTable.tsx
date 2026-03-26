const data = [
  {
    date: "25 Jan, Lunch",
    plan: "Premium Thali",
    status: "Delivered",
    amount: "-₹120",
  },
  {
    date: "24 Jan, Dinner",
    plan: "Premium Thali",
    status: "Delivered",
    amount: "-₹120",
  },
  {
    date: "24 Jan, Lunch",
    plan: "Premium Thali",
    status: "Cancelled",
    amount: "-₹0",
  },
];

export default function HistoryTable() {
  return (
    <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-orange-50 border-b border-orange-100">
        <h3 className="text-xs sm:text-sm font-extrabold text-orange-600">
          🧾 Meal History
        </h3>
        <span className="text-[10px] sm:text-[11px] text-orange-400 font-bold">
          Last 7 Days
        </span>
      </div>

      {/* ✅ MOBILE VIEW (Cards) */}
      <div className="block sm:hidden divide-y">
        {data.map((item, idx) => (
          <div key={idx} className="p-4 space-y-2">
            <div className="flex justify-between items-start">
              <p className="font-bold text-sm text-gray-800">{item.date}</p>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full
                ${
                  item.status === "Delivered"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-500"
                }`}
              >
                {item.status}
              </span>
            </div>

            <p className="text-xs text-gray-500">{item.plan}</p>

            <p
              className={`text-sm font-extrabold
              ${item.amount === "-₹0" ? "text-gray-400" : "text-orange-600"}`}
            >
              {item.amount}
            </p>
          </div>
        ))}
      </div>

      {/* ✅ TABLET + DESKTOP VIEW */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              <th className="px-6 py-4">Date / Meal</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-orange-50">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-orange-50/40 transition">
                <td className="px-6 py-4 text-sm font-bold text-gray-800">
                  {item.date}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">{item.plan}</td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold
                    ${
                      item.status === "Delivered"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td
                  className={`px-6 py-4 text-sm font-extrabold text-right
                  ${
                    item.amount === "-₹0" ? "text-gray-400" : "text-orange-600"
                  }`}
                >
                  {item.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

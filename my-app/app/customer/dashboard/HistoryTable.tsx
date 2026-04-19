interface HistoryItem {
  date: string;
  plan: string;
  status: string;
  amount: string;
}

interface HistoryTableProps {
  history?: HistoryItem[];
}

export default function HistoryTable({ history }: HistoryTableProps) {
  const data = history || [
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

  return (
    <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden h-full">
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
      <div className="block sm:hidden divide-y divide-gray-100">
        {data.length === 0 ? (
          <div className="p-8 text-center text-sm font-bold text-gray-400">
            No meal history found yet.
          </div>
        ) : (
          data.map((item: any, idx: number) => (
            <div key={idx} className="p-4 space-y-2 hover:bg-orange-50/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm text-gray-800">{item.date}</p>
                  {item.endDate && (
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">Expires: {item.endDate}</p>
                  )}
                </div>
                <span
                  className={`text-[10px] font-extrabold px-3 py-1 rounded-full
                  ${
                    item.status === "Delivered" || item.status === "Success"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {item.status}
                </span>
              </div>
  
              <p className="text-xs text-gray-500 font-medium">{item.plan}</p>
  
              <p
                className={`text-sm font-extrabold
                ${item.amount === "-₹0" ? "text-gray-400" : "text-gray-700"}`}
              >
                {item.amount}
              </p>
            </div>
          ))
        )}
      </div>

      {/* ✅ TABLET + DESKTOP VIEW */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-gray-400 font-bold bg-gray-50/50">
              <th className="px-6 py-4">Date / Meal</th>
              <th className="px-6 py-4">Plan (End Date)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm font-bold text-gray-400">
                  No meal history found yet.
                </td>
              </tr>
            ) : (
              data.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-orange-50/40 transition">
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">
                    {item.date}
                  </td>
  
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {item.plan}
                    {item.endDate && (
                      <span className="block text-[10px] text-orange-500 font-black mt-1 uppercase tracking-widest">
                        Exp: {item.endDate}
                      </span>
                    )}
                  </td>
  
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold
                      ${
                        item.status === "Delivered" || item.status === "Success"
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
                      item.amount === "-₹0" ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {item.amount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

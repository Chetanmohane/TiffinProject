"use client";
import { useEffect, useState } from "react";

type PauseItem = {
  from: string;
  to: string;
  reason: string;
};

export default function PauseMealPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [pausedList, setPausedList] = useState<PauseItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("pausedMeals");
    if (saved) {setPausedList(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("pausedMeals", JSON.stringify(pausedList));
  }, [pausedList]);

  const pauseMeal = () => {
    if (!fromDate || !toDate || !reason) return;
    setPausedList([...pausedList, { from: fromDate, to: toDate, reason }]);
    setFromDate("");
    setToDate("");
    setReason("");
  };

  const resumeMeal = (index: number) => {
    setPausedList(pausedList.filter((_, i) => i !== index));
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-5 sm:p-8">
        {/* Header */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Pause Meal 🍽️
        </h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Pause your tiffin delivery for selected dates
        </p>

        {/* Pause Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                From Date
              </label>
              <input
                type="date"
                min={today}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                To Date
              </label>
              <input
                type="date"
                min={fromDate || today}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
            >
              <option value="">Select reason</option>
              <option>Vacation</option>
              <option>Out of Station</option>
              <option>Medical</option>
              <option>Personal</option>
            </select>
          </div>

          <button
            onClick={pauseMeal}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold transition"
          >
            Pause Meal
          </button>
        </div>

        {/* Paused List */}
        <div className="mt-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3">
            Paused Periods
          </h2>

          {pausedList.length === 0 && (
            <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
              No paused meals
            </p>
          )}

          <div className="space-y-3">
            {pausedList.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-xl p-4 bg-gray-50"
              >
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    {item.from} → {item.to}
                  </p>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Reason: {item.reason}
                  </span>
                </div>

                <button
                  onClick={() => resumeMeal(index)}
                  className="text-sm text-green-600 font-semibold hover:underline self-start sm:self-auto"
                >
                  Resume
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

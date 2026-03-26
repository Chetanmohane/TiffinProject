// app/dashboard/pause-meal/page.tsx
"use client";

import { useState } from "react";

export default function PauseMealPage() {
  const [date, setDate] = useState("");
  const [pausedDates, setPausedDates] = useState<string[]>([]);

  const pauseMeal = () => {
    if (date && !pausedDates.includes(date)) {
      setPausedDates([...pausedDates, date]);
      setDate("");
    }
  };

  const resumeMeal = (d: string) => {
    setPausedDates(pausedDates.filter((item) => item !== d));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-md sm:max-w-lg mx-auto bg-white rounded-2xl shadow-md p-5 sm:p-7">
        {/* Header */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
          Pause Meal ⏸️
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Select a date to pause your tiffin delivery
        </p>

        {/* Date Picker */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-400 outline-none mb-4"
        />

        {/* Pause Button */}
        <button
          onClick={pauseMeal}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold transition"
        >
          Pause Meal
        </button>

        {/* Paused Dates */}
        <div className="mt-8">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Paused Dates</h2>

          {pausedDates.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">No meals paused</p>
          ) : (
            <ul className="space-y-3">
              {pausedDates.map((d) => (
                <li
                  key={d}
                  className="flex justify-between items-center bg-gray-50 border rounded-lg p-3"
                >
                  <span className="text-sm font-medium text-gray-700">{d}</span>
                  <button
                    onClick={() => resumeMeal(d)}
                    className="text-green-600 text-sm font-bold hover:underline"
                  >
                    Resume
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

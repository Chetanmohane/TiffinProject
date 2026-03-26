"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

/* ---------------- TYPES ---------------- */

interface Plan {
  id: number;
  name: string;
  price: number;
  duration: number;
  mealsPerDay: number;
  visible: boolean;
}

const emptyPlan: Plan = {
  id: 0,
  name: "",
  price: 0,
  duration: 0,
  mealsPerDay: 0,
  visible: true,
};

/* ---------------- COMPONENT ---------------- */

const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState<Plan>(emptyPlan);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : Number.isNaN(Number(value))
            ? value
            : Number(value),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (form.id) {
      setPlans((prev) => prev.map((p) => (p.id === form.id ? form : p)));
    } else {
      setPlans((prev) => [...prev, { ...form, id: Date.now() }]);
    }

    resetForm();
  };

  const editPlan = (plan: Plan) => setForm(plan);

  const deletePlan = (id: number) =>
    setPlans((prev) => prev.filter((p) => p.id !== id));

  const resetForm = () => setForm(emptyPlan);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 ml-6">
          📦 Plan Management
        </h1>
        <p className="text-gray-600 mb-8 ml-6">
          Create, update and manage subscription plans
        </p>

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 mb-10"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6">
            {form.id ? "Update Plan" : "Create New Plan"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PLAN NAME */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Plan Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Eg. Monthly Tiffin Plan"
                className="w-full rounded-lg border border-gray-300 px-4 py-2
                focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                required
              />
            </div>

            {/* PRICE */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Eg. 2500"
                className="w-full rounded-lg border border-gray-300 px-4 py-2
                focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                required
              />
            </div>

            {/* DURATION */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Duration (Days)
              </label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="Eg. 30"
                className="w-full rounded-lg border border-gray-300 px-4 py-2
                focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                required
              />
            </div>

            {/* MEALS */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Meals Per Day
              </label>
              <input
                type="number"
                name="mealsPerDay"
                value={form.mealsPerDay}
                onChange={handleChange}
                placeholder="Eg. 2"
                className="w-full rounded-lg border border-gray-300 px-4 py-2
                focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                required
              />
            </div>
          </div>

          {/* VISIBILITY */}
          <div className="flex items-center gap-3 mt-5">
            <input
              type="checkbox"
              name="visible"
              checked={form.visible}
              onChange={handleChange}
              className="accent-orange-500 scale-110"
            />
            <span className="text-gray-800 font-medium">
              Visible to customers
            </span>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              type="submit"
              className="bg-orange-500 text-white px-6 py-2 rounded-lg
              hover:bg-orange-600 transition font-semibold"
            >
              {form.id ? "Update Plan" : "Create Plan"}
            </button>

            {form.id !== 0 && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-orange-400 text-orange-600 px-6 py-2
                rounded-lg hover:bg-orange-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-orange-100">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Meals / Day</th>
                <th className="px-4 py-3">Visible</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No plans created yet
                  </td>
                </tr>
              )}

              {plans.map((plan) => (
                <tr key={plan.id} className="border-t hover:bg-orange-50">
                  <td className="px-4 py-3 font-medium">{plan.name}</td>
                  <td className="px-4 py-3">₹{plan.price}</td>
                  <td className="px-4 py-3">{plan.duration} days</td>
                  <td className="px-4 py-3">{plan.mealsPerDay}</td>
                  <td className="px-4 py-3">{plan.visible ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 flex gap-4">
                    <button
                      onClick={() => editPlan(plan)}
                      className="text-orange-600 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="text-red-500 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow p-5">
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <p>💰 ₹{plan.price}</p>
              <p>📆 {plan.duration} days</p>
              <p>🍱 {plan.mealsPerDay} meals/day</p>
              <p className="font-semibold">
                {plan.visible ? "Visible" : "Hidden"}
              </p>

              <div className="flex gap-4 mt-3">
                <button
                  onClick={() => editPlan(plan)}
                  className="text-orange-600 font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="text-red-500 font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="bg-white p-6 text-center rounded-xl shadow text-gray-500">
              No plans created yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanManagement;

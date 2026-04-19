"use client";

import toast from "react-hot-toast";
import { useEffect, useState } from "react";

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/menu")
      .then(res => res.json())
      .then(data => {
        setMenus(data.menu);
        setLoading(false);
      });
  }, []);

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...menus];
    updated[index][field] = value;
    setMenus(updated);
  };

  const saveMenu = async () => {
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu: menus })
      });
      if (res.ok) {
        toast.success("Menu updated for all customers!");
      } else {
        toast.error("Failed to update menu");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving menu");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 sm:ml-6 ml-2 pt-20 sm:pt-0 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              🍽 Menu Management
            </h1>
            <p className="text-sm font-bold text-gray-500 mt-1">Update global weekly menus</p>
          </div>
          <button 
            onClick={saveMenu} 
            className="w-full sm:w-auto bg-orange-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-orange-200 hover:bg-orange-600 transition active:scale-95 uppercase text-xs tracking-widest"
          >
            Save Global Menu
          </button>
        </div>

        {menus.map((menu, i) => (
          <div key={menu.day} className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">{menu.day}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-orange-600 mb-1 block">Lunch</label>
                <textarea 
                  value={menu.lunch}
                  onChange={(e) => handleChange(i, 'lunch', e.target.value)}
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none h-20"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-indigo-500 mb-1 block">Dinner</label>
                <textarea 
                  value={menu.dinner}
                  onChange={(e) => handleChange(i, 'dinner', e.target.value)}
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-400 outline-none h-20"
                />
              </div>
            </div>
          </div>
        ))}

        <p className="mt-6 text-green-600 font-medium">
          ✅ Changes reflect instantly on the customer dashboard.
        </p>
      </div>
    </div>
  );
}

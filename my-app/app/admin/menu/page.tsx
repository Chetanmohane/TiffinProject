"use client";

import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const defaultMenus: { [key: string]: { lunch: string, dinner: string } } = {
  "Monday": { lunch: "Dal Tadka, Mix Veg, Roti, Rice, Salad", dinner: "Paneer Masala, Jeera Rice, Roti, Sweet" },
  "Tuesday": { lunch: "Rajma Masala, Aloo Gobi, Roti, Rice", dinner: "Sev Tamatar, Kadhi Khichdi, Roti, Papad" },
  "Wednesday": { lunch: "Chole Bhature / Rice, Seasonal Veg, Roti", dinner: "Soya Chaap Curry, Veg Pulao, Roti" },
  "Thursday": { lunch: "Kadi Pakoda, Aloo Jeera, Roti, Rice", dinner: "Matar Paneer, Plain Rice, Roti, Salad" },
  "Friday": { lunch: "Dal Makhani, Bhindi Fry, Roti, Rice", dinner: "Veg Kofta, Ghee Rice, Roti, Dessert" },
  "Saturday": { lunch: "Pithla Bhakri / Roti, Thecha, Rice", dinner: "Special Veg Biryani, Raita, Papad, Sweet" },
  "Sunday": { lunch: "Special Thali (Dal, Paneer, Veg, Sweets)", dinner: "Light Veg Pulav & Kadhi" }
};

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/menu")
      .then(res => res.json())
      .then(data => {
        const dbMenus = data.menu || [];
        const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const loaded = order.map(day => {
           const existing = dbMenus.find((m: any) => m.day === day);
           if (existing) {
              return { 
                ...existing, 
                isActive: existing.isActive === true || (existing.isActive !== false && day !== "Sunday")
              };
           }
           return {
              day,
              lunch: defaultMenus[day]?.lunch || "",
              dinner: defaultMenus[day]?.dinner || "",
              lunchTime: "01:00 PM",
              dinnerTime: "08:00 PM",
              lunchStatus: "Out for Delivery",
              dinnerStatus: "Scheduled",
              isActive: day !== "Sunday"
           };
        });
        setMenus(loaded);
        setLoading(false);
      });
  }, []);

  const handleChange = (index: number, field: string, value: any) => {
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
          <div key={menu.day} className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-6 mb-6 transition-all ${!menu.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-extrabold text-gray-900">{menu.day}</h3>
               <button 
                 onClick={() => handleChange(i, 'isActive', !menu.isActive)}
                 className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${menu.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
               >
                 {menu.isActive ? 'Visible (Active)' : 'Hidden'}
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-orange-600 mb-1 block uppercase tracking-tight">Lunch Menu</label>
                <textarea 
                  value={menu.lunch}
                  onChange={(e) => handleChange(i, 'lunch', e.target.value)}
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none h-20 mb-3"
                />
                <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase">Lunch Time</label>
                      <input 
                         type="text" 
                         value={menu.lunchTime || "01:00 PM"} 
                         onChange={(e) => handleChange(i, 'lunchTime', e.target.value)}
                         className="w-full border rounded-lg p-2 text-xs outline-none focus:border-orange-500" 
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase">Lunch Status</label>
                      <input 
                         type="text" 
                         value={menu.lunchStatus || "Out for Delivery"} 
                         onChange={(e) => handleChange(i, 'lunchStatus', e.target.value)}
                         className="w-full border rounded-lg p-2 text-xs outline-none focus:border-orange-500" 
                      />
                   </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-bold text-indigo-500 mb-1 block uppercase tracking-tight">Dinner Menu</label>
                <textarea 
                  value={menu.dinner}
                  onChange={(e) => handleChange(i, 'dinner', e.target.value)}
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-400 outline-none h-20 mb-3"
                />
                <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase">Dinner Time</label>
                      <input 
                         type="text" 
                         value={menu.dinnerTime || "08:00 PM"} 
                         onChange={(e) => handleChange(i, 'dinnerTime', e.target.value)}
                         className="w-full border rounded-lg p-2 text-xs outline-none focus:border-indigo-500" 
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase">Dinner Status</label>
                      <input 
                         type="text" 
                         value={menu.dinnerStatus || "Scheduled"} 
                         onChange={(e) => handleChange(i, 'dinnerStatus', e.target.value)}
                         className="w-full border rounded-lg p-2 text-xs outline-none focus:border-indigo-500" 
                      />
                   </div>
                </div>
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

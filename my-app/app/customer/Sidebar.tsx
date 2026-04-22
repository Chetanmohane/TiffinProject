"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cinzelClass, greatVibesClass } from "@/components/common/Navbar";
import {
  LayoutDashboard,
  Utensils,
  CalendarDays,
  CreditCard,
  Menu,
  X,
  Settings,
  LogOut,
  Shield,
  Home
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState({ name: "User", role: "customer" });

  useEffect(() => {
     async function loadUser() {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        if (user?.email) {
            const res = await fetch(`/api/customer/dashboard?email=${encodeURIComponent(user.email)}`);
            const data = await res.json();
            setUserData({
               name: data.user?.name || "User",
               role: user.role || "customer"
            });
        }
     }
     loadUser();
  }, []);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const links = [
    { name: "Dashboard", href: "/customer/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Menu", href: "/customer/dashboard/menu", icon: <Utensils size={20} /> },
    { name: "Payments", href: "/customer/dashboard/payments", icon: <CreditCard size={20} /> },
    { name: "Settings", href: "/customer/settings", icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.clear();
    window.location.href = "/login";
  };

  const firstLetter = userData.name.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 z-40 flex items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => setIsOpen(true)} 
            className="p-2 -ml-1 sm:ml-0 text-gray-600 hover:text-orange-500 transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="leading-tight">
            <h1 className={`${cinzelClass} text-lg sm:text-xl tracking-tight sm:tracking-widest flex items-center`}>
              <span className="text-orange-500 font-black">A</span>
              <span className="text-gray-900 text-base sm:text-lg">nnapurna</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-sm ring-2 ring-orange-50 ring-offset-1">
              {firstLetter}
           </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-100 w-64 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50">
          <div className="leading-tight">
            <h1 className={`${cinzelClass} text-2xl tracking-widest`}>
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">A</span>
              <span className="text-gray-900">nnapurna</span>
            </h1>
            <p className={`${greatVibesClass} text-sm text-orange-500 text-center -mt-1`}>
              Delight
            </p>
          </div>
          <button className="lg:hidden p-2 text-gray-400 hover:text-gray-600" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-6 pb-0">
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {firstLetter}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{userData.name}</p>
              <p className="text-[10px] font-extrabold text-orange-600 bg-white inline-block px-2 py-0.5 rounded-full mt-1 border border-orange-100 uppercase tracking-tighter">
                Premium Member
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                isActive(link.href)
                  ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md shadow-orange-200"
                  : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <span className={isActive(link.href) ? "text-white" : "text-gray-400 group-hover:text-orange-500"}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Back to Home */}
        <div className="px-4 py-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <Home size={20} />
            Visit Website
          </Link>
        </div>

        {/* Admin Switch */}
        {(userData.role === "admin" || userData.role === "editor") && (
          <div className="px-4 py-2">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <Shield size={20} />
              Admin Panel
            </Link>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-gray-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Logout Account
          </button>
        </div>
      </aside>
    </>
  );
}

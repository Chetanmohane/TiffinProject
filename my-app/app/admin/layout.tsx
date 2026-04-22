"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  PauseCircle,
  CreditCard,
  Truck,
  Utensils,
  Menu,
  X,
  Users,
  XCircle,
  Settings,
  Home,
  LogOut
} from "lucide-react";
import { useRBAC } from "@/hooks/useRBAC";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = useRBAC();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Security Pulse: Check if role has changed in real-time
  useEffect(() => {
    const checkRole = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      try {
        const res = await fetch(`/api/auth/verify-role?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        
        if (data.success) {
          // If role changed to customer or user not found, force redirect
          if (data.role === "customer") {
            // Update local storage and redirect
            localStorage.setItem("user", JSON.stringify({ ...user, role: "customer" }));
            window.location.href = "/customer/dashboard";
          } else if (data.role !== user.role) {
             // Role changed but still has access, update local storage to sync UI
             localStorage.setItem("user", JSON.stringify({ ...user, role: data.role }));
             // No redirect needed, but UI will sync on next render
          }
        }
      } catch (e) {
        console.error("Pulse check failed", e);
      }
    };

    // Initial check
    checkRole();

    // Check every 5 seconds for "instant" revocation
    const interval = setInterval(checkRole, 5000);
    return () => clearInterval(interval);
  }, []);

  const allLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={20} />, roles: ["admin", "editor", "viewer"] },
    { name: "Customers", href: "/admin/customers", icon: <Users size={20} />, roles: ["admin"] },
    { name: "Staff Management", href: "/admin/staff", icon: <Users size={20} />, roles: ["admin"] },
    { name: "Plans", href: "/admin/plans", icon: <ClipboardList size={20} />, roles: ["admin", "editor"] },
    { name: "Pause Requests", href: "/admin/pause", icon: <PauseCircle size={20} />, roles: ["admin", "editor"] },
    { name: "Cancellations", href: "/admin/cancellations", icon: <XCircle size={20} />, roles: ["admin"] },
    { name: "Payments", href: "/admin/payments", icon: <CreditCard size={20} />, roles: ["admin"] },
    { name: "Daily Delivery", href: "/admin/delivery", icon: <Truck size={20} />, roles: ["admin", "editor", "viewer"] },
    { name: "Menu", href: "/admin/menu", icon: <Utensils size={20} />, roles: ["admin", "editor"] },
    { name: "Site Content", href: "/admin/site-content", icon: <Home size={20} />, roles: ["admin", "editor"] },
  ];

  const links = allLinks.filter(link => role && link.roles.includes(role));
  const isActive = (href: string) => pathname === href;
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F3F4F6]">
      {/* MOBILE HEADER - Matching Theme */}
      <div className="md:hidden flex items-center justify-between px-6 h-16 bg-[#0F172A] border-b border-white/10 sticky top-0 z-50">
        <h1 className="text-[#F97316] text-xl font-bold">Admin Panel</h1>
        <button onClick={() => setOpen(!open)} className="text-white">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION - Fixed mobile visibility */}
      <aside
        className={`bg-[#0F172A] flex flex-col fixed inset-y-0 left-0 z-40 w-72 md:w-64 h-screen shadow-2xl transition-transform duration-300 md:sticky md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO AREA - Screenshot Matching */}
        <div className="hidden md:flex flex-col items-start justify-center h-24 px-6">
          <h1 className="text-[#F97316] text-2xl font-bold leading-none tracking-tight">
            Admin Panel
          </h1>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(link.href)
                  ? "bg-[#F97316] text-white shadow-lg"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={isActive(link.href) ? "text-white" : "text-gray-400"}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          ))}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <Link
            href="/customer/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <LayoutDashboard size={18} />
            Customer Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 bg-[#F3F4F6]">
        <div className="p-4 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}

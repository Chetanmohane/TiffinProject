"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  PauseCircle,
  CreditCard,
  Truck,
  Utensils,
  Menu,
  X,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard /> },
    { name: "Plans", href: "/admin/plans", icon: <ClipboardList /> },
    { name: "Pause Requests", href: "/admin/pause", icon: <PauseCircle /> },
    { name: "Payments", href: "/admin/payments", icon: <CreditCard /> },
    { name: "Daily Delivery", href: "/admin/delivery", icon: <Truck /> },
    { name: "Menu", href: "/admin/menu", icon: <Utensils /> },
  ];

  return (
    <>
      {/* <Navbar /> */}

      <div className="min-h-screen flex bg-gray-100 relative">
        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden fixed top-5 left-2 z-50 bg-white text-black p-1 ml-1 rounded-md"
          onClick={() => setOpen(true)}
        >
          <Menu size={22} />
        </button>

        {/* MOBILE OVERLAY */}
        {open && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`
           w-64 bg-gray-900 text-white p-5
    md:flex md:flex-col fixed md:sticky md:top-0
    z-50
    fixed md:static z-50
    h-full md:min-h-screen
    transition-transform duration-300
    ${open ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
          `}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-orange-400">Admin Panel</h2>

            {/* CLOSE BUTTON (MOBILE ONLY) */}
            <button className="md:hidden" onClick={() => setOpen(false)}>
              <X />
            </button>
          </div>

          <nav className="space-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition
                  ${
                    pathname === link.href
                      ? "bg-orange-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </>
  );
}

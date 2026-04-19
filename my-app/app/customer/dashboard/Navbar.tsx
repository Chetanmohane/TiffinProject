


"use client";
import { useState } from "react";
import { cinzel, greatVibes } from "@/components/common/Navbar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.clear(); // Safety measure to clear everything
    window.location.href = "/login";
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const navLinkClass = (path: string) =>
    `block px-3 py-2 text-sm font-bold transition
     ${isActive(path)
        ? "text-[#FF7A00]"
        : "text-gray-700 hover:text-[#FF7A00]"
     }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* ================= Logo ================= */}
          <Link href="/" className="select-none">
            <div className="leading-tight">
              <h1 className={`${cinzel.className} text-xl tracking-widest`}>
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  A
                </span>
                <span className="text-gray-950">nnapurna</span>
              </h1>
              <p
                className={`${greatVibes.className}
                text-lg bg-gradient-to-r from-orange-500 to-red-500
                bg-clip-text text-transparent text-center`}
              >
                Delight
              </p>
            </div>
          </Link>

          {/* ================= Desktop Links ================= */}
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/" className={navLinkClass("/")}>Dashboard</Link>
            <Link href="/customer/dashboard/menu" className={navLinkClass("/customer/dashboard/menu")}>Menu</Link>
            <Link href="/customer/dashboard/plan" className={navLinkClass("/customer/dashboard/plan")}>Plan</Link>
            <Link href="/customer/dashboard/payments" className={navLinkClass("/customer/dashboard/payments")}>Payments</Link>
          </div>

          {/* ================= Profile & Logout ================= */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <LogOut size={16} />
              Logout
            </button>

            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600
                            flex items-center justify-center font-bold shadow-inner">
              <User size={20} />
            </div>

            {/* ================= Mobile Menu Button ================= */}
            <button
              className="sm:hidden text-2xl"
              onClick={() => setOpen(!open)}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* ================= Mobile Menu ================= */}
      {open && (
        <div className="sm:hidden bg-white border-t shadow-md">
          <div className="flex flex-col px-4 py-4 space-y-2">
            <Link onClick={() => setOpen(false)} href="/" className={navLinkClass("/")}>Dashboard</Link>
            <Link onClick={() => setOpen(false)} href="/customer/dashboard/menu" className={navLinkClass("/customer/dashboard/menu")}>Menu</Link>
            <Link onClick={() => setOpen(false)} href="/customer/dashboard/plan" className={navLinkClass("/customer/dashboard/plan")}>Plan</Link>
            <Link onClick={() => setOpen(false)} href="/customer/dashboard/payments" className={navLinkClass("/customer/dashboard/payments")}>Payments</Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-4 text-red-600 font-black text-xs uppercase tracking-widest border-t border-gray-50 mt-2"
            >
              <LogOut size={18} />
              Logout Account
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

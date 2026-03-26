


"use client";
import { useState } from "react";
import { cinzel, greatVibes } from "@/components/common/Navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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

          {/* ================= Profile ================= */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-extrabold">Chetan</p>
              <p className="text-[10px] font-bold text-green-600">
                Wallet ₹450
              </p>
            </div>

            <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600
                            flex items-center justify-center font-bold">
              👤
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
          <div className="flex flex-col px-4 py-3 space-y-2">
            <Link onClick={() => setOpen(false)} href="/" className={navLinkClass("/")}>Dashboard</Link>
            <Link onClick={() => setOpen(false)} href="/customer/dashboard/menu" className={navLinkClass("/customer/dashboard/menu")}>Menu</Link>
            <Link onClick={() => setOpen(false)} href="/customer/dashboard/plan" className={navLinkClass("/customer/dashboard/plan")}>Plan</Link>
            <Link onClick={() => setOpen(false)} href="/customer/dashboard/payments" className={navLinkClass("/customer/dashboard/payments")}>Payments</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

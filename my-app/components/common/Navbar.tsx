"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Cinzel, Great_Vibes } from "next/font/google";

export const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // const [user, setUser] = useState<null | {
  //   role: string;
  //   identifier: string;
  // }>(null);

  // useEffect(() => {
  //   const auth = localStorage.getItem("auth");
  //   if (auth) {
  //     setUser(JSON.parse(auth));
  //   }
  // }, []);

  const navLinks = [
    { name: "Home", href: "/#home" },
    { name: "About", href: "/#about" },
    { name: "Services", href: "/#services" },
    { name: "Plans", href: "/#plans" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <header className=" w-full  bg-white shadow-md sticky top-0 z-50">
      <nav className=" w-full flex items-center justify-between px-4 sm:px-6 lg:px-55 py-4">


        {/* LOGO */}
      <Link href="/" className="select-none">
  <div className="flex flex-col items-center leading-tight text-center">
    
    {/* ANNAPURNA */}
    <h1
      className={`${cinzel.className} text-2xl sm:text-3xl tracking-widest`}
    >
      <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
        A
      </span>
      <span className="text-gray-950">nnapurna</span>
    </h1>

    {/* DELIGHT */}
    <p
      className={`
        ${greatVibes.className}
        text-xl sm:text-2xl
        bg-gradient-to-r from-orange-500 to-red-500
        bg-clip-text text-transparent
        tracking-wide
      `}
    >
      Delight
    </p>

  </div>
</Link>

        {/* DESKTOP / TABLET MENU */}
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-700 text-lg lg:text-xl hover:text-orange-600 transition"
            >
              {link.name}
            </Link>
          ))}

          <Link
            href="/register"
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition"
          >
            Sign Up
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-6 py-4 space-y-4 bg-white border-t shadow">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-gray-700 text-lg hover:text-orange-600"
            >
              {link.name}
            </Link>
          ))}

          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="bg-orange-600 text-white text-center py-2 rounded-md hover:bg-orange-700 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}

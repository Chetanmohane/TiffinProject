"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { Cinzel, Great_Vibes } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/#home" },
    { name: "About", href: "/#about" },
    { name: "Services", href: "/#services" },
    { name: "Plans", href: "/#plans" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-lg shadow-lg py-2" : "bg-transparent py-4"}`}>
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LOGO */}
        <Link href="/" className="select-none flex items-center gap-2 group">
          <div className="flex flex-col items-center leading-tight text-center group-hover:scale-105 transition-transform duration-300">
            <h1 className={`${cinzel.className} text-2xl sm:text-3xl tracking-widest`}>
              <span className="text-orange-600 font-bold">A</span>
              <span className="text-gray-900 group-hover:text-orange-600 transition-colors">nnapurna</span>
            </h1>
            <p className={`${greatVibes.className} text-xl sm:text-2xl text-orange-500 tracking-wide -mt-1`}>
              Delight
            </p>
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-700 font-medium hover:text-orange-600 transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors font-medium px-4 py-2"
          >
            <User size={20} />
            Login
          </Link>
          <Link
            href="/register"
            className="bg-orange-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-200 transition-all active:scale-95"
          >
            Get Started
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden p-2 text-gray-700 hover:text-orange-600 transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-orange-100 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-gray-700 text-xl font-medium hover:text-orange-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-center text-gray-700 font-medium py-3 border border-gray-200 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="bg-orange-600 text-white text-center py-3 rounded-xl font-bold hover:bg-orange-700 transition"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, User, LayoutDashboard, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Font fallbacks for environments without next/font support
export const cinzelClass = "font-serif";
export const greatVibesClass = "italic font-serif";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Check for logged in user
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user", e);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener("scroll", handleScroll);
    // Listen for storage changes in case of multi-tab login/logout
    window.addEventListener("storage", checkUser);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.clear();
    setUser(null);
    window.location.href = "/";
  };

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
            <h1 className={`${cinzelClass} text-2xl sm:text-3xl tracking-widest`}>
              <span className="text-orange-600 font-bold">A</span>
              <span className="text-gray-900 group-hover:text-orange-600 transition-colors">nnapurna</span>
            </h1>
            <p className={`${greatVibesClass} text-xl sm:text-2xl text-orange-500 tracking-wide -mt-1`}>
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
          {user ? (
            <>
              <Link
                href="/customer/dashboard"
                className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors font-medium px-4 py-2"
              >
                <ShoppingBag size={20} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-orange-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-200 transition-all active:scale-95 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden p-2 text-gray-700 hover:text-orange-600 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[45] md:hidden"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[80%] h-screen bg-white z-[50] shadow-2xl p-8 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white text-lg font-black italic">A</div>
                   <span className="text-xl font-black text-gray-900 flex flex-col leading-none">
                     Annapurna
                     <span className="text-[10px] text-orange-600 tracking-widest uppercase">Delight</span>
                   </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-orange-600"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-2 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all uppercase tracking-widest"
                  >
                    {link.name}
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-100 group-hover:bg-orange-500"></div>
                  </Link>
                ))}
              </nav>

              <div className="mt-auto space-y-4 pt-8 border-t border-gray-100">
                {user ? (
                   <Link
                    href="/customer/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 bg-orange-600 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-200"
                   >
                     My Dashboard <ArrowRight size={16} />
                   </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-4 bg-orange-600 text-white rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-200"
                    >
                      Join Now
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

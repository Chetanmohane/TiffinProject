"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";
import { cinzel, greatVibes } from "./Navbar";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 w-full">
      <div
        className="
          max-w-7xl mx-auto
          px-4 sm:px-6 lg:px-8
          py-12 sm:py-14
          grid grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-10
        "
      >
        {/* LOGO + BRAND */}
        <div className="text-center sm:text-left">
          <Link href="/" className="inline-block">
            <div className="leading-tight select-none">
              {/* ANNAPURNA */}
              <h1
                className={`${cinzel.className} text-3xl font-bold tracking-widest`}
              >
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  A
                </span>
                nnapurna
              </h1>

              {/* DELIGHT */}
              <p
                className={`${greatVibes.className} text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent tracking-wide flex justify-center sm:justify-start`}
              >
                Delight
              </p>
            </div>
          </Link>

          <p className="mt-4 text-sm text-gray-400 max-w-sm mx-auto sm:mx-0">
            Fresh, hygienic & home-style tiffin service delivering happiness
            every day.
          </p>

          {/* SOCIAL ICONS */}
          <div className="flex justify-center sm:justify-start gap-4 mt-5">
            <a href="#" className="hover:text-orange-500 transition" aria-label="Facebook">
              <Facebook />
            </a>
            <a href="#" className="hover:text-orange-500 transition" aria-label="Instagram">
              <Instagram />
            </a>
            <a href="#" className="hover:text-orange-500 transition" aria-label="Twitter">
              <Twitter />
            </a>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-white mb-4">
            Quick Links
          </h3>
          <ul className="space-y-3">
            <li><Link href="#home" className="hover:text-orange-500 transition">Home</Link></li>
            <li><Link href="#about" className="hover:text-orange-500 transition">About Us</Link></li>
            <li><Link href="#plans" className="hover:text-orange-500 transition">Services</Link></li>
            <li><Link href="#plans" className="hover:text-orange-500 transition">Our Plans</Link></li>
            <li><Link href="#contact" className="hover:text-orange-500 transition">Contact</Link></li>
          </ul>
        </div>

        {/* CONTACT INFO */}
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-white mb-4">
            Contact Us
          </h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start justify-center sm:justify-start gap-3">
              <MapPin className="text-orange-500 mt-1" size={18} />
              <span>Bhopal, Madhya Pradesh (M.P), India</span>
            </li>
            <li className="flex items-center justify-center sm:justify-start gap-3">
              <Phone className="text-orange-500" size={18} />
              <span>+91</span>
            </li>
            <li className="flex items-center justify-center sm:justify-start gap-3">
              <Mail className="text-orange-500" size={18} />
              <span>support@annapurnadelight.com</span>
            </li>
          </ul>
        </div>

        {/* NEWSLETTER / CTA */}
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-white mb-4">
            Stay Connected
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Subscribe for daily menu updates & offers.
          </p>

          <h1 className="text-orange-500 font-bold text-xl font-serif">
            Annapurna Delight Tiffin Centre
          </h1>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500 px-4">
        © {new Date().getFullYear()} Annapurna Delight. All rights reserved.
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";
import { cinzelClass, greatVibesClass } from "./Navbar";
import { useState, useEffect } from "react";

export default function Footer({ initialData }: { initialData?: any }) {
  const [settings, setSettings] = useState<any>(initialData ? { contact: initialData } : null);

  useEffect(() => {
    fetch("/api/admin/settings?t=" + new Date().getTime(), { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(err => console.error("Footer: Failed to load settings", err));
  }, []);

  const contact = settings?.contact;
  const address = contact?.address || "Indore, Madhya Pradesh, India";
  const phone = contact?.phone || "+91 91316 48092";
  const email = contact?.email || "support@annapurnadelight.com";
  const instagram = contact?.instagram || "#";
  const facebook = contact?.facebook || "#";

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
        <div className="text-center sm:text-left">
          <Link href="/" className="inline-block">
            <div className="leading-tight select-none">
              <h1 className={`${cinzelClass} text-3xl font-bold tracking-widest`}>
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">A</span>nnapurna
              </h1>
              <p className={`${greatVibesClass} text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent tracking-wide flex justify-center sm:justify-start`}>Delight</p>
            </div>
          </Link>
          <p className="mt-4 text-sm text-gray-400 max-w-sm mx-auto sm:mx-0">Fresh, hygienic & home-style tiffin service delivering happiness every day.</p>
          <div className="flex justify-center sm:justify-start gap-4 mt-5">
            <a href={facebook} className="hover:text-orange-500 transition" aria-label="Facebook"><Facebook /></a>
            <a href={instagram} className="hover:text-orange-500 transition" aria-label="Instagram"><Instagram /></a>
            <a href="#" className="hover:text-orange-500 transition" aria-label="Twitter"><Twitter /></a>
          </div>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-3">
            <li><Link href="#home" className="hover:text-orange-500 transition">Home</Link></li>
            <li><Link href="#about" className="hover:text-orange-500 transition">About Us</Link></li>
            <li><Link href="#plans" className="hover:text-orange-500 transition">Services</Link></li>
            <li><Link href="#plans" className="hover:text-orange-500 transition">Our Plans</Link></li>
            <li><Link href="#contact" className="hover:text-orange-500 transition">Contact</Link></li>
          </ul>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start justify-center sm:justify-start gap-3">
              <MapPin className="text-orange-500 mt-1" size={18} /><span>{address}</span>
            </li>
            <li className="flex items-center justify-center sm:justify-start gap-3">
              <Phone className="text-orange-500" size={18} /><span>{phone}</span>
            </li>
            <li className="flex items-center justify-center sm:justify-start gap-3">
              <Mail className="text-orange-500" size={18} /><span>{email}</span>
            </li>
          </ul>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-white mb-4">Stay Connected</h3>
          <p className="text-sm text-gray-400 mb-4">{contact?.footerMsg || "Subscribe for daily menu updates & offers."}</p>
          <h1 className="text-orange-500 font-bold text-xl font-serif">{contact?.footerTitle || "Annapurna Delight Tiffin Centre"}</h1>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500 px-4">© {new Date().getFullYear()} Annapurna Delight. All rights reserved.</div>
    </footer>
  );
}

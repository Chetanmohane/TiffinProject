import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Annapurna Delight - Premium Home-Style Tiffin Service",
  description: "Fresh, hygienic and delicious home-cooked tiffin meals delivered daily to your doorstep. Experience the taste of home in every bite.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0 overflow-x-hidden`}
      >
        {/* <Navbar /> */}
        {children}
        <Toaster position="top-right" />
        {/* <Footer /> */}
      </body>
    </html>
  );
}

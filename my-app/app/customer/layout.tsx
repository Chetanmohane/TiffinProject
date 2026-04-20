import type { Metadata } from "next";
import Sidebar from "./Sidebar";

export const metadata: Metadata = {
  title: "Annapurna Delight - Dashboard",
  description: "Customer Dashboard for Annapurna Delight Tiffin Service",
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Main Sidebar */}
      <Sidebar />

      {/* Page Wrapper */}
      <main className="flex-1 min-w-0 flex flex-col pt-16 lg:pt-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

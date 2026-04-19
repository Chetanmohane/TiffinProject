import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

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
        className="antialiased m-0 p-0 overflow-x-hidden font-sans"
      >
        {/* <Navbar /> */}
        {children}
        <Toaster 
          position="top-center" 
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            className: 'font-sans tracking-tight',
            style: {
              padding: '16px 24px',
              color: '#1f2937',
              borderRadius: '100px',
              fontSize: '14px',
              fontWeight: '800',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #f3f4f6',
            },
            success: {
              style: {
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #10b981',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#ecfdf5',
              },
            },
            error: {
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #ef4444',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fef2f2',
              },
            },
          }}
        />
        {/* <Footer /> */}
      </body>
    </html>
  );
}

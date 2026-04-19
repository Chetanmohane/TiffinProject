"use client";

import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    // Check if the ID is actually provided and isn't the placeholder
    if (!clientId || clientId.includes("YOUR_GOOGLE_CLIENT_ID_HERE") || clientId === "PROVIDE_CLIENT_ID_IN_ENV") {
      console.warn("Google Client ID is missing or invalid. Google Sign-In will not be active.");
      return;
    }

    // 1. Load Google GSI Script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/google-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Login successful!");
        router.push(data.redirect || "/customer/dashboard");
      } else {
        toast.error(data.message || "Google Authentication failed");
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      toast.error("Network error during Google login");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (window.google) {
      window.google.accounts.id.prompt(); // One tap if available
      // Or show the standard popup
      window.google.accounts.id.requestCode ? 
      window.google.accounts.id.requestCode() : 
      window.google.accounts.id.prompt();
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      id="googleSignInBtn"
      className="text-gray-700 w-full flex items-center justify-center gap-3 border py-2.5 rounded-xl hover:bg-orange-50 transition bg-white shadow-sm font-semibold disabled:opacity-50"
      onClick={() => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId || clientId.includes("YOUR_GOOGLE_CLIENT_ID_HERE")) {
           toast.error("Google Client ID is not configured! Please update your .env.local file.");
           return;
        }

        if (window.google) {
           window.google.accounts.id.prompt();
        } else {
           toast.error("Google Sign-In is still loading. Please wait a moment.");
        }
      }}
    >
      <FcGoogle size={30}/>
      {loading ? "Verifying..." : "Continue with Google"}
    </button>
  );
}

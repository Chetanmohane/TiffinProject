"use client";

import { useEffect, useState, useRef } from "react";
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
  const initialized = useRef(false);

  useEffect(() => {
    let clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId.includes("YOUR_GOOGLE_CLIENT_ID_HERE")) return;

    // Clean the ID (remove quotes or spaces if they exist)
    clientId = clientId.replace(/["']/g, "").trim();

    const initializeGoogle = () => {
      if (window.google && !initialized.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
          context: "signin",
        });
        initialized.current = true;
      }
    };

    if (!document.getElementById("google-gsi-client")) {
      const script = document.createElement("script");
      script.id = "google-gsi-client";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    } else {
      initializeGoogle();
    }
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

  return (
    <button
      type="button"
      disabled={loading}
      id="googleSignInBtn"
      className="text-gray-700 w-full flex items-center justify-center gap-3 border py-3 rounded-xl hover:bg-orange-50 transition bg-white shadow-sm font-bold disabled:opacity-50"
      onClick={() => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId || clientId.includes("YOUR_GOOGLE_CLIENT_ID_HERE")) {
           toast.error("Google Client ID is not configured!");
           return;
        }

        if (window.google) {
          if (!initialized.current) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleGoogleResponse,
            });
            initialized.current = true;
          }
          // Use the native Google Sign-In prompt
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isDisplayMoment() && notification.isNotDisplayed()) {
              console.log("Moment not displayed:", notification.getNotDisplayedReason());
            }
          });
        } else {
           toast.error("Google script is still loading. Please refresh if this persists.");
        }
      }}
    >
      <FcGoogle size={24}/>
      {loading ? "Verifying..." : "Continue with Google"}
    </button>
  );
}

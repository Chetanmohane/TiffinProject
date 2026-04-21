"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const IDLE_TIME_LIMIT = 15 * 60 * 1000; // 15 minutes in milliseconds

export default function IdleTimer() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logout = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return; // Already logged out

    localStorage.removeItem("user");
    // Optionally clear cookies if you use them for session
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    toast.error("Session expired due to inactivity. Please log in again.", {
       id: "idle-timeout-toast",
       duration: 5000
    });
    
    router.push("/login");
  };

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(logout, IDLE_TIME_LIMIT);
  };

  useEffect(() => {
    // Events to track user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];

    // Initialize timer
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null; // This component doesn't render anything
}

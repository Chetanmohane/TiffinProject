"use client";
// Force rebuild to fix ChunkLoadError

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Navbar from "@/components/common/Navbar";
import GoogleButton from "@/components/GoogleButton";
import { useEffect } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.values(form).some((v) => v === "")) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("🎉 Registration successful!");
        
        setTimeout(() => {
          const searchParams = new URLSearchParams(window.location.search);
          const redirect = searchParams.get("redirect");
          
          if (redirect === "purchase") {
             router.push("/customer/dashboard/plan");
          } else {
             router.push("/customer/dashboard");
          }
        }, 1200);
      } else {
        setError(data.message || "Registration failed");
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setResetSent(true);
      } else {
        setError(data.error);
        toast.error(data.error || "Failed to send reset link");
      }
    } catch (err) {
      setError("Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-100 to-red-100 px-4 pt-16">
      <div className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-lg shadow-red-400">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">
          {forgotPassword ? "Reset Password 🔒" : "Create Account ✨"}
        </h2>

        {error && (
          <p className="border border-red-200 bg-red-50 text-red-500 text-sm font-bold p-3 rounded-xl text-center mb-4">
            {error}
          </p>
        )}

        {forgotPassword ? (
          resetSent ? (
            <div className="text-center space-y-4">
               <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 font-bold text-sm">
                 ✅ Reset link sent! Check your email inbox.
               </div>
               <button 
                 onClick={() => setForgotPassword(false)}
                 className="text-orange-600 font-bold hover:underline"
               >
                 Back to Register
               </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-gray-500 text-sm text-center mb-4">Enter your email and we'll send you a link to reset your password.</p>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="text-gray-700 w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <button 
                type="button"
                onClick={() => setForgotPassword(false)}
                 className="w-full text-gray-500 font-bold text-sm"
              >
                Cancel
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="text-gray-700 w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 shadow-sm" />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="text-gray-700 w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 shadow-sm" />

            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="text-gray-700 w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 shadow-sm" />

            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              className="text-gray-700 w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 shadow-sm" />

            <div className="relative">
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="text-gray-700 w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 shadow-sm" />
              <button 
                type="button"
                onClick={() => setForgotPassword(true)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-600 text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                Forgot?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition disabled:opacity-60 shadow-lg shadow-orange-200"
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </form>
        )}

        <p className="text-gray-500 text-center my-3 text-sm">OR</p>

        <GoogleButton />

        <p className="text-center text-sm mt-4 text-gray-700">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div></>
  );
}

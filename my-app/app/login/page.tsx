"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import GoogleButton from "@/components/GoogleButton";
import Navbar from "@/components/common/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.identifier || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: form.identifier,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Successful login
        localStorage.setItem("user", JSON.stringify(data.user));
        
        const searchParams = new URLSearchParams(window.location.search);
        const redirect = searchParams.get("redirect");
        
        if (redirect === "purchase") {
           router.push("/customer/dashboard/plan");
        } else {
           router.push(data.redirect || "/customer/dashboard");
        }
      } else {
        setError(data.message || "Invalid email/phone or password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
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
        <h2 className="text-gray-900 text-3xl font-bold text-center mb-6">
          {forgotPassword ? "Reset Password 🔒" : "Welcome Back 👋"}
        </h2>

        {error && (
          <p className="border border-red-200 bg-red-50 text-red-500 text-sm font-bold p-3 rounded-xl text-center mb-4">{error}</p>
        )}

        {forgotPassword ? (
          resetSent ? (
            <div className="text-center space-y-4">
               <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 font-bold">
                 ✅ Reset link sent! Check your email inbox.
               </div>
               <button 
                 onClick={() => setForgotPassword(false)}
                 className="text-orange-600 font-bold hover:underline"
               >
                 Back to Login
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
              type="text"
              name="identifier"
              placeholder="Email or Phone"
              value={form.identifier}
              onChange={handleChange}
              className="text-gray-700 w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="text-gray-700 w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 pr-24" />
              
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-orange-500 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
                <button 
                  type="button"
                  onClick={() => setForgotPassword(true)}
                  className="text-orange-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                >
                  Forgot?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        <p className="text-gray-500 text-center my-3">OR</p>

        <GoogleButton />

        <p className="text-gray-700 text-center text-sm mt-4">
          Don’t have an account?{" "}
          <Link href="/register" className="text-orange-600 font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div></>
  );
}

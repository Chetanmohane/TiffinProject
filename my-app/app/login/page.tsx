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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-100 to-red-100 px-4 sm:px-6 pt-24 pb-12">
      <div className="w-full max-w-lg bg-white p-6 sm:p-10 rounded-3xl shadow-2xl shadow-red-400/20">
        <h2 className="text-gray-900 text-2xl sm:text-3xl font-black text-center mb-6 sm:mb-8 tracking-tight uppercase">
          {forgotPassword ? "Reset Password" : "Welcome Back"}
        </h2>

        {error && (
          <p className="border border-red-200 bg-red-50 text-red-500 text-xs font-bold p-4 rounded-2xl text-center mb-6">{error}</p>
        )}

        {forgotPassword ? (
          resetSent ? (
            <div className="text-center space-y-6">
               <div className="bg-green-50 text-green-700 p-6 rounded-2xl border border-green-100 font-bold text-sm">
                 ✅ Reset link sent! Check your email inbox.
               </div>
               <button 
                 onClick={() => setForgotPassword(false)}
                 className="text-orange-600 font-black uppercase tracking-widest text-xs hover:underline"
               >
                 Back to Login
               </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              <p className="text-gray-500 text-xs sm:text-sm text-center mb-6 font-medium leading-relaxed">Enter your email and we'll send you a link to reset your password.</p>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="text-gray-700 w-full border-2 border-gray-100 px-6 py-4 rounded-2xl focus:outline-none focus:border-orange-500 transition-all font-bold text-sm" />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition shadow-xl shadow-gray-200 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <button 
                type="button"
                onClick={() => setForgotPassword(false)}
                 className="w-full text-gray-500 font-black uppercase tracking-widest text-[10px] hover:text-gray-700 transition"
              >
                Cancel
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <input
              type="text"
              name="identifier"
              placeholder="Email or Phone"
              value={form.identifier}
              onChange={handleChange}
              className="text-gray-700 w-full border-2 border-gray-100 px-6 py-4 rounded-2xl focus:outline-none focus:border-orange-500 transition-all font-bold text-sm shadow-sm" />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="text-gray-700 w-full border-2 border-gray-100 px-6 py-4 rounded-2xl focus:outline-none focus:border-orange-500 transition-all font-bold text-sm shadow-sm pr-20" />
              
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
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition shadow-xl shadow-orange-200 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        <div className="relative my-8">
           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
           <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]"><span className="bg-white px-4 text-gray-400">OR</span></div>
        </div>

        <GoogleButton />

        <p className="text-gray-500 text-center text-[13px] font-bold mt-8">
          Don’t have an account?{" "}
          <Link href="/register" className="text-orange-600 font-black hover:underline ml-1">
            Register Now
          </Link>
        </p>
      </div>
    </div></>
  );
}

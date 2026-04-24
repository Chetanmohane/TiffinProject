"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Phone, Mail } from "lucide-react";
import GoogleButton from "@/components/GoogleButton";
import Navbar from "@/components/common/Navbar";

type LoginMode = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("email");
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Auto-detect mode based on input
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm({ ...form, identifier: val });
    setError("");
    // Auto switch to phone mode if looks like a number
    if (/^\d/.test(val)) setMode("phone");
    else if (val.includes("@") || /[a-zA-Z]/.test(val)) setMode("email");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.identifier || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    // Phone validation
    if (mode === "phone" && !/^\d{10}$/.test(form.identifier.trim())) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.identifier.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        const searchParams = new URLSearchParams(window.location.search);
        const redirect = searchParams.get("redirect");
        if (redirect === "purchase") {
          router.push("/customer/dashboard/plan");
        } else {
          router.push(data.redirect || "/customer/dashboard");
        }
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      if (data.success) setResetSent(true);
      else setError(data.error);
    } catch {
      setError("Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 sm:px-6 pt-24 pb-12">
        <div className="w-full max-w-lg">

          {/* Card */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-orange-100/60 border border-orange-50 overflow-hidden">

            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500" />

            <div className="p-8 sm:p-10">

              {/* Logo / Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-[1.5rem] flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-orange-200">
                  🍱
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {forgotPassword ? "Reset Password" : "Welcome Back!"}
                </h2>
                <p className="text-sm text-gray-400 font-medium mt-1">
                  {forgotPassword ? "We'll send a reset link to your email" : "Login to your tiffin account"}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-xs font-bold p-4 rounded-2xl text-center mb-6 flex items-center justify-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              {forgotPassword ? (
                /* ── Forgot Password Form ── */
                resetSent ? (
                  <div className="text-center space-y-6">
                    <div className="bg-green-50 text-green-700 p-6 rounded-2xl border border-green-100 font-bold text-sm">
                      ✅ Reset link sent! Check your email inbox.
                    </div>
                    <button
                      onClick={() => { setForgotPassword(false); setResetSent(false); }}
                      className="text-orange-600 font-black uppercase tracking-widest text-xs hover:underline"
                    >
                      ← Back to Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <input
                      type="email"
                      required
                      placeholder="Enter your registered email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="text-gray-700 w-full border-2 border-gray-100 px-5 py-4 rounded-2xl focus:outline-none focus:border-orange-400 transition-all font-bold text-sm"
                    />
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
                      className="w-full text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-700 transition"
                    >
                      Cancel
                    </button>
                  </form>
                )
              ) : (
                /* ── Login Form ── */
                <>
                  {/* Mode Toggle */}
                  <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
                    <button
                      type="button"
                      onClick={() => { setMode("email"); setForm({ ...form, identifier: "" }); setError(""); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mode === "email" ? "bg-white text-orange-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <Mail size={13} /> Email
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode("phone"); setForm({ ...form, identifier: "" }); setError(""); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mode === "phone" ? "bg-white text-orange-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <Phone size={13} /> Mobile
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Identifier field */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                        {mode === "phone" ? <Phone size={16} /> : <Mail size={16} />}
                      </div>
                      <input
                        type={mode === "phone" ? "tel" : "email"}
                        inputMode={mode === "phone" ? "numeric" : "email"}
                        name="identifier"
                        placeholder={mode === "phone" ? "10-digit mobile number" : "Your email address"}
                        value={form.identifier}
                        onChange={handleIdentifierChange}
                        maxLength={mode === "phone" ? 10 : undefined}
                        className="text-gray-700 w-full border-2 border-gray-100 pl-10 pr-5 py-4 rounded-2xl focus:outline-none focus:border-orange-400 transition-all font-bold text-sm shadow-sm"
                      />
                    </div>

                    {/* Password field */}
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Your password"
                        value={form.password}
                        onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(""); }}
                        className="text-gray-700 w-full border-2 border-gray-100 px-5 py-4 rounded-2xl focus:outline-none focus:border-orange-400 transition-all font-bold text-sm shadow-sm pr-28"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-300 hover:text-orange-500 p-1 transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <div className="w-px h-4 bg-gray-200" />
                        <button
                          type="button"
                          onClick={() => setForgotPassword(true)}
                          className="text-orange-500 text-[10px] font-black uppercase tracking-widest hover:underline"
                        >
                          Forgot?
                        </button>
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:from-orange-600 hover:to-red-600 transition-all shadow-xl shadow-orange-200 active:scale-95 disabled:opacity-50 mt-2"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Logging in...
                        </span>
                      ) : (
                        `Login with ${mode === "phone" ? "Mobile" : "Email"}`
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-7">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-[10px] uppercase font-black tracking-[0.3em] text-gray-300">or continue with</span>
                    </div>
                  </div>

                  <GoogleButton />

                  <p className="text-gray-400 text-center text-xs font-bold mt-7">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-orange-600 font-black hover:underline ml-1">
                      Register Now →
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

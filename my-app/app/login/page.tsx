"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleButton from "@/components/GoogleButton";
import Navbar from "@/components/common/Navbar";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    identifier: "",
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

    if (!form.identifier || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    // 🔐 MOCK AUTH (replace with real API later)

    /* ===== ADMIN LOGIN ===== */
    if (
      form.identifier === "chetanmohane27@gmail.com" &&
      form.password === "admin123"
    ) {
      router.push("/admin/dashboard");
      setLoading(false);
      return;
    }

    /* ===== CUSTOMER LOGIN ===== */
    if (
      form.identifier === "chetanmohane27@gmail.com" &&
      form.password === "123456"
    ) {
      router.push("/customer/dashboard");
      setLoading(false);
      return;
    }

    // ❌ Invalid credentials
    setError("Invalid email/phone or password");
    setLoading(false);
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-100 to-red-100 px-4">
      <div className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-lg shadow-red-400">
        <h2 className="text-gray-900 text-3xl font-bold text-center mb-6">
          Welcome Back 👋
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="identifier"
            placeholder="Email or Phone"
            value={form.identifier}
            onChange={handleChange}
            className="text-gray-700 w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="text-gray-700 w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

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

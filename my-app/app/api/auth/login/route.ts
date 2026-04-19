import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password, isOAuth, socialData } = body;

    await connectDB();

    // --- OAuth / Social Login ---
    if (isOAuth && socialData) {
      const { email, name, phone } = socialData;
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          email,
          name,
          phone: phone || "N/A",
          role: "customer",
          walletBalance: 0,
          password: `OAUTH-${Math.random().toString(36).substring(7)}`,
          address: "",
        });
      }

      return NextResponse.json({
        success: true,
        user: { id: user._id, role: user.role, name: user.name, email: user.email, phone: user.phone },
        redirect: "/customer/dashboard",
      });
    }

    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 });
    }

    // --- Find by email or phone ---
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found. Please register or check your credentials." },
        { status: 404 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: "Invalid password. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { id: user._id, role: user.role, name: user.name, email: user.email, phone: user.phone },
      redirect: "/customer/dashboard",
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

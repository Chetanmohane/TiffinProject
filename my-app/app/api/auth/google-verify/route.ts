import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, message: "Token is required" }, { status: 400 });
    }

    // 1. Verify token with Google's API
    const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const payload = await googleResponse.json();

    if (!payload.email) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { email, name, picture, sub: googleId } = payload;

    await connectDB();

    // 2. Find or Create User
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if they don't exist
      user = await User.create({
        email,
        name: name || email.split("@")[0],
        role: "customer",
        walletBalance: 0,
        // Generate a random password for social users
        password: `GOOGLE-${googleId.substring(0, 8)}`,
        phone: "N/A",
        address: "",
      });
    }

    // 3. Return user data (matching your existing login structure)
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      redirect: (user.role === "admin" || user.role === "editor") ? "/admin/dashboard" : "/customer/dashboard",
    });

  } catch (error: any) {
    console.error("Google verify error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

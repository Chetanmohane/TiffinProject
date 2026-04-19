import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password, address } = body;

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email or phone already registered" },
        { status: 400 }
      );
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      address: address || "",
      role: "customer",
      walletBalance: 0,
    });

    return NextResponse.json({
      success: true,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      message: "Registration successful",
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}

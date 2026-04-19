import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) throw new Error("Email is required");

    const customer = await User.findOne({ email: email.toLowerCase() })
      .select('name email phone address')
      .lean();

    if (!customer) throw new Error("Customer not found");

    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, name, phone, address, password, originalEmail } = body;

    const updateData: any = { name, email: email.toLowerCase(), phone, address };
    if (password) {
      updateData.password = password;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: (originalEmail || email).toLowerCase() },
      updateData,
      { new: true }
    );

    if (!updatedUser) throw new Error("User not found");

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

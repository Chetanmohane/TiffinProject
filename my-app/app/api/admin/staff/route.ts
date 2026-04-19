import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    // Return all users that are not customers (admins, editors, viewers, staff)
    const users = await User.find({ role: { $ne: "customer" } })
      .select("name email role createdAt")
      .sort({ role: 1, name: 1 })
      .lean();

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { userId, role } = await req.json();

    if (!userId || !role) throw new Error("User ID and Role are required");

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) throw new Error("User not found");

    if (userToUpdate.email === "chetanmohane27@gmail.com") {
      throw new Error("Cannot modify role of the Root Administrator");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true }
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

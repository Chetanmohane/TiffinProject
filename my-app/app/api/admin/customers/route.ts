import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import PausedMeal from "@/models/PausedMeal";

export async function GET() {
  try {
    await connectDB();

    const customers = await User.find({
      $or: [
        { role: "customer" },
        { "subscription.planName": { $exists: true, $ne: null } }
      ]
    })
      .select("name email phone address walletBalance subscription createdAt role")
      .sort({ createdAt: -1 })
      .lean();

    const today = new Date().toISOString().split("T")[0];
    const pauses = await PausedMeal.find({
      pauseFrom: { $lte: today },
      pauseTo: { $gte: today },
    }).lean();

    const merged = customers.map((c: any) => {
      const customerName = (c.name || "").trim().toLowerCase();
      const activePause = pauses.find(
        (p: any) => (p.customerName || "").trim().toLowerCase() === customerName
      );

      let finalStatus = "Inactive";
      if (activePause) {
        finalStatus = "Paused";
      } else if (c.subscription && c.subscription.status) {
        finalStatus = c.subscription.status;
      }

      return {
        ...c,
        id: c._id?.toString(),
        subscription: {
          ...(c.subscription || {}),
          status: finalStatus
        }
      };
    });

    const stats = {
      total: merged.length,
      active: merged.filter(c => c.subscription.status.toLowerCase() === 'active').length,
      paused: merged.filter(c => c.subscription.status.toLowerCase() === 'paused').length,
    };

    return NextResponse.json({ success: true, customers: merged, stats });
  } catch (error: any) {
    console.error("Customers API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) throw new Error("Customer ID required");

    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Customer deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { id, updates } = await req.json();

    if (!id) throw new Error("Customer ID required");

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

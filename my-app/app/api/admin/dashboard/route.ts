import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Delivery from "@/models/Delivery";
import Payment from "@/models/Payment";
import PausedMeal from "@/models/PausedMeal";

export async function GET() {
  try {
    await connectDB();

    const totalCustomers = await User.countDocuments({ role: "customer" });
    const activePlans = await User.countDocuments({ "subscription.status": "Active" });
    const todaysDeliveries = await Delivery.countDocuments();

    const credits = await Payment.find({ type: "Credit", status: "Success" })
      .select("amount")
      .lean();
    const revenue = credits.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const today = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString().split("T")[0];
    const pausedCustomers = await PausedMeal.countDocuments({
      pauseFrom: { $lte: today },
      pauseTo: { $gte: today },
    });

    return NextResponse.json({
      totalCustomers,
      activePlans,
      todaysDeliveries,
      pausedCustomers,
      revenue: `₹${revenue.toLocaleString()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

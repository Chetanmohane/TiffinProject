import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Delivery from "@/models/Delivery";
import Payment from "@/models/Payment";
import PausedMeal from "@/models/PausedMeal";

export async function GET() {
  try {
    await connectDB();

    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const today = new Date(new Date().getTime() + IST_OFFSET).toISOString().split("T")[0];

    const totalCustomers = await User.countDocuments({
      $or: [
        { role: "customer" },
        { "subscription.planName": { $exists: true, $ne: null } }
      ]
    });
    const activePlans = await User.countDocuments({ 
      "subscription.status": "Active"
    });
    const todaysDeliveries = await Delivery.countDocuments({ date: today, status: "Delivered" });

    // Calculate Today's Revenue
    const startOfToday = new Date(new Date().getTime() + IST_OFFSET);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(new Date().getTime() + IST_OFFSET);
    endOfToday.setHours(23, 59, 59, 999);

    const credits = await Payment.find({ 
      type: "Credit", 
      status: "Success",
      createdAt: { $gte: new Date(startOfToday.getTime() - IST_OFFSET), $lte: new Date(endOfToday.getTime() - IST_OFFSET) }
    })
      .select("amount")
      .lean();
    const revenue = credits.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const pausedCustomers = await PausedMeal.countDocuments({
      pauseFrom: { $lte: today },
      pauseTo: { $gte: today },
    });

    const recentDeliveries = await Delivery.find({ date: today, status: "Delivered" })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const pendingPayments = await Payment.countDocuments({ status: { $in: ["Pending", "pending"] } });

    return NextResponse.json({
      totalCustomers,
      activePlans,
      todaysDeliveries,
      pausedCustomers,
      recentDeliveries,
      pendingPayments,
      revenue: `₹${revenue.toLocaleString()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

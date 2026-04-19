import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Delivery from "@/models/Delivery";
import CancelledMeal from "@/models/CancelledMeal";

// CANCEL CUTOFF TIME: 10:00 AM IST (UTC+5:30 = 04:30 UTC)
const CANCEL_CUTOFF_HOUR_IST = 10; // 10 AM

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, reason } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // --- Time Check: IST = UTC + 5:30 ---
    const nowUTC = new Date();
    const nowIST = new Date(nowUTC.getTime() + (5 * 60 + 30) * 60 * 1000);
    const hourIST = nowIST.getUTCHours();
    const minuteIST = nowIST.getUTCMinutes();
    const currentMinutesFromMidnight = hourIST * 60 + minuteIST;
    const cutoffMinutes = CANCEL_CUTOFF_HOUR_IST * 60; // 10:00 AM = 600 minutes

    if (currentMinutesFromMidnight >= cutoffMinutes) {
      return NextResponse.json(
        {
          success: false,
          error: `Cancellation window closed. You can only cancel meals before ${CANCEL_CUTOFF_HOUR_IST}:00 AM.`,
          cutoffPassed: true,
        },
        { status: 403 }
      );
    }

    // Find customer
    const customer = await User.findOne({ email: email.toLowerCase() }).lean() as any;
    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if already cancelled today
    const alreadyCancelled = await CancelledMeal.findOne({
      customerId: customer._id,
      date: today,
    });
    if (alreadyCancelled) {
      return NextResponse.json(
        { success: false, error: "Meal already cancelled for today" },
        { status: 409 }
      );
    }

    // Save cancel record
    await CancelledMeal.create({
      customerId: customer._id,
      customerName: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      planName: customer.subscription?.planName || "No Plan",
      mealType: "Lunch",
      date: today,
      reason: reason || "No reason provided",
      cancelledAt: new Date(),
    });

    // Also update Delivery record for today if exists
    await Delivery.findOneAndUpdate(
      { customerId: customer._id, date: today },
      { status: "Cancelled" }
    );

    return NextResponse.json({
      success: true,
      message: "Meal cancelled successfully for today.",
    });
  } catch (error: any) {
    console.error("Cancel Meal API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

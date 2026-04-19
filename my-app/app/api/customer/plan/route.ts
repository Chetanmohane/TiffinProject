import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    
    if (!email) throw new Error("Email is required");

    const customer = await User.findOne({ email: email.toLowerCase() }).lean() as any;
    
    const today = new Date().toISOString().split("T")[0];
    const PausedMeal = (await import("@/models/PausedMeal")).default;
    const isPausedToday = customer ? await PausedMeal.findOne({
      customerName: customer.name,
      pauseFrom: { $lte: today },
      pauseTo: { $gte: today },
    }) : null;
    
    if (customer && customer.subscription) {
      const sub = customer.subscription;
      return NextResponse.json({
        planName: sub.planName || "No active plan",
        startDate: sub.startDate || "--",
        endDate: sub.nextRenewal || "--",
        frequency: "Lunch & Dinner",
        schedule: "Monday – Saturday",
        mealsRemaining: sub.mealsLeft || 0,
        totalMeals: sub.totalMeals || 0,
        status: isPausedToday ? "Paused" : (sub.status || "Inactive"),
        isPaused: !!isPausedToday
      });
    }

    return NextResponse.json({
      planName: "No active plan",
      startDate: "--",
      endDate: "--",
      frequency: "Not subscribed",
      schedule: "N/A",
      mealsRemaining: 0,
      totalMeals: 0,
      status: "Inactive"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

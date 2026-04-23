import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Holiday from "@/models/Holiday";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const holidays = await Holiday.find({}).sort({ startDate: -1 });
    return NextResponse.json({ holidays });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { action, holiday } = body;

    if (action === "add") {
      const { title, startDate, endDate, reason } = holiday;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // 1. Create Holiday Record
      const newHoliday = await Holiday.create({
        title,
        startDate,
        endDate,
        reason,
        isActive: true
      });

      // 2. GLOBAL EXTENSION: Update all users with an active/paused plan
      const users = await User.find({
        "subscription.status": { $in: ["Active", "Paused"] }
      });

      const updatePromises = users.map(user => {
        if (user.subscription?.nextRenewal) {
            const currentEnd = new Date(user.subscription.nextRenewal);
            const newEnd = new Date(currentEnd.getTime() + (diffDays * 24 * 60 * 60 * 1000));
            return User.updateOne(
                { _id: user._id },
                { $set: { "subscription.nextRenewal": newEnd.toISOString().split("T")[0] } }
            );
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      return NextResponse.json({ success: true, diffDays, message: `Holiday added and ${users.length} plans extended by ${diffDays} days.` });
    }

    if (action === "delete") {
      const id = body.id;
      const h = await Holiday.findById(id);
      if (!h) throw new Error("Holiday not found");

      // OPTIONAL: REVERT EXTENSION? 
      // Most admins wouldn't expect a delete to shrink plans back unless it was a mistake.
      // But let's stay consistent.
      const start = new Date(h.startDate);
      const end = new Date(h.endDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const users = await User.find({
        "subscription.status": { $in: ["Active", "Paused"] }
      });

      const updatePromises = users.map(user => {
        if (user.subscription?.nextRenewal) {
            const currentEnd = new Date(user.subscription.nextRenewal);
            const newEnd = new Date(currentEnd.getTime() - (diffDays * 24 * 60 * 60 * 1000));
            return User.updateOne(
                { _id: user._id },
                { $set: { "subscription.nextRenewal": newEnd.toISOString().split("T")[0] } }
            );
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      await Holiday.findByIdAndDelete(id);
      
      return NextResponse.json({ success: true, message: "Holiday deleted and plan durations reverted." });
    }

    return NextResponse.json({ success: false, error: "Invalid action" });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

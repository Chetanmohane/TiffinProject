import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PausedMeal from "@/models/PausedMeal";

export async function GET() {
  try {
    await connectDB();
    const PausedMeal = (await import("@/models/PausedMeal")).default;
    const User = (await import("@/models/User")).default;
    
    // 1. Fetch specific date-based pauses
    const pausedEntries = await PausedMeal.find({}).lean();
    
    // 2. Fetch users who are globally paused (subscription.status: "Paused")
    const globallyPausedUsers = await User.find({ 
      "subscription.status": "Paused",
      role: "customer"
    }).lean();

    const list: any[] = [];
    const processedCustomerIds = new Set();

    // Process date-based pauses first
    pausedEntries.forEach((p: any) => {
      processedCustomerIds.add(p.customerId?.toString());
      list.push({
        id: p._id.toString(),
        customerName: p.customerName,
        phone: p.phone,
        planName: p.planName,
        pauseFrom: p.pauseFrom,
        pauseTo: p.pauseTo,
        reason: p.reason || "Scheduled Pause",
        status: p.status || "Approved",
      });
    });

    // Add globally paused users who don't have a specific date entry
    globallyPausedUsers.forEach((u: any) => {
      const uId = u._id.toString();
      if (!processedCustomerIds.has(uId)) {
        list.push({
          id: uId,
          customerName: u.name,
          phone: u.phone,
          planName: u.subscription?.planName || "Active Plan",
          pauseFrom: "Indefinite",
          pauseTo: "Manual Resume Required",
          reason: "Globally Paused by Admin/System",
          status: "Approved",
          isGlobal: true // helpful flag for the frontend
        });
      }
    });
    
    return NextResponse.json({
      success: true,
      pausedCustomers: list
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const PausedMeal = (await import("@/models/PausedMeal")).default;
    const User = (await import("@/models/User")).default;
    const { action, id, isGlobal } = await req.json();

    if (action === "resume") {
      if (isGlobal) {
        // Resume global pause by updating user status
        await User.findByIdAndUpdate(id, { "subscription.status": "Active" });
      } else {
        // Resume scheduled pause by deleting the record
        await PausedMeal.findByIdAndDelete(id);
      }
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

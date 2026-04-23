import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import PausedMeal from "@/models/PausedMeal";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const userName = searchParams.get("name") || "Chetan";

    let query: any = email ? { email: email.toLowerCase() } : { name: userName };
    const customer = await User.findOne(query).lean() as any;
    
    if (!customer) throw new Error("Customer not found");

    const customerPauses = await PausedMeal.find({ customerId: customer._id }).lean();
    const hasActivePlan = customer.subscription?.status === "Active" || customer.subscription?.status === "Paused";

    return NextResponse.json({ 
      hasActivePlan,
      planStartDate: customer.subscription?.startDate || null,
      planEndDate: customer.subscription?.nextRenewal || null,
      pausedList: customerPauses.map((p: any) => ({
        id: p._id,
        from: p.pauseFrom,
        to: p.pauseTo,
        reason: p.reason
      })) 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { action, item, name, email } = body;
    
    let query: any = email ? { email: email.toLowerCase() } : { name: name || "Chetan" };
    const customer = await User.findOne(query).lean() as any;

    if (!customer) throw new Error("Customer not found");

    if (action === "add") {
      const hasActivePlan = customer.subscription?.status === "Active" || customer.subscription?.status === "Paused";
      if (!hasActivePlan) {
        throw new Error("You don't have any active plan. Please buy a plan to pause your meals.");
      }
      
      const planStart = customer.subscription.startDate;
      const planEnd = customer.subscription.nextRenewal;
      
      if (planStart && item.from < planStart) {
          throw new Error(`You can only pause meals after your plan starts (${planStart}).`);
      }
      
      // If we are adding a pause, user can pause up to the current end date
      if (planEnd && item.from > planEnd) {
          throw new Error(`Pause start date cannot be after plan expiry (${planEnd}).`);
      }
      
      const existingPauses = await PausedMeal.find({ customerId: customer._id }).lean();
      
      const newStart = new Date(item.from).getTime();
      const newEnd = new Date(item.to).getTime();
      
      for (const pause of existingPauses) {
        const oldStart = new Date(pause.pauseFrom).getTime();
        const oldEnd = new Date(pause.pauseTo).getTime();
        
        if (newStart <= oldEnd && newEnd >= oldStart) {
          throw new Error("You have already paused your meal for these dates.");
        }
      }

      // Calculate days to extend
      const diffTime = Math.abs(newEnd - newStart);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // Update User Renewal Date
      const currentEnd = new Date(customer.subscription.nextRenewal);
      const newRenewalDate = new Date(currentEnd.getTime() + (diffDays * 24 * 60 * 60 * 1000));
      const nextRenewalStr = newRenewalDate.toISOString().split("T")[0];

      await User.findOneAndUpdate(
        { _id: customer._id },
        { 
          "subscription.nextRenewal": nextRenewalStr,
          "subscription.status": "Paused" // Mark as paused if currently active
        }
      );

      await PausedMeal.create({ 
        customerId: customer._id,
        customerName: customer.name, 
        phone: customer.phone || "N/A", 
        planName: customer.subscription?.planName || "Active Plan",
        pauseFrom: item.from,
        pauseTo: item.to,
        reason: item.reason,
        daysCount: diffDays // Storing for easier removal
      });
    } else if (action === "remove") {
      const pm = await PausedMeal.findById(body.id);
      if (pm && customer.subscription) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const pauseStart = new Date(pm.pauseFrom);
        pauseStart.setHours(0, 0, 0, 0);
        
        const pauseEnd = new Date(pm.pauseTo);
        pauseEnd.setHours(0, 0, 0, 0);

        const originalDiffDays = pm.daysCount || 1;
        let actualDaysToKeep = originalDiffDays;

        if (today < pauseStart) {
          // Case 1: Resuming before the pause even started
          actualDaysToKeep = 0;
        } else if (today <= pauseEnd) {
          // Case 2: Early resume during the pause
          const timeSpent = Math.abs(today.getTime() - pauseStart.getTime());
          actualDaysToKeep = Math.ceil(timeSpent / (1000 * 60 * 60 * 24));
          // If they resume on the same day it started, they kept 0 pause days
        } else {
          // Case 3: Already finished (just cleaning up)
          actualDaysToKeep = originalDiffDays;
        }

        const daysToSubtract = originalDiffDays - actualDaysToKeep;

        if (daysToSubtract > 0) {
          const currentEnd = new Date(customer.subscription.nextRenewal);
          const adjustedEnd = new Date(currentEnd.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
          const adjustedEndStr = adjustedEnd.toISOString().split("T")[0];

          await User.findOneAndUpdate(
            { _id: customer._id },
            { 
              "subscription.nextRenewal": adjustedEndStr,
              "subscription.status": "Active" 
            }
          );
        } else {
            await User.findOneAndUpdate({ _id: customer._id }, { "subscription.status": "Active" });
        }
        
        await PausedMeal.findByIdAndDelete(body.id);
      }
    }
    
    const customerPauses = await PausedMeal.find({ customerName: customer.name }).lean();

    return NextResponse.json({ 
      success: true, 
      pausedList: customerPauses.map((p: any) => ({
        id: p._id,
        from: p.pauseFrom,
        to: p.pauseTo,
        reason: p.reason
      })) 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

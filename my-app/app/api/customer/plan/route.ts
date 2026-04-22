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
    
    if (!customer) {
      return NextResponse.json({
        planName: "No active plan",
        startDate: "--",
        endDate: "--",
        memberSince: "--",
        mealsRemaining: 0,
        totalMeals: 0,
        status: "Inactive"
      });
    }

    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const today = new Date(new Date().getTime() + IST_OFFSET).toISOString().split("T")[0];
    
    // Auto-Deduction Logic
    if (customer && customer.subscription && customer.subscription.status !== "Expired") {
      let sub = customer.subscription;
      const lastCheck = sub.lastDeductionDate;
      
      // If first time or a new day has arrived
      if (!lastCheck) {
         // Initialization: mark today as the last check so we don't deduct all past history
         await User.updateOne(
           { _id: customer._id },
           { $set: { "subscription.lastDeductionDate": today } }
         );
      } else if (lastCheck < today) {
         // Process missing days from lastCheck+1 to yesterday
         const lastDate = new Date(lastCheck);
         const todayDate = new Date(today);
         let mealsLost = 0;
         let currentDate = new Date(lastDate);
         currentDate.setDate(currentDate.getDate() + 1);

         const PausedMeal = (await import("@/models/PausedMeal")).default;

         while (currentDate < todayDate) {
            const dateStr = currentDate.toISOString().split("T")[0];
            const isPaused = await PausedMeal.findOne({
               customerId: customer._id,
               pauseFrom: { $lte: dateStr },
               pauseTo: { $gte: dateStr },
            });

            if (!isPaused) {
               const mealsPerDay = sub.mealType === "Both" ? 2 : 1;
               mealsLost += mealsPerDay;
            }
            currentDate.setDate(currentDate.getDate() + 1);
         }

         if (mealsLost > 0) {
            await User.updateOne(
               { _id: customer._id },
               { 
                 $inc: { "subscription.mealsLeft": -mealsLost },
                 $set: { "subscription.lastDeductionDate": today }
               }
            );
            // Refresh local customer object to show updated balance
            const updated = await User.findById(customer._id).lean() as any;
            customer.subscription = updated.subscription;
         } else {
            await User.updateOne(
               { _id: customer._id },
               { $set: { "subscription.lastDeductionDate": today } }
            );
         }
      }
    }

    const PausedMeal = (await import("@/models/PausedMeal")).default;
    const isPausedToday = await PausedMeal.findOne({
      customerId: customer._id,
      pauseFrom: { $lte: today },
      pauseTo: { $gte: today },
    });
    
    if (customer.subscription) {
      const sub = customer.subscription;
      
      // Calculate real status
      const now = new Date();
      const renewalDate = new Date(sub.nextRenewal);
      const isExpiredByDate = renewalDate < now;
      const isExpiredByMeals = (sub.mealsLeft || 0) <= 0;
      
      let liveStatus = sub.status || "Active";
      if (isExpiredByDate || isExpiredByMeals) {
        liveStatus = "Expired";
      } else if (isPausedToday) {
        liveStatus = "Paused";
      }

      // Live Renewal Date Calculation (Projected)
      // If we have meals remaining, we can project when they will finish
      const mealsPerDay = sub.mealType === "Both" ? 2 : 1;
      const daysRemaining = Math.ceil((sub.mealsLeft || 0) / mealsPerDay);
      
      let liveRenewalDateFormatted = "--";
      if (liveStatus !== "Expired" && daysRemaining > 0) {
        const projectedDate = new Date();
        projectedDate.setDate(projectedDate.getDate() + daysRemaining);
        liveRenewalDateFormatted = projectedDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } else if (sub.nextRenewal) {
        liveRenewalDateFormatted = new Date(sub.nextRenewal).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }

      // Member Since calculation
      const memberSinceDate = new Date(customer.createdAt || customer.purchaseDate || new Date());
      const memberSince = memberSinceDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      // Format dates
      const startDateFormatted = sub.startDate ? new Date(sub.startDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : "--";

      return NextResponse.json({
        planName: liveStatus === "Expired" ? "No Active Plan" : (sub.planName || "No active plan"),
        startDate: liveStatus === "Expired" ? "--" : startDateFormatted,
        endDate: liveStatus === "Expired" ? "Plan is Expired" : liveRenewalDateFormatted,
        memberSince: memberSince,
        frequency: sub.mealType === "Both" ? "Lunch & Dinner" : (sub.mealType || "Lunch & Dinner"),
        schedule: "Monday – Saturday",
        mealsRemaining: liveStatus === "Expired" ? 0 : (sub.mealsLeft || 0),
        totalMeals: sub.totalMeals || 0,
        status: liveStatus,
        isPaused: !!isPausedToday,
        mealType: sub.mealType || "Both"
      });
    }

    const memberSinceDate = new Date(customer.createdAt || new Date());
    const memberSince = memberSinceDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return NextResponse.json({
      planName: "No active plan",
      startDate: "--",
      endDate: "--",
      memberSince: memberSince,
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

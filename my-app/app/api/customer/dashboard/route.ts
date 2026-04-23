/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import PausedMeal from "@/models/PausedMeal";
import Menu from "@/models/Menu";
import Delivery from "@/models/Delivery";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const userName = searchParams.get("name") || "Chetan";

    const query = email ? { email: email.toLowerCase() } : { name: userName };
    const customer = await User.findOne(query).lean() as any;

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Please log in to view your dashboard" },
        { status: 401 }
      );
    }

    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const today = new Date(new Date().getTime() + IST_OFFSET).toISOString().split("T")[0];

    // Auto-Deduction Logic
    if (customer && customer.subscription && customer.subscription.status !== "Expired") {
      let sub = customer.subscription;
      const lastCheck = sub.lastDeductionDate;
      
      if (!lastCheck) {
         await User.updateOne(
           { _id: customer._id },
           { $set: { "subscription.lastDeductionDate": today } }
         );
      } else if (lastCheck < today) {
         const lastDate = new Date(lastCheck);
         const todayDate = new Date(today);
         let mealsLost = 0;
         let currentDate = new Date(lastDate);
         currentDate.setDate(currentDate.getDate() + 1);

         while (currentDate < todayDate) {
            const dateStr = currentDate.toISOString().split("T")[0];
            const isPausedRecord = await PausedMeal.findOne({
               customerId: customer._id,
               pauseFrom: { $lte: dateStr },
               pauseTo: { $gte: dateStr },
            });

            if (!isPausedRecord) {
               const mealsPerDayPerActive = sub.mealType === "Both" ? 2 : 1;
               mealsLost += mealsPerDayPerActive;
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

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayName = dayNames[new Date().getDay()];

    const pauseEntry = await PausedMeal.findOne({
      customerId: customer._id,
      pauseFrom: { $lte: today },
      pauseTo: { $gte: today },
    }).lean();

    const todayMenu = await Menu.findOne({ day: currentDayName, isActive: { $ne: false } }).lean() as any;
    const isPaused = !!pauseEntry;
    const sub = (customer.subscription || {}) as any;

    // Calculate live status and projected renewal
    const now = new Date();
    const renewalDate = sub.nextRenewal ? new Date(sub.nextRenewal) : null;
    const isExpiredByDate = renewalDate && renewalDate < now;
    const isExpiredByMeals = sub.mealsLeft <= 0;
    
    let liveStatus = sub.status || "Inactive";
    if (sub.planName) {
      if (isExpiredByDate || isExpiredByMeals) {
        liveStatus = "Expired";
      } else if (isPaused) {
        liveStatus = "Paused";
      } else {
        liveStatus = "Active";
      }
    }

    // Display actual Renewal Date from DB
    let liveRenewalDate = "---";
    if (sub.nextRenewal) {
      liveRenewalDate = new Date(sub.nextRenewal).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    }

    const userDeliveries = await Delivery.find({ 
      customerId: customer._id, 
      date: today 
    }).lean() as any[];

    const getDeliveryStatus = (mType: "Lunch" | "Dinner", timeStr: string) => {
       if (isPaused) return "Meal Paused ⏸️";
       
       const record = userDeliveries.find(d => d.type === mType);
       if (record && record.status === "Delivered") return "Delivered ✅";

       // Time calculation for "Scheduled" vs "Out for Delivery"
       const [time, modifier] = (timeStr || "01:00 PM").trim().split(" ");
       let [hours] = (time || "00").split(":").map(Number);
       if (modifier === "PM" && hours < 12) hours += 12;
       if (modifier === "AM" && hours === 12) hours = 0;
       
       const nowIST = new Date(new Date().getTime() + IST_OFFSET);
       const currentHour = nowIST.getHours();

       if (currentHour >= hours) return "Out for Delivery 🛵";
       return "Scheduled 🕒";
    };

    const hasActivePlan = !!(sub.planName && (liveStatus === "Active" || liveStatus === "Paused"));

    return NextResponse.json({
      user: {
        name: customer.name,
        subscriptionStatus: liveStatus,
        nextRenewal: hasActivePlan ? liveRenewalDate : "---",
        activePlanName: hasActivePlan ? sub.planName : "No Active Plan",
        startDate: hasActivePlan ? sub.startDate : "---",
        totalMeals: hasActivePlan ? (sub.totalMeals || 0) : 0,
        mealsLeft: hasActivePlan ? (sub.mealsLeft || 0) : 0,
        mealType: sub.mealType || "Both",
        pauseDetails: isPaused ? {
          from: pauseEntry.pauseFrom,
          to: pauseEntry.pauseTo,
          reason: pauseEntry.reason
        } : null,
        hasActivePlan: hasActivePlan,
      },
      todayMeal: {
        items: isPaused
          ? "Your meal delivery is paused for today."
          : (todayMenu ? todayMenu.lunch : "No service scheduled for today. (Kitchen Closed)"),
        type: "Lunch",
        deliveryTime: (isPaused || !todayMenu) ? "--:-- PM" : (todayMenu.lunchTime || "01:00 PM"),
        status: !todayMenu ? "Closed ❌" : getDeliveryStatus("Lunch", todayMenu.lunchTime || "01:00 PM"),
      },
      todayDinner: {
        items: isPaused
          ? "Your meal delivery is paused for today."
          : (todayMenu ? todayMenu.dinner : "No service scheduled for today. (Kitchen Closed)"),
        type: "Dinner",
        deliveryTime: (isPaused || !todayMenu) ? "--:-- PM" : (todayMenu.dinnerTime || "08:00 PM"),
        status: !todayMenu ? "Closed ❌" : getDeliveryStatus("Dinner", todayMenu.dinnerTime || "08:00 PM"),
      },
      quickStats: [
        {
          title: "Active Plan",
          value: hasActivePlan ? sub.planName : "No Active Plan",
          icon: "👑",
          subtext: `Status: ${liveStatus || "Inactive"}`,
          subtextClass: (liveStatus === "Expired" || liveStatus === "Inactive") ? "text-red-500 font-bold" : liveStatus === "Paused" ? "text-yellow-500 font-bold" : "text-orange-600 font-bold",
        },
        {
          title: "Delivery Status",
          value: liveStatus === "Paused" ? "Paused" : (hasActivePlan ? "Active" : "None"),
          icon: liveStatus === "Paused" ? "⏸️" : "🛵",
          subtext: liveStatus === "Paused" ? "Service paused by you" : (hasActivePlan ? "Arriving by 01:00 PM" : "No active subscription"),
          subtextClass: liveStatus === "Paused" ? "text-red-500 font-bold" : "text-orange-600",
        },
        {
          title: "Meals Left",
          value: hasActivePlan ? (sub.mealsLeft || 0) : 0,
          icon: "🍱",
          subtext: hasActivePlan ? `Out of ${sub.totalMeals || 0} meals` : "Plan ended or not found",
        },
      ],
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

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
    let sub = (customer.subscription || {}) as any;
    let liveStatus = sub.status || "Inactive";
    const isExpiredByDate = sub.nextRenewal && sub.nextRenewal < today;
    const isExpiredByMeals = sub.mealsLeft <= 0;

    // Queue Activation Logic
    if ((!sub.planName || liveStatus === "Expired" || isExpiredByMeals || isExpiredByDate) && customer.queuedSubscriptions?.length > 0) {
        const nextSub = customer.queuedSubscriptions[0];
        const remainingQueue = customer.queuedSubscriptions.slice(1);
        
        const nowIST = new Date(new Date().getTime() + IST_OFFSET);
        const hourIST = nowIST.getUTCHours();
        const isBefore11AM = hourIST < 11;
        
        const startDateObj = new Date(nowIST);
        if (!isBefore11AM) startDateObj.setUTCDate(startDateObj.getUTCDate() + 1);
        
        const newStartDate = startDateObj.toISOString().split("T")[0];
        const mealsPerDay = nextSub.mealType === "Both" ? 2 : 1;
        const duration = Math.ceil(nextSub.totalMeals / mealsPerDay) || 30;
        
        const newNextRenewal = new Date(startDateObj.getTime() + duration * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        const updatedSub = {
          ...nextSub,
          status: "Active",
          startDate: newStartDate,
          nextRenewal: newNextRenewal,
          lastDeductionDate: today
        };

        await User.updateOne(
          { _id: customer._id },
          { 
            $set: { 
              subscription: updatedSub,
              queuedSubscriptions: remainingQueue
            } 
          }
        );
        
        const reloaded = await User.findById(customer._id).lean() as any;
        customer.subscription = reloaded.subscription;
        customer.queuedSubscriptions = reloaded.queuedSubscriptions;
        sub = customer.subscription;
        liveStatus = "Active";
    }

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

      const Holiday = (await import("@/models/Holiday")).default;
      const todayHoliday = await Holiday.findOne({
        startDate: { $lte: today },
        endDate: { $gte: today },
        isActive: true
      }).lean();

      const getDeliveryStatus = (mType: "Lunch" | "Dinner", timeStr: string) => {
         if (todayHoliday) return `Holiday: ${todayHoliday.title}`;
         if (isPaused) return "Paused";
         if (!hasActivePlan) return "No Active Plan";
         
         const mealType = sub.mealType || "Both";
         if (mealType !== "Both" && mealType !== mType) return "Not in Plan";
         
         const record = userDeliveries.find(d => d.type === mType);
         if (record) {
            if (record.status === "Delivered") return "Delivered";
            if (record.status === "Out for Delivery") return "Out for Delivery";
            if (record.status === "Prepared") return "Prepared";
            if (record.status === "Pending") return "Confirmed";
            if (record.status === "Cancelled") return "Cancelled";
         }

         return "Scheduled";
      };

    const currentStatus = liveStatus.toLowerCase();
    const hasActivePlan = !!(sub.planName && (currentStatus === "active" || currentStatus === "paused"));

    const SiteSettings = (await import("@/models/SiteSettings")).default;
    const settings = await SiteSettings.findOne().lean() as any;
    const kitchenAddress = settings?.contact?.address || "Karond, Bhopal, Madhya Pradesh, India";
    const kitchenLat = settings?.contact?.latitude || 23.2974;
    const kitchenLng = settings?.contact?.longitude || 77.4025;

    return NextResponse.json({
      kitchenAddress,
      kitchenLocation: { lat: kitchenLat, lng: kitchenLng },
      user: {
        name: customer.name,
        subscriptionStatus: liveStatus,
        nextRenewal: hasActivePlan ? liveRenewalDate : "---",
        activePlanName: hasActivePlan ? sub.planName : "No Active Plan",
        startDate: hasActivePlan ? sub.startDate : "---",
        totalMeals: hasActivePlan ? (sub.totalMeals || 0) : 0,
        mealsLeft: hasActivePlan ? (sub.mealsLeft || 0) : 0,
        mealType: sub.mealType || "Both",
        queuedSubscriptions: customer.queuedSubscriptions || [],
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
        deliveryId: userDeliveries.find(d => d.type === "Lunch")?._id || null,
        driverLocation: userDeliveries.find(d => d.type === "Lunch")?.driverLocation || null,
        estimatedArrival: userDeliveries.find(d => d.type === "Lunch")?.estimatedArrival || null,
        address: sub.deliveryAddress || customer.address || "",
        customerId: customer._id
      },
      todayDinner: {
        items: isPaused
          ? "Your meal delivery is paused for today."
          : (todayMenu ? todayMenu.dinner : "No service scheduled for today. (Kitchen Closed)"),
        type: "Dinner",
        deliveryTime: (isPaused || !todayMenu) ? "--:-- PM" : (todayMenu.dinnerTime || "08:00 PM"),
        status: !todayMenu ? "Closed ❌" : getDeliveryStatus("Dinner", todayMenu.dinnerTime || "08:00 PM"),
        deliveryId: userDeliveries.find(d => d.type === "Dinner")?._id || null,
        driverLocation: userDeliveries.find(d => d.type === "Dinner")?.driverLocation || null,
        estimatedArrival: userDeliveries.find(d => d.type === "Dinner")?.estimatedArrival || null,
        address: sub.deliveryAddress || customer.address || "",
        customerId: customer._id
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
      holiday: await (async () => {
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        const nextMonthStr = nextMonth.toISOString().split("T")[0];
        
        const upcomingHolidays = await Holiday.find({
          endDate: { $gte: today },
          startDate: { $lte: nextMonthStr },
          isActive: true
        }).sort({ startDate: 1 }).lean();
        
        return upcomingHolidays.length > 0 ? { 
          title: upcomingHolidays[0].title, 
          reason: upcomingHolidays[0].reason,
          startDate: upcomingHolidays[0].startDate,
          endDate: upcomingHolidays[0].endDate
        } : null;
      })()
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

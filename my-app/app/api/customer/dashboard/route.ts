export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import PausedMeal from "@/models/PausedMeal";
import Menu from "@/models/Menu";

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

    const today = new Date().toISOString().split("T")[0];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayName = dayNames[new Date().getDay()];

    const pauseEntry = await PausedMeal.findOne({
      customerId: customer._id,
      pauseFrom: { $lte: today },
      pauseTo: { $gte: today },
    }).lean();

    const todayMenu = await Menu.findOne({ day: currentDayName }).lean() as any;
    const isPaused = !!pauseEntry;
    const sub = (customer.subscription || {}) as any;

    const isPastTime = (timeStr: string) => {
      if (!timeStr) return false;
      const nowUTC = new Date();
      const nowIST = new Date(nowUTC.getTime() + (5 * 60 + 30) * 60 * 1000);
      const [time, modifier] = timeStr.trim().split(" ");
      let [hours, minutes] = (time || "00:00").split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      const deliveryMinutes = hours * 60 + (minutes || 0);
      const currentMinutes = nowIST.getUTCHours() * 60 + nowIST.getUTCMinutes();
      return currentMinutes >= deliveryMinutes;
    };

    const getStatus = (baseStatus: string, timeStr: string, type: string) => {
       if (isPaused) return "Meal Paused ⏸️";
       if (isPastTime(timeStr)) return "Delivered ✅";
       return baseStatus || (type === "Lunch" ? "Out for Delivery" : "Scheduled");
    };

    return NextResponse.json({
      user: {
        name: customer.name,
        subscriptionStatus: isPaused ? "Paused" : (sub.status || "Inactive"),
        nextRenewal: sub.nextRenewal || "N/A",
        activePlanName: sub.planName || "No Plan",
        pauseDetails: isPaused ? {
          from: pauseEntry.pauseFrom,
          to: pauseEntry.pauseTo,
          reason: pauseEntry.reason
        } : null,
      },
      todayMeal: {
        items: isPaused
          ? "Your meal delivery is paused for today."
          : (todayMenu?.lunch || "4 Roti, Paneer Masala, Dal, Rice, Salad"),
        type: "Lunch",
        deliveryTime: isPaused ? "--:-- PM" : (todayMenu?.lunchTime || "01:00 PM"),
        status: getStatus(todayMenu?.lunchStatus, todayMenu?.lunchTime || "01:00 PM", "Lunch"),
      },
      todayDinner: {
        items: isPaused
          ? "Your meal delivery is paused for today."
          : (todayMenu?.dinner || "4 Roti, Veg Gravy, Dal, Rice, Salad"),
        type: "Dinner",
        deliveryTime: isPaused ? "--:-- PM" : (todayMenu?.dinnerTime || "08:00 PM"),
        status: getStatus(todayMenu?.dinnerStatus, todayMenu?.dinnerTime || "08:00 PM", "Dinner"),
      },
      quickStats: [
        {
          title: "Active Plan",
          value: sub.planName || "No Plan",
          icon: "👑",
          subtext: `Status: ${isPaused ? "Paused" : (sub.status || "Inactive")}`,
          subtextClass: isPaused ? "text-red-500 font-bold" : "text-orange-600 font-bold",
        },
        {
          title: "Delivery Status",
          value: isPaused ? "Paused" : "Dispatched",
          icon: isPaused ? "⏸️" : "🛵",
          subtext: isPaused ? "Service paused by you" : "Arriving by 01:00 PM",
          subtextClass: isPaused ? "text-red-500 font-bold" : "text-orange-600",
        },
        {
          title: "Meals Left",
          value: sub.mealsLeft || 0,
          icon: "🍱",
          subtext: `Out of ${sub.totalMeals || 0} meals`,
        },
      ],
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

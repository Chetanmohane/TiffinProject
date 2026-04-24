import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Delivery from "@/models/Delivery";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const today = new Date(new Date().getTime() + IST_OFFSET).toISOString().split("T")[0];

    // 1. Fetch all customers with an active or paused subscription
    const customers = await User.find({ 
      role: "customer", 
      "subscription.status": { $in: ["Active", "Paused"] } 
    }).lean() as any[];

    const PausedMeal = (await import("@/models/PausedMeal")).default;
    const deliveries = await Delivery.find({ date: today }).lean() as any[];

    const list: any[] = [];

    for (const customer of customers) {
      const sub = customer.subscription;
      if (!sub) continue;

      // Skip if totally expired by date or meals
      // Use today's date string for comparison to avoid timezone/time-of-day issues
      if (sub.nextRenewal < today || sub.mealsLeft <= 0) continue;

      // Check pause status for today
      const isPausedToday = await PausedMeal.findOne({
        customerId: customer._id,
        pauseFrom: { $lte: today },
        pauseTo: { $gte: today },
      });

      // Determine which meal items to show (Lunch, Dinner, or Both)
      const mealTypesToShow: ("Lunch" | "Dinner")[] = [];
      if (sub.mealType === "Both") {
        mealTypesToShow.push("Lunch", "Dinner");
      } else if (sub.mealType === "Lunch" || sub.mealType === "Dinner") {
        mealTypesToShow.push(sub.mealType);
      } else {
        // Default to Both if not specified but active
        mealTypesToShow.push("Lunch", "Dinner");
      }

      for (const mType of mealTypesToShow) {
        // Find if a delivery record already exists for this slot
        const existingDelivery = deliveries.find(
          (d) => d.customerId.toString() === customer._id.toString() && d.type === mType
        );

        const isGloballyPaused = sub.status === "Paused";
        
        let finalStatus = "Scheduled";
        if (isPausedToday || isGloballyPaused) {
          finalStatus = "Paused";
        } else if (existingDelivery) {
          finalStatus = existingDelivery.status;
        }

        list.push({
          id: existingDelivery?._id || `temp-${customer._id}-${mType}`,
          deliveryId: existingDelivery?._id || null,
          customerId: customer._id,
          customerName: customer.name,
          phone: customer.phone,
          address: customer.address,
          type: mType, // The specific slot (Lunch or Dinner)
          planType: sub.mealType || "Both", // The overall plan (Lunch, Dinner, or Both)
          status: finalStatus,
          paused: !!isPausedToday || isGloballyPaused,
          mealsLeft: sub.mealsLeft || 0,
        });
      }
    }

    const SiteSettings = (await import("@/models/SiteSettings")).default;
    const settings = await SiteSettings.findOne().lean() as any;
    const kitchenAddress = settings?.contact?.address || "Indore, India";

    return NextResponse.json({ 
      deliveries: list, 
      date: today,
      kitchenAddress 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { id, status, customerId, type } = await req.json();
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const today = new Date(new Date().getTime() + IST_OFFSET).toISOString().split("T")[0];

    let delivery;
    let oldStatus = "Scheduled";

    if (id && !id.toString().startsWith("temp-")) {
      delivery = await Delivery.findById(id);
      if (delivery) {
        oldStatus = delivery.status;
      }
    }

    // Handle meal deduction/return logic
    if (status === "Delivered" && oldStatus !== "Delivered") {
       const targetCustomerId = delivery ? delivery.customerId : customerId;
       const updatedUser = await User.findById(targetCustomerId);
       if (updatedUser && updatedUser.subscription) {
          updatedUser.subscription.mealsLeft = Math.max(0, (updatedUser.subscription.mealsLeft || 0) - 1);
          if (updatedUser.subscription.mealsLeft <= 0) updatedUser.subscription.status = "Expired";
          await updatedUser.save();
       }
    } else if (status !== "Delivered" && oldStatus === "Delivered" && delivery) {
       const updatedUser = await User.findById(delivery.customerId);
       if (updatedUser && updatedUser.subscription) {
          updatedUser.subscription.mealsLeft += 1;
          if (updatedUser.subscription.status === "Expired" && updatedUser.subscription.mealsLeft > 0) {
             updatedUser.subscription.status = "Active";
          }
          await updatedUser.save();
       }
    }

    if (!delivery) {
       const targetCustomerId = customerId;
       const customer = await User.findById(targetCustomerId).select("name").lean() as any;
       await Delivery.create({
         customerId: targetCustomerId,
         customerName: customer?.name || "Customer",
         type: type || "Lunch",
         date: today,
         status: status,
         targetTime: type === "Dinner" ? "08:00 PM" : "01:00 PM"
       });
    } else {
       delivery.status = status;
       await delivery.save();
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

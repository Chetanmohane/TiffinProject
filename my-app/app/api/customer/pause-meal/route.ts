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

    const customerPauses = await PausedMeal.find({ customerName: customer.name }).lean();
    const hasActivePlan = customer.subscription?.status === "Active";

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
      const hasActivePlan = customer.subscription?.status === "Active";
      if (!hasActivePlan) {
        throw new Error("You don't have any active plan. Please buy a plan to pause your meals.");
      }
      
      const planStart = customer.subscription.startDate;
      const planEnd = customer.subscription.nextRenewal;
      
      if (planStart && item.from < planStart) {
          throw new Error(`You can only pause meals after your plan starts (${planStart}).`);
      }
      
      if (planEnd && item.to > planEnd) {
          throw new Error(`You can only pause meals before your plan ends (${planEnd}).`);
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

      await PausedMeal.create({ 
        customerId: customer._id,
        customerName: customer.name, 
        phone: customer.phone || "N/A", 
        planName: customer.subscription?.planName || "Active Plan",
        pauseFrom: item.from,
        pauseTo: item.to,
        reason: item.reason
      });
    } else if (action === "remove") {
      await PausedMeal.findByIdAndDelete(body.id);
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

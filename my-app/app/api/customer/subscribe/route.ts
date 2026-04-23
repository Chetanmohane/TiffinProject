import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";
import Payment from "@/models/Payment";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { planId, email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required. Please log in again." }, { status: 400 });
    }

    const plan = await Plan.findById(planId).lean() as any;
    if (!plan) throw new Error("Plan not found");

    const customer = await User.findOne({ email: email.toLowerCase() });
    if (!customer) throw new Error("Customer not found");

    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(new Date().getTime() + IST_OFFSET);
    const hourIST = nowIST.getUTCHours();
    const isBefore11AM = hourIST < 11;
    
    let startDateObj = new Date(nowIST);
    if (!isBefore11AM) {
      startDateObj.setUTCDate(startDateObj.getUTCDate() + 1);
    }
    
    const startDate = startDateObj.toISOString().split("T")[0];
    const nextRenewal = new Date(startDateObj.getTime() + plan.duration * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const totalMeals = plan.duration * plan.mealsPerDay;

    if ((customer.walletBalance || 0) < plan.price) {
      throw new Error("Insufficient wallet balance. Please recharge first.");
    }

    customer.walletBalance = (customer.walletBalance || 0) - plan.price;
    customer.subscription = {
      planName: plan.name,
      status: "Active",
      startDate,
      nextRenewal,
      purchaseDate: new Date(),
      mealsLeft: totalMeals,
      totalMeals,
    };
    await customer.save();

    await Payment.create({
      customerId: customer._id,
      customerName: customer.name,
      date: startDate,
      endDate: nextRenewal,
      description: plan.name,
      type: "Debit",
      amount: plan.price,
      status: "Success",
    });

    return NextResponse.json({ success: true, message: "Subscription updated! Payment recorded." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

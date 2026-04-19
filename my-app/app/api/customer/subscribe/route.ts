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

    const startDate = new Date().toISOString().split("T")[0];
    const nextRenewal = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const totalMeals = plan.duration * plan.mealsPerDay;

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

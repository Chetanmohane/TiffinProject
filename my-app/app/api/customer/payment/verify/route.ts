import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";
import Payment from "@/models/Payment";

async function performVerification(order_id: string, plan_id: string, email: string, meal_type: string) {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) throw new Error("Credentials missing");

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-version": "2023-08-01",
      "x-client-id": appId,
      "x-client-secret": secretKey,
    },
  };

  const isProd = secretKey.startsWith("cfsk_ma_prod_") || process.env.NODE_ENV === "production";
  const url = isProd 
    ? `https://api.cashfree.com/pg/orders/${order_id}` 
    : `https://sandbox.cashfree.com/pg/orders/${order_id}`;

  let orderData: any = null;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    const response = await fetch(url, options);
    orderData = await response.json();

    if (orderData.order_status === "PAID") break;
    
    // Wait 2 seconds before retry
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }

  if (orderData.order_status !== "PAID") {
    // Don't mark as Failed yet, just throw error so user can retry manually or wait
    throw new Error(`Payment verification pending. Status: ${orderData.order_status}. Please refresh in a moment.`);
  }

  const plan = await Plan.findById(plan_id).lean() as any;
  if (!plan) throw new Error("Plan not found");

  const customer = await User.findOne({ email: email.toLowerCase() });
  if (!customer) throw new Error("Customer not found");

  const existingSuccess = await Payment.findOne({ transactionId: order_id, status: "Success" });
  if (existingSuccess) return { success: true, alreadyProcessed: true };

  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(new Date().getTime() + IST_OFFSET);
  const hourIST = nowIST.getUTCHours();
  const isBefore11AM = hourIST < 11;
  
  let startDateObj = new Date(nowIST);
  if (!isBefore11AM) startDateObj.setUTCDate(startDateObj.getUTCDate() + 1);
  
  const startDate = startDateObj.toISOString().split("T")[0];
  const nextRenewal = new Date(startDateObj.getTime() + plan.duration * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  
  let mealsPerDay = plan.mealsPerDay || 1;
  let actualPaidAmount = plan.price;
  
  if (meal_type === "Lunch") {
     mealsPerDay = 1;
     actualPaidAmount = plan.lunchPrice || plan.price;
  } else if (meal_type === "Dinner") {
     mealsPerDay = 1;
     actualPaidAmount = plan.dinnerPrice || plan.price;
  } else if (meal_type === "Both") {
     mealsPerDay = 2;
     actualPaidAmount = plan.bothPrice || plan.price;
  }

  const totalMeals = plan.duration * mealsPerDay;

  customer.subscription = {
    planName: `${plan.name} (${meal_type})`,
    status: "Active",
    startDate,
    nextRenewal,
    purchaseDate: new Date(),
    mealsLeft: totalMeals,
    totalMeals,
    mealType: meal_type
  };
  await customer.save();

  await Payment.findOneAndUpdate(
    { transactionId: order_id },
    {
      customerId: customer._id,
      customerName: customer.name,
      phone: customer.phone,
      date: startDate,
      endDate: nextRenewal,
      description: `${plan.name} - ${meal_type}`,
      type: "Credit",
      amount: actualPaidAmount,
      status: "Success",
      transactionId: order_id,
      planName: plan.name
    },
    { upsert: true, new: true }
  );

  return { success: true };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const order_id = searchParams.get("order_id");
    const plan_id = searchParams.get("plan_id");
    const email = searchParams.get("email");
    const meal_type = searchParams.get("meal_type") || "Both";

    if (!order_id || !plan_id || !email) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/customer/dashboard/plan?error=invalid_callback`);
    }

    const origin = new URL(req.url).origin;
    await connectDB();
    await performVerification(order_id, plan_id, email, meal_type);

    return NextResponse.redirect(`${origin}/customer/dashboard/plan?success=true`);
  } catch (error: any) {
    const origin = new URL(req.url).origin;
    console.error("Verification Error:", error);
    return NextResponse.redirect(`${origin}/customer/dashboard/plan?error=${encodeURIComponent(error.message)}`);
  }
}

export async function POST(req: Request) {
  try {
    const { order_id, plan_id, email, meal_type } = await req.json();
    await connectDB();
    const result = await performVerification(order_id, plan_id, email, meal_type);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

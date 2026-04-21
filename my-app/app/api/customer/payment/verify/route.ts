import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";
import Payment from "@/models/Payment";

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

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/customer/dashboard/plan?error=credentials_missing`);
    }

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

    const response = await fetch(url, options);
    const orderData = await response.json();

    if (orderData.order_status !== "PAID") {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/customer/dashboard/plan?error=payment_failed_[Status:${orderData.order_status}]`);
    }

    // Process the subscription activation
    await connectDB();
    const plan = await Plan.findById(plan_id).lean() as any;
    if (!plan) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/customer/dashboard/plan?error=plan_not_found`);

    const customer = await User.findOne({ email: email.toLowerCase() });
    if (!customer) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/customer/dashboard/plan?error=customer_not_found`);

    // Check if we already processed this order to prevent double credits
    const existingPayment = await Payment.findOne({ transactionId: order_id });
    if (existingPayment) {
       return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/customer/dashboard/plan?success=true`);
    }

    const startDate = new Date().toISOString().split("T")[0];
    const nextRenewal = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
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

    await Payment.create({
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
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/customer/dashboard/plan?success=true`);
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/customer/dashboard/plan?error=server_error`);
  }
}

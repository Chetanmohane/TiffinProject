import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";
import Payment from "@/models/Payment";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { planId, email, mealType } = await req.json();

    if (!email) throw new Error("Email is required");

    const plan = await Plan.findById(planId).lean() as any;
    if (!plan) throw new Error("Plan not found");

    // Determine price based on mealType
    let orderAmount = plan.price;
    if (mealType === "Lunch") orderAmount = plan.lunchPrice;
    else if (mealType === "Dinner") orderAmount = plan.dinnerPrice;
    else if (mealType === "Both") orderAmount = plan.bothPrice;
    
    if (!orderAmount || orderAmount <= 0) {
      orderAmount = plan.price; // fallback
    }

    const customer = await User.findOne({ email: email.toLowerCase() });
    if (!customer) throw new Error("Customer not found");

    const orderId = `order_${Date.now()}_${customer._id}`;

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      throw new Error("Cashfree credentials are not configured in environment variables");
    }

    const isProd = secretKey.startsWith("cfsk_ma_prod_") || process.env.NODE_ENV === "production";

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "x-api-version": "2023-08-01",
        "content-type": "application/json",
        "x-client-id": appId,
        "x-client-secret": secretKey,
      },
      body: JSON.stringify({
        customer_details: {
          customer_id: customer._id.toString(),
          customer_email: customer.email,
          customer_phone: "9999999999", // Hardcoded to bypass Strict Cashfree Regex formatting errors on bad DB entries
          customer_name: customer.name || "Customer",
        },
        order_amount: orderAmount,
        order_currency: "INR",
        order_id: orderId,
        order_note: mealType || "Subscription"
      }),
    };

    const response = await fetch(
      isProd ? "https://api.cashfree.com/pg/orders" : "https://sandbox.cashfree.com/pg/orders",
      options
    );
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create Cashfree order");
    }

    // Create a pending payment record in our DB
    await Payment.create({
      customerId: customer._id,
      customerName: customer.name,
      amount: orderAmount,
      type: "Credit",
      description: `${plan.name} (${mealType})`,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
      transactionId: orderId,
    });

    return NextResponse.json({ 
      success: true, 
      payment_session_id: data.payment_session_id, 
      order_id: orderId,
      environment: isProd ? "production" : "sandbox" 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

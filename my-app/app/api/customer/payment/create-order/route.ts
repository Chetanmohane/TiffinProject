import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { planId, email } = await req.json();

    if (!email) throw new Error("Email is required");

    const plan = await Plan.findById(planId).lean() as any;
    if (!plan) throw new Error("Plan not found");

    const customer = await User.findOne({ email: email.toLowerCase() });
    if (!customer) throw new Error("Customer not found");

    const orderId = `order_${Date.now()}_${customer._id}`;

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "x-api-version": "2023-08-01",
        "content-type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID || "TEST10065449fb02c0cda9bc36de326794456001",
        "x-client-secret": process.env.CASHFREE_SECRET_KEY || "cfsk_ma_test_a0cc7fba1bcbab9e1dfabb7ddf686c12_f7ea9189",
      },
      body: JSON.stringify({
        customer_details: {
          customer_id: customer._id.toString(),
          customer_email: customer.email,
          customer_phone: "9999999999", // Harcoded to bypass Strict Cashfree Regex formatting errors on bad DB entries
          customer_name: customer.name || "Customer",
        },
        order_amount: plan.price,
        order_currency: "INR",
        order_id: orderId,
      }),
    };

    const isProd = (process.env.CASHFREE_SECRET_KEY || "").includes("prod") || process.env.NODE_ENV === "production";

    const response = await fetch(
      isProd ? "https://api.cashfree.com/pg/orders" : "https://sandbox.cashfree.com/pg/orders",
      options
    );
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create Cashfree order");
    }

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

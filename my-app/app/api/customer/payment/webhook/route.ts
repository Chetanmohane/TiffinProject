import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";
import Payment from "@/models/Payment";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Cashfree Webhook Received:", body);

    const order_id = body?.data?.order?.order_id || body?.orderId;
    if (!order_id) {
       return NextResponse.json({ success: false, message: "No order_id in webhook" });
    }

    // 1. Fetch live status from Cashfree to be 100% sure (Zero Trust approach)
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      throw new Error("Credentials missing");
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

    const cfRes = await fetch(url, options);
    const orderData = await cfRes.json();

    await connectDB();

    if (orderData.order_status === "PAID") {
       // Find the pending payment record
       const pmnt = await Payment.findOne({ transactionId: order_id });
       if (!pmnt) {
          console.log("Payment record not found for webhook order:", order_id);
          return NextResponse.json({ success: false, message: "Internal payment record missing" });
       }

       if (pmnt.status === "Success") {
          return NextResponse.json({ success: true, message: "Already processed" });
       }

       // Activate Subscription
       const customer = await User.findById(pmnt.customerId);
       if (!customer) throw new Error("Customer not found");

       // Extract plan details from description
       const planName = pmnt.planName || pmnt.description.split(" - ")[0];
       const plan = await Plan.findOne({ name: planName });
       if (!plan) throw new Error("Plan not found");

       const now = new Date();
       const isBefore11AM = now.getHours() < 11;
       
       let startDateObj = new Date();
       if (!isBefore11AM) {
         startDateObj.setDate(startDateObj.getDate() + 1);
       }
       
       const startDate = startDateObj.toISOString().split("T")[0];
       const nextRenewal = new Date(startDateObj.getTime() + plan.duration * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
       
       const mealType = pmnt.description.includes("Both") ? "Both" : (pmnt.description.includes("Lunch") ? "Lunch" : "Dinner");
       const totalMeals = plan.duration * (mealType === "Both" ? 2 : 1);

       customer.subscription = {
         planName: `${plan.name} (${mealType})`,
         status: "Active",
         startDate,
         nextRenewal,
         purchaseDate: new Date(),
         mealsLeft: totalMeals,
         totalMeals,
         mealType
       };
       await customer.save();

       // Update Payment Status
       pmnt.status = "Success";
       pmnt.date = startDate;
       pmnt.endDate = nextRenewal;
       await pmnt.save();

       console.log("Cashfree Webhook: Payment Verified & Plan Activated Automatically!");
       return NextResponse.json({ success: true, message: "Webhook processed successfully" });
    } else if (orderData.order_status === "FAILED" || orderData.order_status === "CANCELLED") {
       await Payment.findOneAndUpdate({ transactionId: order_id }, { status: "Failed" });
       return NextResponse.json({ success: true, message: "Payment failed marked" });
    }

    return NextResponse.json({ success: true, message: "Status ignored: " + orderData.order_status });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

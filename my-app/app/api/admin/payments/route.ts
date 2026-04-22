import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const payments = await Payment.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ payments });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { action, id, payment } = await req.json();

    if (action === "add") {
      await Payment.create({
        customerId: payment.customerId,
        customerName: payment.customerName,
        amount: parseFloat(String(payment.amt || payment.amount).replace(/[^\d.]/g, "")),
        type: payment.type,
        description: payment.desc || payment.description || "Manual Payment",
        status: payment.status || "Pending",
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      });
    }

    if (action === "verify") {
      const pmnt = await Payment.findById(id);
      if (!pmnt) throw new Error("Payment not found");

      // SMART AUTO-SYNC: If it's a Cashfree order, check live status first
      if (pmnt.transactionId && pmnt.transactionId.startsWith("order_")) {
        try {
          const appId = process.env.CASHFREE_APP_ID;
          const secretKey = process.env.CASHFREE_SECRET_KEY;
          const isProd = secretKey?.startsWith("cfsk_ma_prod_") || process.env.NODE_ENV === "production";
          const url = isProd 
            ? `https://api.cashfree.com/pg/orders/${pmnt.transactionId}` 
            : `https://sandbox.cashfree.com/pg/orders/${pmnt.transactionId}`;

          const res = await fetch(url, {
            headers: {
              "x-api-version": "2023-08-01",
              "x-client-id": appId || "",
              "x-client-secret": secretKey || "",
            }
          });
          const orderData = await res.json();

          if (orderData.order_status === "PAID") {
            // Auto-Activate plan if not done
            const customer = await User.findById(pmnt.customerId);
            const Plan = (await import("@/models/Plan")).default;
            // Try to find plan from description
            const planRef = await Plan.findOne({ name: pmnt.planName || pmnt.description.split(" - ")[0] });
            
            if (customer && planRef) {
              const startDate = new Date().toISOString().split("T")[0];
              const nextRenewal = new Date(Date.now() + planRef.duration * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
              const mealType = pmnt.description.includes("Lunch") ? "Lunch" : (pmnt.description.includes("Dinner") ? "Dinner" : "Both");
              const totalMeals = planRef.duration * (mealType === "Both" ? 2 : 1);

              customer.subscription = {
                planName: `${planRef.name} (${mealType})`,
                status: "Active",
                startDate,
                nextRenewal,
                purchaseDate: new Date(),
                mealsLeft: totalMeals,
                totalMeals,
                mealType
              };
              await customer.save();
            }
            await Payment.findByIdAndUpdate(id, { status: "Success" });
            return NextResponse.json({ success: true, message: "Transaction verified with Gateway and Plan activated!" });
          }
        } catch (e) {
          console.error("Gateway Sync Failed:", e);
        }
      }

      // Fallback: Manual wallet credit for direct payments
      if (pmnt.type === "Credit") {
        const customer = await User.findById(pmnt.customerId);
        if (!customer) throw new Error(`Customer not found.`);
        customer.walletBalance = (customer.walletBalance || 0) + pmnt.amount;
        await customer.save();
      }

      await Payment.findByIdAndUpdate(id, { status: "Success" });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

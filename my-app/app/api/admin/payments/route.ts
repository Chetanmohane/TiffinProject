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

      if (pmnt.type === "Credit") {
        const customer = await User.findOne({ name: pmnt.customerName });
        if (!customer) throw new Error(`Customer "${pmnt.customerName}" not found.`);
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

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Payment from "@/models/Payment";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const userName = searchParams.get("name") || "Chetan";
    
    let query: any = email ? { email: email.toLowerCase() } : { name: userName };
    const customer = await User.findOne(query).lean() as any;
    
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const payments = await Payment.find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedHistory = payments.map((p: any) => ({
      ...p,
      amt: p.amount ? `₹${p.amount}` : "₹0",
      desc: p.description || "Wallet Transaction",
    }));

    return NextResponse.json({
      walletBalance: `₹${customer.walletBalance || 0}.00`,
      history: formattedHistory || []
    });
  } catch (error: any) {
    console.error("Payments API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { amount, email, name } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    let query: any = email ? { email: email.toLowerCase() } : { name: name || "Chetan" };
    const customer = await User.findOne(query);
    
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    customer.walletBalance = (customer.walletBalance || 0) + Number(amount);
    await customer.save();

    await Payment.create({
      customerId: customer._id,
      customerName: customer.name,
      amount: Number(amount),
      type: "Credit",
      description: "Wallet Recharge",
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: "Success"
    });

    return NextResponse.json({ success: true, newBalance: customer.walletBalance });
  } catch (error: any) {
    console.error("Payment POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    
    if (!customer) throw new Error("Customer not found");

    const payments = await Payment.find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .lean();

    const historyData = payments.map((p: any) => ({
      date: p.date || new Date(p.createdAt).toLocaleDateString(),
      endDate: p.endDate || "",
      plan: p.description || "Meal Charge",
      status: p.status || "Success",
      amount: p.amount ? `₹${p.amount}` : "₹0"
    }));

    return NextResponse.json({ history: historyData });
  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({ history: [] });
  }
}

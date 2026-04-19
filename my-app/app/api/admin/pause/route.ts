import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PausedMeal from "@/models/PausedMeal";

export async function GET() {
  try {
    await connectDB();
    const pausedCustomers = await PausedMeal.find({}).lean();
    return NextResponse.json({
      pausedCustomers: pausedCustomers.map((p: any) => ({
        id: p._id,
        customerName: p.customerName,
        phone: p.phone,
        planName: p.planName,
        pauseFrom: p.pauseFrom,
        pauseTo: p.pauseTo,
        reason: p.reason,
        status: p.status,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { action, id } = await req.json();
    if (action === "resume") {
      await PausedMeal.findByIdAndDelete(id);
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

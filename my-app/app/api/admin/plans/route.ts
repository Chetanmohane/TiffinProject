import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Plan from "@/models/Plan";

export async function GET() {
  try {
    await connectDB();
    const plans = await Plan.find({}).lean();
    return NextResponse.json({ plans });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { _id, id, ...planData } = body;
    const targetId = _id || id;

    if (targetId) {
      const updated = await Plan.findByIdAndUpdate(targetId, planData, { new: true });
      return NextResponse.json({ success: true, plan: updated });
    } else {
      const created = await Plan.create(planData);
      return NextResponse.json({ success: true, plan: created });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();
    await Plan.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

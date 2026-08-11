export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Plan from "@/models/Plan";

export async function GET() {
  try {
    await connectDB();
    const plans = await Plan.find({ visible: true }).lean();
    return NextResponse.json(
      { plans: plans || [] },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Delivery from "@/models/Delivery";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const deliveries = await Delivery.find({}).lean();

    const enriched = await Promise.all(
      deliveries.map(async (d: any) => {
        const customer = await User.findById(d.customerId)
          .select("name phone address")
          .lean() as any;
        return {
          ...d,
          id: d._id,
          customerName: customer?.name || d.customerName,
          phone: customer?.phone || "N/A",
          address: customer?.address || "Address not found",
        };
      })
    );

    return NextResponse.json({ deliveries: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { id, status } = await req.json();
    await Delivery.findByIdAndUpdate(id, { status });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

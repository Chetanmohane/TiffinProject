import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Delivery from "@/models/Delivery";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { deliveryId, lat, lng, estimatedArrival } = await req.json();

    if (!deliveryId) {
      return NextResponse.json({ success: false, error: "Delivery ID is required" }, { status: 400 });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return NextResponse.json({ success: false, error: "Delivery not found" }, { status: 404 });
    }

    delivery.driverLocation = { lat, lng };
    if (estimatedArrival) {
      delivery.estimatedArrival = estimatedArrival;
    }

    await delivery.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

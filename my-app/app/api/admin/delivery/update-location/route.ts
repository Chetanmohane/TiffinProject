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

    let delivery;
    if (deliveryId && deliveryId.toString().startsWith("temp-")) {
      // Resolve temporary ID: temp-customerId-type
      const parts = deliveryId.split("-");
      const customerId = parts[1];
      const type = parts[2];
      const IST_OFFSET = 5.5 * 60 * 60 * 1000;
      const today = new Date(new Date().getTime() + IST_OFFSET).toISOString().split("T")[0];
      
      delivery = await Delivery.findOne({ customerId, type, date: today });
    } else {
      delivery = await Delivery.findById(deliveryId);
    }

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

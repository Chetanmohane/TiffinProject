import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Delivery from "@/models/Delivery";
import User from "@/models/User";

/** Calculate estimated arrival in minutes via OSRM */
async function calcEta(driverLat: number, driverLng: number, destLat: number, destLng: number): Promise<string> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${driverLng},${driverLat};${destLng},${destLat}?overview=false`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const data = await res.json();
    if (data.routes?.[0]) {
      const mins = Math.ceil(data.routes[0].duration / 60);
      return String(mins);
    }
  } catch {}
  return "";
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { deliveryId, deliveryIds, lat, lng, estimatedArrival } = await req.json();

    if (!deliveryId && (!deliveryIds || deliveryIds.length === 0)) {
      return NextResponse.json({ success: false, error: "Delivery ID(s) required" }, { status: 400 });
    }

    if (deliveryIds && Array.isArray(deliveryIds)) {
      const IST_OFFSET = 5.5 * 60 * 60 * 1000;
      const today = new Date(new Date().getTime() + IST_OFFSET).toISOString().split("T")[0];

      for (const id of deliveryIds) {
        let delivery: any;
        if (id.toString().startsWith("temp-")) {
          const parts = id.toString().split("-");
          const customerId = parts[1];
          const type = parts[2];
          delivery = await Delivery.findOne({ customerId, type, date: today });
        } else {
          delivery = await Delivery.findById(id);
        }

        if (delivery) {
          delivery.driverLocation = { lat, lng };
          if (estimatedArrival) delivery.estimatedArrival = estimatedArrival;
          await delivery.save();
        }
      }
      return NextResponse.json({ success: true, message: "Bulk updated" });
    }

    let delivery: any;

    if (deliveryId.toString().startsWith("temp-")) {
      // Resolve temp ID → temp-customerId-type
      const parts = deliveryId.toString().split("-");
      const customerId = parts[1];
      const type = parts[2];
      const IST_OFFSET = 5.5 * 60 * 60 * 1000;
      const today = new Date(new Date().getTime() + IST_OFFSET).toISOString().split("T")[0];

      // Try to find existing delivery
      delivery = await Delivery.findOne({ customerId, type, date: today });

      // If none exists, auto-create it so GPS tracking can start immediately
      if (!delivery) {
        const customer = await User.findById(customerId).select("name address subscription").lean() as any;
        delivery = await Delivery.create({
          customerId,
          customerName: customer?.name || "Customer",
          type,
          date: today,
          status: "Out for Delivery",
          targetTime: type === "Dinner" ? "08:00 PM" : "01:00 PM",
        });
      }
    } else {
      delivery = await Delivery.findById(deliveryId);
    }

    if (!delivery) {
      return NextResponse.json({ success: false, error: "Delivery not found" }, { status: 404 });
    }

    // Update driver GPS position
    delivery.driverLocation = { lat, lng };

    // Calculate ETA if not manually provided
    if (estimatedArrival && estimatedArrival !== "Calculating...") {
      delivery.estimatedArrival = estimatedArrival;
    } else {
      // Try to get customer address for real ETA
      try {
        const customer = await User.findById(delivery.customerId)
          .select("subscription.deliveryAddress address")
          .lean() as any;
        const destAddr = customer?.subscription?.deliveryAddress || customer?.address;
        
        if (destAddr) {
          // Geocode customer address
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destAddr)}&limit=1`,
            { signal: AbortSignal.timeout(4000) }
          );
          const geoData = await geoRes.json();
          if (geoData?.[0]) {
            const destLat = parseFloat(geoData[0].lat);
            const destLng = parseFloat(geoData[0].lon);
            const eta = await calcEta(lat, lng, destLat, destLng);
            if (eta) delivery.estimatedArrival = eta;
          }
        }
      } catch {}
    }

    await delivery.save();
    return NextResponse.json({ success: true, estimatedArrival: delivery.estimatedArrival });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

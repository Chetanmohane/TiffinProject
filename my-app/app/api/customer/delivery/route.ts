import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Delivery from "@/models/Delivery";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });
    }

    const customer = await User.findOne({ email: email.toLowerCase() }).lean() as any;
    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    // Get today's date in YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // Find today's delivery for this customer
    let delivery = await Delivery.findOne({
      customerId: customer._id,
      date: today,
    }).lean() as any;

    // If no delivery record exists, return a default Pending status
    if (!delivery) {
      delivery = {
        status: "Pending",
        type: "Lunch",
        targetTime: "01:00 PM",
        date: today,
      };
    }

    // Map status to step index (0-3)
    const statusSteps = ["Pending", "Out for Delivery", "Delivered", "Cancelled"];
    const currentStep = statusSteps.indexOf(delivery.status);

    return NextResponse.json({
      success: true,
      delivery: {
        id: delivery._id || null,
        status: delivery.status,
        type: delivery.type,
        targetTime: delivery.targetTime || "01:00 PM",
        date: delivery.date,
        currentStep: currentStep >= 0 ? currentStep : 0,
        customerName: customer.name,
        address: customer.address || "Address not set",
      },
    });
  } catch (error: any) {
    console.error("Delivery Tracking API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

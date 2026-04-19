import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CancelledMeal from "@/models/CancelledMeal";

export async function GET() {
  try {
    await connectDB();

    const cancellations = await CancelledMeal.find({})
      .sort({ cancelledAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      cancellations: cancellations.map((c: any) => ({
        id: c._id,
        customerName: c.customerName,
        email: c.email,
        phone: c.phone,
        planName: c.planName,
        mealType: c.mealType,
        date: c.date,
        reason: c.reason,
        cancelledAt: c.cancelledAt,
      })),
    });
  } catch (error: any) {
    console.error("Admin Cancellations API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { id, date, mealType, reason } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const updated = await CancelledMeal.findByIdAndUpdate(
      id,
      { date, mealType, reason },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Cancellation record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      cancellation: updated,
    });
  } catch (error: any) {
    console.error("Admin Cancellations UPDATE Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    await CancelledMeal.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Cancellation record deleted successfully",
    });
  } catch (error: any) {
    console.error("Admin Cancellations DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

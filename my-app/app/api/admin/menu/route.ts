import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Menu from "@/models/Menu";

export async function GET() {
  try {
    await connectDB();
    const menu = await Menu.find({}).lean();
    return NextResponse.json({ menu });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { menu } = await req.json();
    if (menu && Array.isArray(menu)) {
      await Menu.deleteMany({});
      const menuToInsert = menu.map((m: any) => ({
        day: m.day,
        lunch: m.lunch,
        dinner: m.dinner,
        lunchTime: m.lunchTime,
        dinnerTime: m.dinnerTime,
        lunchStatus: m.lunchStatus,
        dinnerStatus: m.dinnerStatus,
        isActive: m.isActive === true || m.isActive === "true"
      }));
      await Menu.insertMany(menuToInsert);
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

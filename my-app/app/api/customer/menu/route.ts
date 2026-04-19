import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Menu from "@/models/Menu";

export async function GET() {
  try {
    await connectDB();
    const menu = await Menu.find({}).lean();
    
    // Custom sort: Monday to Saturday (and Sunday if exists)
    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const sortedMenu = menu.sort((a, b) => {
       return daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
    });

    return NextResponse.json({ menu: sortedMenu || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

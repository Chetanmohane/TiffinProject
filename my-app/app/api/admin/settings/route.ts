import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

export async function GET() {
  try {
    await connectDB();
    let settings = await SiteSettings.findOne({}).lean();
    
    // Create initial settings if not found
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    console.log("Saving Site Content Update:", body);
    
    // Efficiently update or create the settings document
    const updatedSettings = await SiteSettings.findOneAndUpdate(
      {}, 
      { $set: body },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (e: any) {
    console.error("Site Content Save Error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

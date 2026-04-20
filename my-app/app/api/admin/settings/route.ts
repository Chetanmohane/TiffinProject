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
    
    let settings = await SiteSettings.findOne({});
    if (settings) {
      // Update existing
      settings.hero = { ...settings.hero, ...body.hero };
      await settings.save();
    } else {
      // Create new
      settings = await SiteSettings.create(body);
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

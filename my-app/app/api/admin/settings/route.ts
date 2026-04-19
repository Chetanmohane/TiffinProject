import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

// Get settings
export async function GET() {
  try {
    await connectDB();
    let settings = await SiteSettings.findOne({});
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update settings
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();
    
    let settings = await SiteSettings.findOne({});
    if (!settings) {
      settings = new SiteSettings(body);
    } else {
      settings.email = body.email || settings.email;
      settings.phone = body.phone || settings.phone;
      settings.address = body.address || settings.address;
      settings.workingHours = body.workingHours || settings.workingHours;
      settings.updatedAt = Date.now();
    }
    
    await settings.save();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

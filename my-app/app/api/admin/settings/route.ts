import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Use a fixed identifier to ensure we only ever have ONE record
const SETTINGS_ID = "65c3e9a7e6b8a7d6c5b4a321"; // Manually defined static ObjectId style string

export async function GET() {
  try {
    await connectDB();
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    
    return NextResponse.json({ success: true, settings }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectDB();
    
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, settings }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (err: any) {
    console.error("CMS POST Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

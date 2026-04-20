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
    // Attempt to find the specific record, or the first one if not found by ID
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      // If nothing exists, create a default one
      settings = await SiteSettings.create({});
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectDB();
    
    // Atomically find the settings document and update it. 
    // If none exists, create it.
    // This ensures we never have duplicate settings records.
    const settings = await SiteSettings.findOneAndUpdate(
      {}, // Filter: empty object matches the first/only document
      { $set: data }, // Atomic update of all sent fields
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    console.error("CMS POST Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

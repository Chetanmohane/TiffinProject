import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const emailInput = body.email || body.identifier;

    if (!emailInput || typeof emailInput !== "string" || !emailInput.trim()) {
      return NextResponse.json({ success: false, error: "Email or mobile number is required" }, { status: 400 });
    }

    const cleanInput = emailInput.trim();
    const user = await User.findOne({
      $or: [{ email: cleanInput.toLowerCase() }, { phone: cleanInput }],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email or mobile number." },
        { status: 404 }
      );
    }

    if (!user.email || user.email === "N/A") {
      return NextResponse.json(
        { success: false, error: "No email address linked to this account. Please contact support." },
        { status: 400 }
      );
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expiration (1 hour)
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    // Create reset URL dynamically using request host
    const rawHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
    let baseUrl = "";
    if (rawHost) {
      const protocol = req.headers.get("x-forwarded-proto") || (rawHost.includes("localhost") || rawHost.includes("127.0.0.1") ? "http" : "https");
      baseUrl = `${protocol}://${rawHost}`;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001";
    }
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Annapurna Tiffin Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request - Tiffin Project",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ea580c; text-align: center;">Tiffin Project</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset for your Tiffin Project account. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 Tiffin Project. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: `Reset link has been sent to ${user.email}. Check your inbox!`,
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to send reset email" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";
import Menu from "@/models/Menu";
import Payment from "@/models/Payment";
import Delivery from "@/models/Delivery";
import PausedMeal from "@/models/PausedMeal";

export async function GET() {
  try {
    await connectDB();

    // --- Seed Plans ---
    await Plan.deleteMany({});
    await Plan.insertMany([
      { name: "Premium Monthly Thali", price: 3500, duration: 30, mealsPerDay: 2, visible: true, description: "Full premium tiffin twice a day" },
      { name: "Basic Weekly Veg", price: 800, duration: 7, mealsPerDay: 1, visible: true, description: "Simple vegetarian lunch" },
      { name: "Budget Daily Lunch", price: 100, duration: 1, mealsPerDay: 1, visible: true, description: "Single day lunch plan" },
    ]);

    // --- Seed Menu ---
    await Menu.deleteMany({});
    await Menu.insertMany([
      { day: "Monday",    lunch: "4 Roti, Paneer Butter Masala, Dal Fry, Jeera Rice, Fresh Salad",         dinner: "3 Roti, Mix Veg, Yellow Dal, Plain Rice, Sweet" },
      { day: "Tuesday",   lunch: "4 Roti, Rajma Masala, Raita, Pulao, Salad",                               dinner: "3 Roti, Palak Paneer, Dal Makhani, Jeera Rice" },
      { day: "Wednesday", lunch: "4 Roti, Bhindi Masala, Dal Tadka, Steam Rice",                            dinner: "3 Roti, Chana Masala, Aloo Gobi, Rice" },
      { day: "Thursday",  lunch: "4 Roti, Kadhai Paneer, Black Dal, Rice, Salad",                           dinner: "3 Roti, Mutter Paneer, Yellow Dal, Rice" },
      { day: "Friday",    lunch: "4 Roti, Chole, Bhature/Rice, Salad, Raita",                               dinner: "3 Roti, Dum Aloo, Dal Fry, Steam Rice" },
      { day: "Saturday",  lunch: "Special Thali: Puri, Shahi Paneer, Dal Makhani, Pulao, Gulab Jamun",      dinner: "3 Roti, Malai Kofta, Mix Dal, Rice" },
    ]);

    // --- Seed Users ---
    await User.deleteMany({});
    const [admin, customer] = await User.insertMany([
      {
        name: "Admin Chetan",
        phone: "0000000000",
        email: "chetanmohane27@gmail.com",
        password: "admin123",
        role: "admin",
        address: "Main Office",
        walletBalance: 0,
      },
      {
        name: "Chetan",
        phone: "9123456789",
        email: "chetan@example.com",
        password: "password123",
        role: "customer",
        address: "123 Main Street, Pune",
        walletBalance: 450,
        subscription: {
          planName: "Premium Monthly Thali",
          status: "Active",
          startDate: "01 Jan 2026",
          nextRenewal: "25 Jan 2026",
          mealsLeft: 14,
          totalMeals: 30,
        },
      },
    ]);

    // --- Seed Payments ---
    await Payment.deleteMany({});
    await Payment.insertMany([
      {
        customerId: customer._id,
        customerName: "Chetan Mohane",
        date: "25 Jan 2026",
        description: "Daily Meal - Lunch",
        type: "Debit",
        amount: 120,
        status: "Success",
      },
      {
        customerId: customer._id,
        customerName: "Chetan Mohane",
        date: "20 Jan 2026",
        description: "Wallet Recharge - UPI",
        type: "Credit",
        amount: 2000,
        status: "Success",
      },
    ]);

    // --- Seed Deliveries ---
    await Delivery.deleteMany({});
    await Delivery.insertMany([
      {
        customerId: customer._id,
        customerName: "Chetan Mohane",
        targetTime: "01:00 PM",
        status: "Out for Delivery",
        type: "Lunch",
        date: new Date().toISOString().split("T")[0],
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "✅ MongoDB Atlas seeded: Plans, Menu, Users, Payments, Deliveries.",
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

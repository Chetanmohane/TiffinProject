import mongoose from "mongoose";
import User from "../models/User.js";
import connectDB from "../lib/mongodb.js";

async function checkUser() {
  await connectDB();
  const email = "ankitasahu849@gmail.com";
  const user = await User.findOne({ email }).lean();
  
  if (!user) {
    console.log("User not found!");
  } else {
    console.log("User Data:", JSON.stringify(user, null, 2));
    
    const today = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];
    console.log("Today (IST):", today);
    
    const sub = user.subscription;
    if (sub) {
       console.log("Checks:");
       console.log("- Status matches Active/Paused:", ["Active", "Paused", "active", "paused"].includes(sub.status));
       console.log("- startDate <= today:", sub.startDate <= today);
       console.log("- nextRenewal >= today:", sub.nextRenewal >= today);
       console.log("- mealsLeft > 0:", sub.mealsLeft > 0);
       
       if (sub.startDate > today) console.log("!!! Fails because startDate is in future");
       if (sub.nextRenewal < today) console.log("!!! Fails because nextRenewal has passed");
       if (sub.mealsLeft <= 0) console.log("!!! Fails because mealsLeft is 0");
    } else {
       console.log("No subscription object found!");
    }
  }
  process.exit(0);
}

checkUser();

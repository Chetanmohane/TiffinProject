import mongoose from "mongoose";
import User from "./models/User.js";
import connectDB from "./lib/mongodb.js";

async function check() {
  await connectDB();
  const allUsers = await User.find({ subscription: { $ne: null } }).lean();
  console.log("Total users with subscription:", allUsers.length);
  
  const filteredUsers = await User.find({ 
    role: "customer", 
    "subscription.status": { $in: ["Active", "Paused"] } 
  }).lean();
  console.log("Users matching delivery query:", filteredUsers.length);

  for (const user of allUsers) {
    if (!filteredUsers.find(u => u._id.toString() === user._id.toString())) {
      console.log(`Missing User: ${user.name}, Role: ${user.role}, Status: ${user.subscription?.status}, Renewal: ${user.subscription?.nextRenewal}, Meals: ${user.subscription?.mealsLeft}`);
    }
  }
  process.exit(0);
}

check();

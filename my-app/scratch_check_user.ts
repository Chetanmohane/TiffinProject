import mongoose from "mongoose";
import User from "./models/User";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function checkUser(email: string) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("User not found");
      return;
    }
    console.log("User Subscription Status:", user.subscription?.status);
    console.log("User Current nextRenewal:", user.subscription?.nextRenewal);
    console.log("User mealsLeft:", user.subscription?.mealsLeft);
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const email = process.argv[2] || "chetanmohane92@gmail.com";
checkUser(email);

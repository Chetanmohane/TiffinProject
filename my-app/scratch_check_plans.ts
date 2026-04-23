import mongoose from "mongoose";
import connectDB from "./lib/mongodb";
import Plan from "./models/Plan";

async function check() {
  await connectDB();
  const plans = await Plan.find({}).lean();
  console.log("Total Plans:", plans.length);
  console.log(JSON.stringify(plans, null, 2));
  process.exit(0);
}

check();

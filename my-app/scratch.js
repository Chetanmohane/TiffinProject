import connectDB from "./lib/mongodb.js";
import mongoose from "mongoose";

async function main() {
  await mongoose.connect("mongodb+srv://bhumigarg704_db_user:5tPqecOsOsB8z7D8@cluster0.ulswg0w.mongodb.net/tiffin_project?retryWrites=true&w=majority&appName=Cluster0");
  
  const PlanSchema = new mongoose.Schema({}, { strict: false });
  const Plan = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
  
  const plan = await Plan.findOne({});
  console.log("Found Plan ID:", plan._id);
  
  const UserSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const user = await User.findOne({ email: "chetanmohane27@gmail.com" });
  console.log("Found User ID:", user._id);
  
  process.exit(0);
}

main();

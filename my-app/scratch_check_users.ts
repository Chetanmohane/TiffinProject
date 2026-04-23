import mongoose from "mongoose";
import connectDB from "./lib/mongodb";
import User from "./models/User";

async function check() {
  await connectDB();
  const users = await User.find({}).lean();
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

check();

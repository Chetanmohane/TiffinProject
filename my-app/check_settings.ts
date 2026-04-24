import mongoose from "mongoose";
import SiteSettings from "./my-app/models/SiteSettings";

async function check() {
  await mongoose.connect("mongodb://localhost:27017/tiffin");
  const settings = await SiteSettings.findOne();
  console.log(JSON.stringify(settings, null, 2));
  process.exit(0);
}

check();

import mongoose from "mongoose";

const SiteSettingsSchema = new mongoose.Schema({
  email: { type: String, default: "support@tiffin.app" },
  phone: { type: String, default: "+91 99999 99999" },
  address: { type: String, default: "123 Tech Park, Indore, MP" },
  workingHours: { type: String, default: "9:00 AM - 10:00 PM" },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema);

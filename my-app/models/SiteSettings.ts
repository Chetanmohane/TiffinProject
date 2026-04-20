import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteSettings extends Document {
  hero: {
    line1: string;
    accentLine: string;
    redLine: string;
    description: string;
    mainImage: string;
    ratingText: string;
    activeUsersText: string;
  };
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    hero: {
      line1: { type: String, default: "Taste the" },
      accentLine: { type: String, default: "Comfort" },
      redLine: { type: String, default: "Home-Cooked Meals" },
      description: { type: String, default: "Fresh, hygienic, and deliciously crafted tiffin meals delivered daily. We bring the warmth of a mother's kitchen straight to your doorstep." },
      mainImage: { type: String, default: "/img1.webp" },
      ratingText: { type: String, default: "4.9/5 Rating" },
      activeUsersText: { type: String, default: "500+ Active" },
    }
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;

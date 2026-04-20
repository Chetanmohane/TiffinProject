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
  about: {
    heading: string;
    titleLine1: string;
    titleAccent: string;
    titleLine2: string;
    description: string;
    image: string;
    experienceText: string;
    experienceSub: string;
  };
  mission: {
    heading: string;
    titleLine1: string;
    titleAccent: string;
    description: string;
    image: string;
  };
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    hero: {
      line1: { type: String, default: "Taste the" },
      accentLine: { type: String, default: "Comfort" },
      redLine: { type: String, default: "Home-Cooked Meals" },
      description: { type: String, default: "Fresh, hygienic, and deliciously crafted tiffin meals delivered daily. We bring the warmth of a mother's kitchen straight to your doorstep." },
      mainImage: { type: String, default: "/food2.PNG" },
      ratingText: { type: String, default: "4.9/5 Rating" },
      activeUsersText: { type: String, default: "500+ Active" },
    },
    about: {
      heading: { type: String, default: "OUR HUMBLE BEGINNINGS" },
      titleLine1: { type: String, default: "Cooking with" },
      titleAccent: { type: String, default: "Tradition" },
      titleLine2: { type: String, default: "Serving with Soul" },
      description: { type: String, default: "Annapurna Delight started in a small kitchen with a big dream: to provide the warmth and comfort of 'Ghar Ka Khana' to everyone living away from home." },
      image: { type: String, default: "/food1.PNG" },
      experienceText: { type: String, default: "10+" },
      experienceSub: { type: String, default: "YEARS OF LOVE" },
    },
    mission: {
      heading: { type: String, default: "WHY WE DO IT" },
      titleLine1: { type: String, default: "More Than Just a" },
      titleAccent: { type: String, default: "Tiffin Service" },
      description: { type: String, default: "We understand that food is more than just fuel—it's an emotion. Our mission is to serve happiness in every bite." },
      image: { type: String, default: "/food3.jpg" },
    }
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;

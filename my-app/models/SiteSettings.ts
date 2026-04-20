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
    feature1Title: string;
    feature1Sub: string;
    feature2Title: string;
    feature2Sub: string;
    quoteText: string;
  };
  mission: {
    heading: string;
    titleLine1: string;
    titleAccent: string;
    description: string;
    image: string;
    image2: string;
  };
  services: {
    heading: string;
    title: string;
    subDesc: string;
    item1Title: string;
    item1Desc: string;
    item2Title: string;
    item2Desc: string;
    item3Title: string;
    item3Desc: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    instagram: string;
    facebook: string;
    footerMsg: string;
    footerTitle: string;
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
      feature1Title: { type: String, default: "Pure Veg" },
      feature1Sub: { type: String, default: "Strictly vegetarian & fresh" },
      feature2Title: { type: String, default: "Best Quality" },
      feature2Sub: { type: String, default: "Premium masalas & oil" },
      quoteText: { type: String, default: "Every meal we prepare is treated as if it's for our own family. That is the Annapurna promise." },
    },
    mission: {
      heading: { type: String, default: "WHY WE DO IT" },
      titleLine1: { type: String, default: "More Than Just a" },
      titleAccent: { type: String, default: "Tiffin Service" },
      description: { type: String, default: "We understand that food is more than just fuel—it's an emotion. Our mission is to serve happiness in every bite." },
      image: { type: String, default: "/food2.PNG" },
      image2: { type: String, default: "/food2.PNG" },
    },
    services: {
      heading: { type: String, default: "OUR SERVICES" },
      title: { type: String, default: "We Provide Best Quality Items" },
      subDesc: { type: String, default: "We don't just deliver food; we deliver health, convenience, and a taste of home. Here is why we are unique." },
      item1Title: { type: String, default: "Fresh Ingredients" },
      item1Desc: { type: String, default: "We use only the freshest produce and ingredients." },
      item2Title: { type: String, default: "On-Time Delivery" },
      item2Desc: { type: String, default: "Get your hot meals delivered right when you need them." },
      item3Title: { type: String, default: "Customizable Plans" },
      item3Desc: { type: String, default: "Choose from a variety of subscription options." },
    },
    contact: {
      phone: { type: String, default: "+91 91316 48092" },
      email: { type: String, default: "support@annapurnadelight.com" },
      address: { type: String, default: "Indore, India" },
      instagram: { type: String, default: "#" },
      facebook: { type: String, default: "#" },
      footerMsg: { type: String, default: "Subscribe for daily menu updates & offers." },
      footerTitle: { type: String, default: "Annapurna Delight Tiffin Centre" },
    }
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;

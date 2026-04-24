const mongoose = require("mongoose");

const SiteSettingsSchema = new mongoose.Schema({
  contact: {
    address: String,
    latitude: Number,
    longitude: Number
  }
}, { strict: false });

const SiteSettings = mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema, "sitesettings");

async function check() {
  try {
    await mongoose.connect("mongodb://localhost:27017/tiffin");
    const settings = await SiteSettings.findOne();
    console.log("SETTINGS_START");
    console.log(JSON.stringify(settings, null, 2));
    console.log("SETTINGS_END");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();

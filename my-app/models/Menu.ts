import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenu extends Document {
  day: string;
  lunch: string;
  dinner: string;
  lunchTime: string;
  dinnerTime: string;
  lunchStatus: string;
  dinnerStatus: string;
  week?: number;
  isActive?: boolean;
}

const MenuSchema = new Schema<IMenu>(
  {
    day: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    lunch: { type: String, required: true },
    dinner: { type: String, required: true },
    lunchTime: { type: String, default: "01:00 PM" },
    dinnerTime: { type: String, default: "08:00 PM" },
    lunchStatus: { type: String, default: "Out for Delivery" },
    dinnerStatus: { type: String, default: "Scheduled" },
    week: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Menu: Model<IMenu> =
  mongoose.models.Menu || mongoose.model<IMenu>("Menu", MenuSchema);

// Explicitly ensure isActive is in the schema if already existing
if (mongoose.models.Menu && !mongoose.models.Menu.schema.path('isActive')) {
  mongoose.models.Menu.schema.add({ isActive: { type: Boolean, default: true } });
}

export default Menu;

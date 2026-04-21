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
}

const MenuSchema = new Schema<IMenu>(
  {
    day: { type: String, required: true, trim: true },
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

export default Menu;

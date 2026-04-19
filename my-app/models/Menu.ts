import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenu extends Document {
  day: string;
  lunch: string;
  dinner: string;
  week?: number; // optional week number for rotating menus
}

const MenuSchema = new Schema<IMenu>(
  {
    day: { type: String, required: true, trim: true },
    lunch: { type: String, required: true },
    dinner: { type: String, required: true },
    week: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Menu: Model<IMenu> =
  mongoose.models.Menu || mongoose.model<IMenu>("Menu", MenuSchema);

export default Menu;

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHoliday extends Document {
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason?: string;
  isActive: boolean;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    title: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Holiday: Model<IHoliday> =
  mongoose.models.Holiday || mongoose.model<IHoliday>("Holiday", HolidaySchema);

export default Holiday;

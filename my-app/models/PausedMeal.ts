import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPausedMeal extends Document {
  customerId: Types.ObjectId;
  customerName: string;
  phone: string;
  planName: string;
  pauseFrom: string;
  pauseTo: string;
  reason: string;
  daysCount?: number;
  status: "Pending" | "Approved" | "Rejected";
}

const PausedMealSchema = new Schema<IPausedMeal>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    planName: { type: String, required: true },
    pauseFrom: { type: String, required: true },
    pauseTo: { type: String, required: true },
    reason: { type: String, default: "" },
    daysCount: { type: Number },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  },
  { timestamps: true }
);

const PausedMeal: Model<IPausedMeal> =
  mongoose.models.PausedMeal || mongoose.model<IPausedMeal>("PausedMeal", PausedMealSchema);

export default PausedMeal;

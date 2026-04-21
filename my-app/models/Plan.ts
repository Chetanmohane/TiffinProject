import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlan extends Document {
  name: string;
  price: number;
  lunchPrice: number;
  dinnerPrice: number;
  bothPrice: number;
  duration: number; // in days
  mealsPerDay: number;
  visible: boolean;
  description?: string;
  image?: string;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    lunchPrice: { type: Number, default: 0 },
    dinnerPrice: { type: Number, default: 0 },
    bothPrice: { type: Number, default: 0 },
    duration: { type: Number, required: true }, // days
    mealsPerDay: { type: Number, default: 1 },
    visible: { type: Boolean, default: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

const Plan: Model<IPlan> =
  mongoose.models.Plan || mongoose.model<IPlan>("Plan", PlanSchema);

export default Plan;

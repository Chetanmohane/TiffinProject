import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICancelledMeal extends Document {
  customerId: Types.ObjectId;
  customerName: string;
  email: string;
  phone: string;
  planName: string;
  mealType: "Lunch" | "Dinner";
  date: string; // YYYY-MM-DD
  reason: string;
  cancelledAt: Date;
}

const CancelledMealSchema = new Schema<ICancelledMeal>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, default: "" },
    planName: { type: String, default: "No Plan" },
    mealType: { type: String, enum: ["Lunch", "Dinner"], default: "Lunch" },
    date: { type: String, required: true }, // YYYY-MM-DD
    reason: { type: String, default: "No reason provided" },
    cancelledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const CancelledMeal: Model<ICancelledMeal> =
  mongoose.models.CancelledMeal ||
  mongoose.model<ICancelledMeal>("CancelledMeal", CancelledMealSchema);

export default CancelledMeal;

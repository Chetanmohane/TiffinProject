import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPayment extends Document {
  customerId: Types.ObjectId;
  customerName: string;
  date: string;
  endDate?: string;
  description: string;
  type: "Debit" | "Credit";
  amount: number;
  status: "Success" | "Failed" | "Pending";
}

const PaymentSchema = new Schema<IPayment>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    date: { type: String, required: true },
    endDate: { type: String },
    description: { type: String, required: true },
    type: { type: String, enum: ["Debit", "Credit"], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Success", "Failed", "Pending"], default: "Success" },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;

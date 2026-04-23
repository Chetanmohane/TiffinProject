import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPayment extends Document {
  customerId: Types.ObjectId;
  customerName: string;
  phone?: string;
  date: string;
  endDate?: string;
  description: string;
  type: "Debit" | "Credit";
  amount: number;
  status: "Success" | "Failed" | "Pending";
  transactionId?: string;
  planName?: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    phone: { type: String },
    date: { type: String, required: true },
    endDate: { type: String },
    description: { type: String, required: true },
    type: { type: String, enum: ["Debit", "Credit"], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Success", "Failed", "Pending"], default: "Success" },
    transactionId: { type: String, unique: true, sparse: true },
    planName: { type: String },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;

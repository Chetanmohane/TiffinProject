import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDelivery extends Document {
  customerId: Types.ObjectId;
  customerName: string;
  targetTime: string;
  status: "Pending" | "Prepared" | "Out for Delivery" | "Delivered" | "Cancelled";
  type: "Lunch" | "Dinner";
  date: string;
  driverLocation?: { lat: number; lng: number };
  estimatedArrival?: string;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    targetTime: { type: String, default: "01:00 PM" },
    status: {
      type: String,
      enum: ["Pending", "Prepared", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },
    type: { type: String, enum: ["Lunch", "Dinner"], required: true },
    date: { type: String, required: true },
    driverLocation: {
      lat: { type: Number },
      lng: { type: Number }
    },
    estimatedArrival: { type: String }
  },
  { timestamps: true }
);

const Delivery: Model<IDelivery> =
  mongoose.models.Delivery || mongoose.model<IDelivery>("Delivery", DeliverySchema);

export default Delivery;

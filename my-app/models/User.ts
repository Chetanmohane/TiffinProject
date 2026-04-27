import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscription {
  planName: string;
  status: "Active" | "Paused" | "Expired";
  startDate: string;
  nextRenewal: string;
  mealsLeft: number;
  totalMeals: number;
  mealType?: "Lunch" | "Dinner" | "Both";
  lastDeductionDate?: string;
  deliveryAddress?: string;
}

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: "customer" | "admin" | "editor" | "viewer" | "staff";
  address: string;
  walletBalance: number;
  subscription?: ISubscription;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  planName: { type: String, required: true },
  status: { type: String, enum: ["Active", "Paused", "Expired"], default: "Active" },
  startDate: { type: String },
  nextRenewal: { type: String },
  purchaseDate: { type: Date, default: Date.now },
  mealsLeft: { type: Number, default: 0 },
  totalMeals: { type: Number, default: 0 },
  mealType: { type: String, enum: ["Lunch", "Dinner", "Both"], default: "Both" },
  lastDeductionDate: { type: String },
  deliveryAddress: { type: String, default: "" },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin", "editor", "viewer", "staff"], default: "customer" },
    address: { type: String, default: "" },
    walletBalance: { type: Number, default: 0 },
    subscription: { type: SubscriptionSchema, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

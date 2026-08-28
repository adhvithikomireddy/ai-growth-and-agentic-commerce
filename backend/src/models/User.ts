import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: "CUSTOMER" | "MERCHANT" | "ADMIN";
  merchantId?: string;
  language: "en" | "hi" | "te";
  spendingControls: {
    autonomousLimit: number;
    requirePinAbove: number;
    transactionPinHash?: string;
    maxDailySpend: number;
    spentToday: number;
    lastSpendReset: Date;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["CUSTOMER", "MERCHANT", "ADMIN"], default: "CUSTOMER", index: true },
    merchantId: { type: String, index: true },
    language: { type: String, enum: ["en", "hi", "te"], default: "en" },
    spendingControls: {
      autonomousLimit: { type: Number, default: 2000 },
      requirePinAbove: { type: Number, default: 2000 },
      transactionPinHash: { type: String },
      maxDailySpend: { type: Number, default: 100000 },
      spentToday: { type: Number, default: 0 },
      lastSpendReset: { type: Date, default: Date.now },
    },
    address: {
      street: { type: String, default: "124 Innovation Way" },
      city: { type: String, default: "Bengaluru" },
      state: { type: String, default: "Karnataka" },
      postalCode: { type: String, default: "560001" },
      country: { type: String, default: "India" },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);

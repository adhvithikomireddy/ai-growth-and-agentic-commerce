import mongoose, { Schema, Document } from "mongoose";

export interface IMerchant extends Document {
  merchantId: string;
  businessName: string;
  category: string;
  gstin: string;
  currency: string;
  negotiationPolicy: {
    allowNegotiation: boolean;
    maxDiscountPercent: number;
    minMarginThreshold: number;
  };
  capabilities: string[];
  ownerUserId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MerchantSchema = new Schema<IMerchant>(
  {
    merchantId: { type: String, required: true, unique: true, index: true },
    businessName: { type: String, required: true, trim: true },
    category: { type: String, default: "Electronics & Lifestyle" },
    gstin: { type: String, default: "29AABCU9603R1ZM" },
    currency: { type: String, default: "INR" },
    negotiationPolicy: {
      allowNegotiation: { type: Boolean, default: true },
      maxDiscountPercent: { type: Number, default: 10 },
      minMarginThreshold: { type: Number, default: 500 },
    },
    capabilities: {
      type: [String],
      default: [
        "catalog_search",
        "stock_verification",
        "price_verification",
        "bounded_negotiation",
        "order_preparation",
        "cross_sell_recommendations",
      ],
    },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Merchant = mongoose.model<IMerchant>("Merchant", MerchantSchema);

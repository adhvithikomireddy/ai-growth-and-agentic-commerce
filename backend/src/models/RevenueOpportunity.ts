import mongoose, { Schema, Document } from "mongoose";

export interface IRevenueOpportunity extends Document {
  opportunityId: string;
  merchantId: string;
  type: "cross_sell" | "upsell" | "bundle" | "trending_promotion" | "low_conversion" | "inventory_alert";
  title: string;
  description: string;
  observation: string;
  suggestedAction: string;
  primaryProductId: string;
  relatedProductIds: string[];
  suggestedDiscount: number;
  estimatedRevenueImpact: number;
  confidenceScore: number;
  status: "PENDING" | "APPROVED" | "DISMISSED";
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RevenueOpportunitySchema = new Schema<IRevenueOpportunity>(
  {
    opportunityId: { type: String, required: true, unique: true, index: true },
    merchantId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["cross_sell", "upsell", "bundle", "trending_promotion", "low_conversion", "inventory_alert"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    observation: { type: String, required: true },
    suggestedAction: { type: String, required: true },
    primaryProductId: { type: String, required: true },
    relatedProductIds: { type: [String], default: [] },
    suggestedDiscount: { type: Number, default: 0 },
    estimatedRevenueImpact: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0.85 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "DISMISSED"],
      default: "PENDING",
      index: true,
    },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export const RevenueOpportunity = mongoose.model<IRevenueOpportunity>("RevenueOpportunity", RevenueOpportunitySchema);

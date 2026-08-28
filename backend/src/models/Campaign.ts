import mongoose, { Schema, Document } from "mongoose";

export interface ICampaign extends Document {
  campaignId: string;
  merchantId: string;
  opportunityId?: string;
  name: string;
  type: "bundle_discount" | "cross_sell_promo" | "flash_sale" | "category_sale";
  discountPercent: number;
  affectedProductIds: string[];
  bundleProductIds: string[];
  bundlePrice?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenueGenerated: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    campaignId: { type: String, required: true, unique: true, index: true },
    merchantId: { type: String, required: true, index: true },
    opportunityId: { type: String, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["bundle_discount", "cross_sell_promo", "flash_sale", "category_sale"],
      required: true,
    },
    discountPercent: { type: Number, default: 0 },
    affectedProductIds: { type: [String], default: [] },
    bundleProductIds: { type: [String], default: [] },
    bundlePrice: { type: Number },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      revenueGenerated: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>("Campaign", CampaignSchema);

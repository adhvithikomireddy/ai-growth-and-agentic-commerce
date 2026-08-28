import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  productId: string;
  merchantId: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  availability: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  rating: number;
  reviewCount: number;
  specifications: Record<string, string>;
  tags: string[];
  discountPercent: number;
  imageUrl: string;
  compatibleProductIds: string[];
  frequentlyBoughtTogetherIds: string[];
  upsellProductIds: string[];
  alternativeProductIds: string[];
  viewCount: number;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    productId: { type: String, required: true, unique: true, index: true },
    merchantId: { type: String, required: true, index: true },
    sku: { type: String, required: true },
    name: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, default: "" },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0, index: true },
    currency: { type: String, default: "INR" },
    stock: { type: Number, required: true, min: 0, default: 0, index: true },
    availability: {
      type: String,
      enum: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"],
      default: "IN_STOCK",
      index: true,
    },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    specifications: { type: Map, of: String, default: {} },
    tags: { type: [String], default: [], index: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    imageUrl: { type: String, required: true },
    compatibleProductIds: { type: [String], default: [] },
    frequentlyBoughtTogetherIds: { type: [String], default: [] },
    upsellProductIds: { type: [String], default: [] },
    alternativeProductIds: { type: [String], default: [] },
    viewCount: { type: Number, default: 0, index: true },
    salesCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text", tags: "text" });

export const Product = mongoose.model<IProduct>("Product", ProductSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discountApplied: number;
  imageUrl: string;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  appliedOfferCode?: string;
  negotiatedDiscountPercent?: number;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        discountApplied: { type: Number, default: 0 },
        imageUrl: { type: String, default: "" },
      },
    ],
    appliedOfferCode: { type: String },
    negotiatedDiscountPercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>("Cart", CartSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  discount: number;
  imageUrl: string;
}

export interface IOrder extends Document {
  orderId: string;
  userId: mongoose.Types.ObjectId;
  merchantId: string;
  items: IOrderItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  finalAmount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  orderStatus: "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  authorizationMetadata: {
    authorizedAt: Date;
    authorizationMethod: "AUTONOMOUS_LIMIT" | "EXPLICIT_PIN" | "PASSWORD";
    actor: string;
  };
  aiAssisted: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    merchantId: { type: String, required: true, index: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        imageUrl: { type: String, default: "" },
      },
    ],
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "CONFIRMED",
      index: true,
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    authorizationMetadata: {
      authorizedAt: { type: Date, default: Date.now },
      authorizationMethod: {
        type: String,
        enum: ["AUTONOMOUS_LIMIT", "EXPLICIT_PIN", "PASSWORD"],
        default: "AUTONOMOUS_LIMIT",
      },
      actor: { type: String, default: "customer" },
    },
    aiAssisted: { type: Boolean, default: true, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);

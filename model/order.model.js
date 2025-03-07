import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    item: {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        price: { type: Number, required: true },
    },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["waiting","bought"], default: "waiting" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

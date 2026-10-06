import mongoose from "mongoose";

const productViewSchema = new mongoose.Schema(
  {
    productSlug: {
      type: String,
      required: true,
      index: true,
    },
    pathname: {
      type: String,
      default: "",
      index: true,
    },
    title: {
      type: String,
      default: "",
    },
    userId: {
      type: String,
      default: "",
      index: true,
    },
    visitorId: {
      type: String,
      default: "",
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.ProductView || mongoose.model("ProductView", productViewSchema);

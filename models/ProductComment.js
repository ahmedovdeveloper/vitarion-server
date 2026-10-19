import mongoose from "mongoose";

const productCommentSchema = new mongoose.Schema(
  {
    productSlug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      default: "Anonymous",
      trim: true,
      maxlength: 60,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
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

export default mongoose.models.ProductComment || mongoose.model("ProductComment", productCommentSchema);

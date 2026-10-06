import mongoose from "mongoose";

const siteVisitSchema = new mongoose.Schema(
  {
    pathname: {
      type: String,
      required: true,
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

export default mongoose.models.SiteVisit || mongoose.model("SiteVisit", siteVisitSchema);

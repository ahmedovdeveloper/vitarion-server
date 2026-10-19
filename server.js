import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import SiteVisit from "./models/SiteVisit.js";
import ProductView from "./models/ProductView.js";
import ProductComment from "./models/ProductComment.js";
import { sanitizeCommentPayload } from "./utils/commentValidation.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://shakx:970174660%40Ahmad@ac-y78dib3-shard-00-00.y82yqis.mongodb.net:27017/?authSource=admin&retryWrites=true&w=majority&ssl=true";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const getProductSlugFromPath = (pathname = "") => {
  if (!pathname) {
    return null;
  }

  const match = pathname.match(/^(?:\/product\/|\/products\/)([^/?#]+)/);
  return match ? match[1] : null;
};

const buildAnalyticsSnapshot = async () => {
  const siteViews = await SiteVisit.countDocuments();
  const uniqueVisitors = (await SiteVisit.distinct("visitorId")).filter(Boolean).length;

  const productRows = await ProductView.aggregate([
    {
      $group: {
        _id: "$productSlug",
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
  ]);

  const productViews = {};

  for (const row of productRows) {
    const uniqueUserIds = Array.isArray(row.uniqueUsers) ? row.uniqueUsers.filter(Boolean) : [];
    productViews[row._id] = {
      count: Number(row.count || 0),
      uniqueUsers: uniqueUserIds.length,
    };
  }

  return {
    siteViews,
    uniqueVisitors,
    productViews,
  };
};

app.get("/api/health", async (_req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/analytics", async (_req, res) => {
  try {
    const snapshot = await buildAnalyticsSnapshot();
    res.json(snapshot);
  } catch (error) {
    console.error("analytics read error", error);
    res.status(500).json({
      error: "Unable to load analytics snapshot",
      siteViews: 0,
      uniqueVisitors: 0,
      productViews: {},
    });
  }
});

app.post("/api/analytics/track", async (req, res) => {
  try {
    const body = req.body || {};
    const pathname = String(body.pathname || "/");
    const title = String(body.title || "Vitarion");
    const userId = String(body.userId || "guest");
    const visitorId = String(body.visitorId || "anonymous");

    const siteVisit = new SiteVisit({
      pathname,
      title,
      userId,
      visitorId,
    });

    await siteVisit.save();

    const productSlug = getProductSlugFromPath(pathname);

    if (productSlug) {
      const productView = new ProductView({
        productSlug,
        pathname,
        title,
        userId,
        visitorId,
      });

      await productView.save();
    }

    const snapshot = await buildAnalyticsSnapshot();
    res.json({
      success: true,
      ...snapshot,
      productSlug,
    });
  } catch (error) {
    console.error("analytics track error", error);
    res.status(500).json({
      success: false,
      error: "Unable to save analytics event",
    });
  }
});

app.get("/api/products/:slug/comments", async (req, res) => {
  try {
    const productSlug = String(req.params.slug || "").trim();

    if (!productSlug) {
      return res.status(400).json({ error: "Product slug is required." });
    }

    const comments = await ProductComment.find({ productSlug })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.json({ comments });
  } catch (error) {
    console.error("product comments read error", error);
    return res.status(500).json({ error: "Unable to load product comments." });
  }
});

app.post("/api/products/:slug/comments", async (req, res) => {
  try {
    const productSlug = String(req.params.slug || "").trim();

    if (!productSlug) {
      return res.status(400).json({ error: "Product slug is required." });
    }

    const { name, comment, rating } = sanitizeCommentPayload(req.body || {});

    if (!comment) {
      return res.status(400).json({ error: "Comment text is required." });
    }

    const createdComment = await ProductComment.create({
      productSlug,
      name,
      comment,
      rating,
    });

    return res.status(201).json({
      success: true,
      comment: createdComment,
    });
  } catch (error) {
    console.error("product comments create error", error);
    return res.status(500).json({ error: "Unable to save product comment." });
  }
});

const startServer = async () => {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing. Add it to your .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      tls: true,
    });

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Analytics API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();

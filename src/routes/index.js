import { Router } from "express";
import os from "os";
import prisma from "../config/prisma.js";
import { error, success } from "../utils/response.js";

import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import postRoutes from "../modules/post/post.routes.js";
import commentRoutes from "../modules/comment/comment.routes.js";
import { getFeed } from "../modules/post/post.controller.js";

const router = Router();

// Modülleri bağla
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/comment", commentRoutes);
router.get("/feed", getFeed);

// Sağlık kontrolü endpointi
router.get("/health", async (req, res) => {
  const start = Date.now();

  try {
    // DB latency measurement
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;

    const healthData = {
      service: "twitter_api",
      environment: process.env.NODE_ENV || "development",

      uptime: process.uptime(), // seconds
      timestamp: new Date().toISOString(),

      versions: {
        node: process.version,
        api: "1.0.0",
      },

      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpuCount: os.cpus().length,
        loadAvg: os.loadavg(),
        totalMem: os.totalmem(),
        freeMem: os.freemem(),
        memoryUsage: process.memoryUsage(),
      },

      database: {
        status: "connected",
        latencyMs: dbLatency,
      },

      status: "operational",
    };

    return success(res, "API is fully operational", healthData);
  } catch (err) {
    return error(res, "Health check failed", 500);
  }
});

export default router;

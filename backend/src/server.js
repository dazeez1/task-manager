import express from "express";
import session from "express-session";
import config from "../config/config.js";
import { sessionConfig } from "./services/sessionStore.js";
import cors from "./middleware/cors.js";
import {
  helmetConfig,
  rateLimiter,
  compressionConfig,
  morganConfig,
  requestLogger,
  sessionDebugger,
} from "./middleware/security.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

// Trust proxy in production (for Heroku, Render, etc.)
if (config.isProduction) {
  app.set("trust proxy", 1);
}

// Security middleware (order matters!)
app.use(helmetConfig);
app.use(rateLimiter);
app.use(compressionConfig);
app.use(morganConfig);
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session middleware (BEFORE CORS)
app.use(session(sessionConfig));

// CORS middleware (AFTER session)
app.use(cors);

// Session debugging (development only)
if (config.isDevelopment) {
  app.use(sessionDebugger);
}

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Task Manager API is running",
    version: "1.0.0",
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    sessionId: req.sessionID,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    code: "ROUTE_NOT_FOUND",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("❌ Global error:", error);

  // CORS error
  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation",
      code: "CORS_ERROR",
    });
  }

  // Validation error
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
      code: "INVALID_JSON",
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🔄 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🔄 SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log("🚀 Task Manager API Server Started");
  console.log(`📍 Environment: ${config.NODE_ENV}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🔐 Session Store: ${config.isProduction ? "Redis" : "Memory"}`);
  console.log(
    `🔒 CORS Origins: ${config.FRONTEND_URL}, ${config.PRODUCTION_FRONTEND_URL}`
  );
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

export default app;

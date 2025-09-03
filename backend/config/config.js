import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT) || 3000,

  // Session
  SESSION_SECRET:
    process.env.SESSION_SECRET || "fallback-secret-key-change-in-production",
  SESSION_NAME: process.env.SESSION_NAME || "task-manager-session",

  // Redis
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",

  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  PRODUCTION_FRONTEND_URL:
    process.env.PRODUCTION_FRONTEND_URL ||
    "https://task-manager-rho-virid.vercel.app",

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  // Computed values
  isProduction:
    process.env.NODE_ENV === "production" ||
    process.env.RENDER ||
    process.env.VERCEL,
  isDevelopment:
    process.env.NODE_ENV === "development" &&
    !process.env.RENDER &&
    !process.env.VERCEL,
};

export default config;

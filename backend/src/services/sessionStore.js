import session from "express-session";
import config from "../../config/config.js";

// For development, use memory store
// For production, this would be replaced with Redis
let sessionStore;

if (config.isProduction) {
  // In production, we'd use Redis
  // For now, fall back to memory store
  console.log(
    "⚠️ Production mode detected, using memory store (Redis not configured)"
  );
  sessionStore = new session.MemoryStore();
} else {
  // Development: Use memory store
  console.log("📝 Using memory session store for development");
  sessionStore = new session.MemoryStore();
}

// Session configuration
export const sessionConfig = {
  store: sessionStore,
  secret: config.SESSION_SECRET,
  name: config.SESSION_NAME,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.isProduction, // HTTPS required in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: config.isProduction ? "none" : "lax", // Cross-origin in production
    path: "/",
    domain: config.isProduction ? undefined : undefined, // Let browser set domain
  },
  rolling: true, // Reset expiration on every request
};

export default sessionStore;

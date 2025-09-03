import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import config from "../../config/config.js";

// Rate limiting
export const rateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: config.RATE_LIMIT_MAX_REQUESTS, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.log(`🚫 Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000),
    });
  },
});

// Helmet security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow cross-origin requests for development
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Compression middleware
export const compressionConfig = compression({
  level: 6, // Good balance between compression and CPU usage
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// Morgan logging middleware
export const morganConfig = morgan("combined", {
  skip: (req, res) => res.statusCode < 400, // Only log errors
  stream: {
    write: (message) => console.log(message.trim()),
  },
});

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `📝 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

// Session debugging middleware (development only)
export const sessionDebugger = (req, res, next) => {
  if (config.isDevelopment) {
    console.log(`🔍 [${req.method}] ${req.path}`);
    console.log(`🔍 Session ID: ${req.sessionID}`);
    console.log(`🔍 Cookies: ${req.headers.cookie || "None"}`);
    console.log(`🔍 Origin: ${req.headers.origin || "None"}`);
    console.log(`🔍 Session data:`, req.session);
  }

  next();
};

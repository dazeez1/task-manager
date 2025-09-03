import cors from "cors";
import config from "../../config/config.js";

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log("🌐 CORS: No origin (mobile app or curl)");
      return callback(null, true);
    }

    const allowedOrigins = [
      config.FRONTEND_URL,
      config.PRODUCTION_FRONTEND_URL,
      "http://localhost:8000", // Alternative dev port
      "http://localhost:3000", // Alternative dev port
    ];

    console.log(`🌐 CORS Request - Origin: ${origin}`);
    console.log(`🌐 CORS Request - Allowed origins:`, allowedOrigins);

    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Allowed origin ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS: Blocked origin ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies and authentication headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400, // Cache preflight for 24 hours
};

export default cors(corsOptions);

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Environment-based configuration
const isProduction = process.env.NODE_ENV === "production";
const sessionSecret =
  process.env.SESSION_SECRET || "task-manager-secret-key-2024";

// SIMPLE BUT EFFECTIVE CORS Configuration
const corsOptions = {
  origin: [
    "https://task-manager-rho-virid.vercel.app",
    "http://localhost:3000",
    "http://localhost:5500",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
};

// Apply CORS FIRST - before any other middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`📥 Origin: ${req.headers.origin}`);
  console.log(`📥 User-Agent: ${req.headers["user-agent"]}`);
  console.log(`📥 Cookie: ${req.headers.cookie || "No cookies"}`);
  next();
});

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to false for cross-origin requests
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none", // Required for cross-origin requests
      domain: undefined, // Let the browser handle domain
    },
  })
);

// Session debugging middleware
app.use((req, res, next) => {
  console.log(`🔐 Session Debug - ID: ${req.sessionID}`);
  console.log(`🔐 Session Data:`, req.session);
  console.log(`🔐 Session Cookie:`, req.headers.cookie);
  next();
});

// Test endpoint to verify CORS
app.get("/api/test-cors", (req, res) => {
  res.json({
    message: "CORS test successful!",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    method: req.method,
    cors: {
      allowedOrigins: corsOptions.origin,
      credentials: corsOptions.credentials,
    },
  });
});

// Test endpoint to verify sessions
app.get("/api/test-session", (req, res) => {
  console.log("🧪 SESSION TEST ENDPOINT CALLED");
  console.log("🧪 Session ID:", req.sessionID);
  console.log("🧪 Session Data:", req.session);
  console.log("🧪 Cookies:", req.headers.cookie);

  // Set a test value in session
  req.session.testValue = "Session is working!";
  req.session.testTime = new Date().toISOString();

  res.json({
    message: "Session test endpoint",
    timestamp: new Date().toISOString(),
    sessionId: req.sessionID,
    sessionData: req.session,
    cookies: req.headers.cookie || "No cookies",
    testValueSet: req.session.testValue,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Health check endpoint for Render
app.get("/health", (req, res) => {
  const fs = require("fs");
  const path = require("path");

  const usersFilePath = path.join(__dirname, "users.json");
  const tasksFilePath = path.join(__dirname, "tasks.json");

  const usersFileExists = fs.existsSync(usersFilePath);
  const tasksFileExists = fs.existsSync(tasksFilePath);

  let usersCount = 0;
  let tasksCount = 0;

  try {
    if (usersFileExists) {
      const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
      usersCount = Array.isArray(users) ? users.length : 0;
    }
  } catch (error) {
    console.error("Error reading users file:", error);
  }

  try {
    if (tasksFileExists) {
      const tasks = JSON.parse(fs.readFileSync(tasksFilePath, "utf8"));
      tasksCount = Array.isArray(tasks) ? tasks.length : 0;
    }
  } catch (error) {
    console.error("Error reading tasks file:", error);
  }

  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    service: "Task Manager API",
    version: "2.0.0",
    files: {
      users: {
        exists: usersFileExists,
        path: usersFilePath,
        count: usersCount,
      },
      tasks: {
        exists: tasksFileExists,
        path: tasksFilePath,
        count: tasksCount,
      },
    },
    cors: {
      allowedOrigins: corsOptions.origin,
      credentials: corsOptions.credentials,
    },
  });
});

// API info endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Task Manager API",
    version: "2.0.0",
    endpoints: {
      auth: "/api/auth",
      tasks: "/api/tasks",
      health: "/health",
      testCors: "/api/test-cors",
      testSession: "/api/test-session",
    },
    documentation: "https://github.com/dazeez1/task-manager",
    cors: {
      allowedOrigins: corsOptions.origin,
      credentials: corsOptions.credentials,
    },
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.originalUrl,
    availableEndpoints: ["/api/auth", "/api/tasks", "/api/test-cors"],
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("🚨 SERVER ERROR:", err);
  console.error("🚨 Error Stack:", err.stack);
  console.error("🚨 Request URL:", req.url);
  console.error("🚨 Request Method:", req.method);
  console.error("🚨 Request Headers:", req.headers);

  res.status(500).json({
    error: isProduction ? "Internal server error" : err.message,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Task Manager API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 CORS Origins: ${corsOptions.origin.join(", ")}`);
  if (isProduction) {
    console.log(`🚀 Production mode enabled`);
    console.log(`📚 API-only deployment - no frontend files served`);
  }
});

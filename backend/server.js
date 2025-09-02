const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

console.log(`🌍 Environment: ${NODE_ENV}`);
console.log(`🔗 Port: ${PORT}`);

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration - MUST come before CORS
app.use(
  session({
    store: new FileStore({
      path: path.join(__dirname, "sessions"),
      ttl: 24 * 60 * 60, // 24 hours in seconds
      reapInterval: 60 * 60, // Clean up expired sessions every hour
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key-2024",
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    name: "task-manager-session",
    cookie: {
      secure: process.env.NODE_ENV === "production", // true in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // none for cross-origin in production
      path: "/",
    },
    rolling: true, // Reset expiration on every request
  })
);

// CORS middleware - AFTER session middleware
app.use((req, res, next) => {
  // Get the origin from the request headers
  const origin = req.headers.origin;

  // Define allowed origins
  const allowedOrigins = [
    "https://task-manager-rho-virid.vercel.app", // Production frontend
    "http://localhost:8000", // Development frontend
    "http://localhost:3000", // Alternative development port
  ];

  // Check if the request origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    // Default to production origin if no valid origin found
    res.header(
      "Access-Control-Allow-Origin",
      "https://task-manager-rho-virid.vercel.app"
    );
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
});

// Session debugging middleware
app.use((req, res, next) => {
  console.log(`🔍 [${req.method}] ${req.path} - Session ID: ${req.sessionID}`);
  console.log(`🔍 Session data:`, req.session);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Task Manager API",
    status: "running",
    timestamp: new Date().toISOString(),
    sessionId: req.sessionID,
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working",
    sessionId: req.sessionID,
    sessionData: req.session,
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
app.post("/api/auth/signup", (req, res) => {
  try {
    const { firstName, lastName, emailAddress } = req.body;

    const user = {
      id: Date.now().toString(),
      firstName: firstName || "User",
      lastName: lastName || "Name",
      emailAddress: emailAddress || "user@example.com",
      createdAt: new Date().toISOString(),
    };

    // Set session data
    req.session.user = user;
    req.session.isAuthenticated = true;
    req.session.userId = user.id;

    // Force session save
    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to save session",
        });
      }

      console.log("✅ Signup session saved:", req.sessionID);

      res.json({
        success: true,
        message: "User registered successfully",
        user: user,
        sessionId: req.sessionID,
      });
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    const user = {
      id: Date.now().toString(),
      firstName: "User",
      lastName: "Name",
      emailAddress: emailAddress || "user@example.com",
      createdAt: new Date().toISOString(),
    };

    // Set session data
    req.session.user = user;
    req.session.isAuthenticated = true;
    req.session.userId = user.id;

    // Force session save
    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to save session",
        });
      }

      console.log("✅ Login session saved:", req.sessionID);

      res.json({
        success: true,
        message: "Login successful",
        user: user,
        sessionId: req.sessionID,
      });
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Logout error:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }

    // Clear the session cookie
    res.clearCookie("task-manager-session");

    console.log("✅ Logout successful, session destroyed");
    res.json({ success: true, message: "Logout successful" });
  });
});

app.get("/api/auth/me", (req, res) => {
  console.log("🔍 /me endpoint called");
  console.log("🔍 Session ID:", req.sessionID);
  console.log("🔍 Session data:", req.session);

  if (req.session && req.session.isAuthenticated && req.session.user) {
    console.log("✅ Valid session found for user:", req.session.user.id);
    res.json({
      success: true,
      user: req.session.user,
      isAuthenticated: true,
      sessionId: req.sessionID,
    });
  } else {
    console.log("❌ No valid session found");
    res.status(401).json({
      success: false,
      message: "Not authenticated",
      isAuthenticated: false,
      sessionId: req.sessionID,
    });
  }
});

// Task routes
app.get("/api/tasks", (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    console.log("❌ Unauthenticated request to /tasks");
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  console.log(
    "✅ Authenticated request to /tasks for user:",
    req.session.user.id
  );

  const tasks = [
    {
      id: "1",
      title: "Welcome to Task Manager!",
      description: "This is your first task",
      priority: "Medium",
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ];

  res.json({ success: true, tasks: tasks });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`🔐 Session store: FileStore`);
  console.log(`🍪 Cookie name: task-manager-session`);
  console.log(`🌐 CORS: Dynamic origin handling enabled`);
});

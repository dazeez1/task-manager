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
    resave: true, // Force save on every request for cross-origin
    saveUninitialized: true, // Save uninitialized sessions for cross-origin
    name: "task-manager-session", // Custom session name
    cookie: {
      secure: false, // Must be false for HTTP (Render uses HTTP internally)
      httpOnly: false, // Allow JavaScript access for cross-origin
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "none", // Required for cross-origin requests
      domain: undefined, // Let browser handle domain
      path: "/", // Ensure cookie is sent to all paths
    },
    rolling: true, // Extend session on every request
  })
);

// Session debugging middleware
app.use((req, res, next) => {
  console.log(`🔐 Session Debug - ID: ${req.sessionID}`);
  console.log(`🔐 Session Data:`, req.session);
  console.log(`🔐 Session Cookie:`, req.headers.cookie);

  // Ensure proper headers for cross-origin cookies
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");

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

// Simple session test endpoint
app.get("/api/session-test", (req, res) => {
  // Set a user ID in session
  req.session.userId = "test-user-" + Date.now();
  req.session.email = "test@example.com";

  console.log("🔐 SESSION TEST: Set userId:", req.session.userId);
  console.log("🔐 SESSION TEST: Session data:", req.session);

  res.json({
    message: "Session test - userId set",
    sessionId: req.sessionID,
    userId: req.session.userId,
    sessionData: req.session,
    cookies: req.headers.cookie || "No cookies",
  });
});

// Debug endpoint to check user data
app.get("/api/debug-users", (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");

    const usersFilePath = path.join(__dirname, "users.json");
    console.log("🔍 DEBUG: Reading users from:", usersFilePath);

    if (!fs.existsSync(usersFilePath)) {
      return res.json({
        error: "Users file not found",
        path: usersFilePath,
        exists: false,
      });
    }

    const fileContent = fs.readFileSync(usersFilePath, "utf8");
    console.log("🔍 DEBUG: File content length:", fileContent.length);

    const users = JSON.parse(fileContent);
    console.log("🔍 DEBUG: Parsed users count:", users.length);

    // Show first user (without password) for debugging
    const firstUser = users[0]
      ? {
          userId: users[0].userId,
          firstName: users[0].firstName,
          lastName: users[0].lastName,
          emailAddress: users[0].emailAddress,
          createdAt: users[0].createdAt,
          hasPassword: !!users[0].password,
        }
      : null;

    res.json({
      message: "User data debug",
      timestamp: new Date().toISOString(),
      filePath: usersFilePath,
      fileExists: true,
      fileSize: fileContent.length,
      usersCount: users.length,
      firstUser: firstUser,
      allEmails: users.map((u) => u.emailAddress),
    });
  } catch (error) {
    console.error("🔍 DEBUG ERROR:", error);
    res.status(500).json({
      error: "Failed to read user data",
      message: error.message,
      stack: error.stack,
    });
  }
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
      debugUsers: "/api/debug-users",
      createTestUser: "/api/create-test-user",
    },
    documentation: "https://github.com/dazeez1/task-manager",
    cors: {
      allowedOrigins: corsOptions.origin,
      credentials: corsOptions.credentials,
    },
  });
});

// Create test user for production
app.post("/api/create-test-user", (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const { v4: uuidv4 } = require("uuid");

    console.log("🔧 Creating test user for production...");

    // Create a test user with known credentials
    const testUser = {
      userId: uuidv4(),
      firstName: "Test",
      lastName: "User",
      emailAddress: "test@example.com",
      password: bcrypt.hashSync("password123", 10),
      createdAt: new Date().toISOString(),
    };

    // Read existing users or create new array
    const fs = require("fs");
    const path = require("path");
    const usersFilePath = path.join(__dirname, "users.json");

    let users = [];
    if (fs.existsSync(usersFilePath)) {
      try {
        const fileContent = fs.readFileSync(usersFilePath, "utf8");
        if (fileContent && fileContent.trim()) {
          users = JSON.parse(fileContent);
        }
      } catch (error) {
        console.log("🔧 Error reading existing users, starting fresh");
      }
    }

    // Check if test user already exists
    const existingUser = users.find(
      (u) => u.emailAddress === testUser.emailAddress
    );
    if (existingUser) {
      return res.json({
        message: "Test user already exists",
        user: {
          userId: existingUser.userId,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          emailAddress: existingUser.emailAddress,
          createdAt: existingUser.createdAt,
        },
      });
    }

    // Add test user
    users.push(testUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    console.log("🔧 Test user created successfully");

    res.json({
      message: "Test user created successfully",
      user: {
        userId: testUser.userId,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        emailAddress: testUser.emailAddress,
        createdAt: testUser.createdAt,
      },
      credentials: {
        email: "test@example.com",
        password: "password123",
      },
    });
  } catch (error) {
    console.error("🔧 Error creating test user:", error);
    res.status(500).json({
      error: "Failed to create test user",
      message: error.message,
    });
  }
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.originalUrl,
    availableEndpoints: [
      "/api/auth",
      "/api/tasks",
      "/api/test-cors",
      "/api/test-session",
      "/api/debug-users",
      "/api/create-test-user",
    ],
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

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simple session configuration - NO CORS
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: "lax",
    path: "/"
  }
}));

// Simple request logger
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Task Manager API",
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// Simple authentication routes
app.post("/api/auth/signup", (req, res) => {
  try {
    const { firstName, lastName, emailAddress } = req.body;
    
    // Create a simple user
    const user = {
      id: Date.now().toString(),
      firstName: firstName || "User",
      lastName: lastName || "Name", 
      emailAddress: emailAddress || "user@example.com",
      createdAt: new Date().toISOString()
    };

    // Set session
    req.session.user = user;
    req.session.isAuthenticated = true;

    console.log("✅ User signed up:", user.emailAddress);
    console.log("🔐 Session set:", req.sessionID);

    res.json({
      success: true,
      message: "User registered successfully",
      user: user
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { emailAddress, password } = req.body;
    
    // Create a simple user for any login
    const user = {
      id: Date.now().toString(),
      firstName: "User",
      lastName: "Name",
      emailAddress: emailAddress || "user@example.com",
      createdAt: new Date().toISOString()
    };

    // Set session
    req.session.user = user;
    req.session.isAuthenticated = true;

    console.log("✅ User logged in:", user.emailAddress);
    console.log("🔐 Session set:", req.sessionID);
    console.log("🍪 Session cookie should be set");

    res.json({
      success: true,
      message: "Login successful",
      user: user
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ success: false, message: "Logout failed" });
      }
      
      console.log("✅ User logged out");
      res.json({ success: true, message: "Logout successful" });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
});

app.get("/api/auth/me", (req, res) => {
  try {
    console.log("🔍 /me called - Session ID:", req.sessionID);
    console.log("🔍 Session data:", req.session);
    
    if (req.session && req.session.isAuthenticated && req.session.user) {
      console.log("✅ Valid session found");
      res.json({
        success: true,
        user: req.session.user,
        isAuthenticated: true
      });
    } else {
      console.log("❌ No valid session");
      res.json({
        success: false,
        message: "Not authenticated",
        isAuthenticated: false
      });
    }
  } catch (error) {
    console.error("/me error:", error);
    res.status(500).json({ success: false, message: "Failed to get user info" });
  }
});

// Simple task routes
app.get("/api/tasks", (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  // Return sample tasks
  const tasks = [
    {
      id: "1",
      title: "Welcome to Task Manager!",
      description: "This is your first task",
      priority: "Medium",
      completed: false,
      createdAt: new Date().toISOString()
    }
  ];

  res.json({ success: true, tasks: tasks });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working",
    sessionId: req.sessionID,
    sessionData: req.session,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${isProduction ? 'Production' : 'Development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

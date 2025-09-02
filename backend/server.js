const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key-2024",
  resave: true,
  saveUninitialized: true,
  name: "task-manager-session",
  cookie: {
    secure: false,
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "none",
    path: "/"
  }
}));

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://task-manager-rho-virid.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  
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

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working",
    sessionId: req.sessionID,
    timestamp: new Date().toISOString()
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
      createdAt: new Date().toISOString()
    };

    req.session.user = user;
    req.session.isAuthenticated = true;

    res.json({
      success: true,
      message: "User registered successfully",
      user: user
    });
  } catch (error) {
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
      createdAt: new Date().toISOString()
    };

    req.session.user = user;
    req.session.isAuthenticated = true;

    res.json({
      success: true,
      message: "Login successful",
      user: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.json({ success: true, message: "Logout successful" });
  });
});

app.get("/api/auth/me", (req, res) => {
  if (req.session && req.session.isAuthenticated && req.session.user) {
    res.json({
      success: true,
      user: req.session.user,
      isAuthenticated: true
    });
  } else {
    res.json({
      success: false,
      message: "Not authenticated",
      isAuthenticated: false
    });
  }
});

// Task routes
app.get("/api/tasks", (req, res) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

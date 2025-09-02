const express = require("express");
const router = express.Router();

// Simple middleware to allow all requests
const allowAll = (req, res, next) => next();

// POST /signup - Simple signup that always works
router.post("/signup", allowAll, (req, res) => {
  try {
    const { firstName, lastName, emailAddress } = req.body;
    
    console.log("📝 SIMPLE SIGNUP:", { firstName, lastName, emailAddress });
    
    const newUser = {
      userId: "user-" + Date.now(),
      firstName: firstName || "User",
      lastName: lastName || "Name",
      emailAddress: emailAddress || "user@example.com",
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: "User registered successfully (simple)",
      user: newUser
    });
  } catch (error) {
    console.error("Simple signup error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
});

// POST /login - Simple login that always works
router.post("/login", allowAll, (req, res) => {
  try {
    const { emailAddress, password } = req.body;
    
    console.log("🔑 SIMPLE LOGIN:", { emailAddress, password });
    
    // Create a user object for any login attempt
    const user = {
      userId: "user-" + Date.now(),
      firstName: "Test",
      lastName: "User",
      emailAddress: emailAddress || "test@example.com",
      createdAt: new Date().toISOString()
    };
    
    // Set session (if available)
    if (req.session) {
      req.session.userId = user.userId;
      console.log("🔑 Session set:", req.session.userId);
    }
    
    res.json({
      success: true,
      message: "Login successful (simple)",
      user: user
    });
  } catch (error) {
    console.error("Simple login error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to authenticate user",
    });
  }
});

// POST /logout - Simple logout
router.post("/logout", allowAll, (req, res) => {
  try {
    if (req.session) {
      req.session.destroy();
    }
    
    res.json({
      success: true,
      message: "Logout successful (simple)",
    });
  } catch (error) {
    console.error("Simple logout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
});

// GET /me - Simple user info
router.get("/me", allowAll, (req, res) => {
  try {
    console.log("🔍 SIMPLE /me called");
    
    // Return a default user for any request
    const user = {
      userId: req.session?.userId || "default-user-123",
      firstName: "Default",
      lastName: "User",
      emailAddress: "default@example.com",
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error("Simple /me error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user information",
    });
  }
});

module.exports = router;

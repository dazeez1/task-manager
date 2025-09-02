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
      req.session.email = user.emailAddress;
      req.session.firstName = user.firstName;
      req.session.lastName = user.lastName;
      console.log("🔑 Session set:", user.userId);
      console.log("🔑 Session data:", req.session);
    }
    
    // Force session save and set cookie
    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err);
        return res.status(500).json({ 
          success: false,
          message: "Failed to save session" 
        });
      }

      // Explicitly set the session cookie
      res.cookie('task-manager-session', req.sessionID, {
        httpOnly: false,
        secure: false,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
      });

      console.log("✅ Session saved and cookie set");
      console.log("🍪 Cookie being set:", req.sessionID);

      res.json({
        success: true,
        message: "Login successful (simple)",
        user: user,
        sessionId: req.sessionID,
        cookieSet: true
      });
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
    console.log("🔍 Session ID:", req.sessionID);
    console.log("🔍 Session data:", req.session);
    console.log("🔍 Cookies in request:", req.headers.cookie);
    
    // Check if we have a valid session
    if (req.session && req.session.userId) {
      console.log("✅ Valid session found:", req.session.userId);
      
      const user = {
        userId: req.session.userId,
        firstName: req.session.firstName || "User",
        lastName: req.session.lastName || "Name",
        emailAddress: req.session.email || "user@example.com",
        createdAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        user: user,
        sessionValid: true,
        sessionId: req.sessionID
      });
    } else {
      console.log("❌ No valid session found, returning default user");
      
      // Return a default user for any request
      const user = {
        userId: "default-user-123",
        firstName: "Default",
        lastName: "User",
        emailAddress: "default@example.com",
        createdAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        user: user,
        sessionValid: false,
        sessionId: req.sessionID
      });
    }
  } catch (error) {
    console.error("Simple /me error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user information",
    });
  }
});

module.exports = router;

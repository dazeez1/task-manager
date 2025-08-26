const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const dataManager = require("../utils/dataManager");
const { requireNoAuthentication } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /signup - Register new user
router.post("/signup", requireNoAuthentication, async (req, res) => {
  try {
    const { firstName, lastName, emailAddress, password } = req.body;

    // Validate input fields
    if (!firstName || !lastName || !emailAddress || !password) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: firstName, lastName, emailAddress, password",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = dataManager.findUserByEmail(emailAddress);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email address already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      userId: uuidv4(),
      firstName,
      lastName,
      emailAddress,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    // Save user to database
    dataManager.addNewUser(newUser);

    // Start session
    req.session.userId = newUser.userId;

    // Return user data (without password)
    const { password: _, ...userData } = newUser;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
});

// POST /login - Authenticate user and start session
router.post("/login", requireNoAuthentication, async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    // Validate input fields
    if (!emailAddress || !password) {
      return res.status(400).json({
        success: false,
        message: "Email address and password are required",
      });
    }

    // Find user by email
    const user = dataManager.findUserByEmail(emailAddress);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email address or password",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email address or password",
      });
    }

    // Start session
    req.session.userId = user.userId;

    // Return user data (without password)
    const { password: _, ...userData } = user;

    res.json({
      success: true,
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to authenticate user",
    });
  }
});

// POST /logout - End session
router.post("/logout", (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to logout",
        });
      }

      res.json({
        success: true,
        message: "Logout successful",
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
});

// GET /me - Get current user info
router.get("/me", (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = dataManager.findUserById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user data (without password)
    const { password: _, ...userData } = user;

    res.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user information",
    });
  }
});

module.exports = router;

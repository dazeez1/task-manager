import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import config from "../../config/config.js";
import dataService from "../services/dataService.js";

// Signup controller
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, emailAddress, password } = req.body;

    console.log("📝 Signup attempt:", { firstName, lastName, emailAddress });

    // Validate input data
    try {
      dataService.validateUser({ firstName, lastName, emailAddress, password });
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message,
        code: "VALIDATION_ERROR",
      });
    }

    // Check if user already exists
    const existingUser = await dataService.getUserByEmail(emailAddress);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
        code: "USER_EXISTS",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    // Create user
    const user = await dataService.createUser({
      id: uuidv4(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      emailAddress: emailAddress.toLowerCase().trim(),
      password: hashedPassword,
    });

    // Set session
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
    };
    req.session.isAuthenticated = true;

    // Force session save
    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create session",
          code: "SESSION_ERROR",
        });
      }

      console.log("✅ User created and session saved:", user.id);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
        },
        sessionId: req.sessionID,
      });
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      code: "INTERNAL_ERROR",
    });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    console.log("🔐 Login attempt:", { emailAddress });

    // Validate input
    if (!emailAddress || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        code: "MISSING_CREDENTIALS",
      });
    }

    // Find user
    const user = await dataService.getUserByEmail(
      emailAddress.toLowerCase().trim()
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Set session
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
    };
    req.session.isAuthenticated = true;

    // Force session save
    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create session",
          code: "SESSION_ERROR",
        });
      }

      console.log("✅ User logged in and session saved:", user.id);

      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
        },
        sessionId: req.sessionID,
      });
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      code: "INTERNAL_ERROR",
    });
  }
};

// Logout controller
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Logout error:", err);
      return res.status(500).json({
        success: false,
        message: "Logout failed",
        code: "LOGOUT_ERROR",
      });
    }

    // Clear the session cookie
    res.clearCookie(config.SESSION_NAME);

    console.log("✅ User logged out successfully");
    res.json({
      success: true,
      message: "Logout successful",
    });
  });
};

// Get current user controller
export const getCurrentUser = (req, res) => {
  console.log("🔍 Get current user request");

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
      code: "NOT_AUTHENTICATED",
      sessionId: req.sessionID,
    });
  }
};

// Health check controller
export const healthCheck = (req, res) => {
  res.json({
    success: true,
    message: "Task Manager API is running",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    isProduction: config.isProduction,
    sessionId: req.sessionID,
  });
};

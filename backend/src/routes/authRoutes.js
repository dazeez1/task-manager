import express from "express";
import { body } from "express-validator";
import {
  signup,
  login,
  logout,
  getCurrentUser,
  healthCheck,
} from "../controllers/authController.js";

const router = express.Router();

// Validation middleware
const validateSignup = [
  body("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),
  body("emailAddress")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const validateLogin = [
  body("emailAddress")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.post("/logout", logout);
router.get("/me", getCurrentUser);
router.get("/health", healthCheck);

export default router;

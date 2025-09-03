import express from "express";
import { body } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import {
  getUserTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from "../controllers/taskController.js";

const router = express.Router();

// All task routes require authentication
router.use(requireAuth);

// Validation middleware
const validateCreateTask = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  body("priority")
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),
  body("status")
    .optional()
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Status must be Pending, In Progress, or Completed"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid ISO date"),
];

const validateUpdateTask = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),
  body("status")
    .optional()
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Status must be Pending, In Progress, or Completed"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid ISO date"),
];

// Task routes
router.get("/", getUserTasks); // GET /api/tasks - Get all user tasks
router.get("/stats", getTaskStats); // GET /api/tasks/stats - Get task statistics
router.get("/:id", getTaskById); // GET /api/tasks/:id - Get specific task
router.post("/", validateCreateTask, createTask); // POST /api/tasks - Create new task
router.put("/:id", validateUpdateTask, updateTask); // PUT /api/tasks/:id - Update task
router.delete("/:id", deleteTask); // DELETE /api/tasks/:id - Delete task

export default router;

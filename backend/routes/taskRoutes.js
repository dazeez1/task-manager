const express = require("express");
const { v4: uuidv4 } = require("uuid");
const dataManager = require("../utils/dataManager");
const { requireAuthentication } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authentication middleware to all task routes
router.use(requireAuthentication);

// GET /tasks - Get all tasks for current user
router.get("/", (req, res) => {
  try {
    const userTasks = dataManager.getTasksByUserId(req.currentUser.userId);

    res.json({
      success: true,
      tasks: userTasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tasks",
    });
  }
});

// POST /tasks - Create new task
router.post("/", (req, res) => {
  try {
    const { taskTitle, taskDescription, priorityLevel, dueDate } = req.body;

    // Validate required fields
    if (!taskTitle || !priorityLevel) {
      return res.status(400).json({
        success: false,
        message: "Task title and priority level are required",
      });
    }

    // Validate priority level
    const validPriorities = ["Low", "Medium", "High"];
    if (!validPriorities.includes(priorityLevel)) {
      return res.status(400).json({
        success: false,
        message: "Priority level must be Low, Medium, or High",
      });
    }

    // Validate due date if provided
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date format",
        });
      }
    }

    // Create new task
    const newTask = {
      taskId: uuidv4(),
      userId: req.currentUser.userId,
      taskTitle: taskTitle.trim(),
      taskDescription: taskDescription ? taskDescription.trim() : "",
      priorityLevel,
      dueDate: dueDate || null,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save task to database
    dataManager.addNewTask(newTask);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
});

// GET /tasks/:taskId - Get specific task
router.get("/:taskId", (req, res) => {
  try {
    const { taskId } = req.params;
    const userTasks = dataManager.getTasksByUserId(req.currentUser.userId);
    const task = userTasks.find((t) => t.taskId === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve task",
    });
  }
});

// PUT /tasks/:taskId - Update task
router.put("/:taskId", (req, res) => {
  try {
    const { taskId } = req.params;
    const { taskTitle, taskDescription, priorityLevel, dueDate, isCompleted } =
      req.body;

    // Check if task exists and belongs to user
    const userTasks = dataManager.getTasksByUserId(req.currentUser.userId);
    const existingTask = userTasks.find((t) => t.taskId === taskId);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Validate priority level if provided
    if (priorityLevel) {
      const validPriorities = ["Low", "Medium", "High"];
      if (!validPriorities.includes(priorityLevel)) {
        return res.status(400).json({
          success: false,
          message: "Priority level must be Low, Medium, or High",
        });
      }
    }

    // Validate due date if provided
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date format",
        });
      }
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (taskTitle !== undefined) updateData.taskTitle = taskTitle.trim();
    if (taskDescription !== undefined)
      updateData.taskDescription = taskDescription.trim();
    if (priorityLevel !== undefined) updateData.priorityLevel = priorityLevel;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (isCompleted !== undefined)
      updateData.isCompleted = Boolean(isCompleted);

    // Update task
    const updatedTask = dataManager.updateExistingTask(taskId, updateData);

    res.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
});

// DELETE /tasks/:taskId - Delete task
router.delete("/:taskId", (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if task exists and belongs to user
    const userTasks = dataManager.getTasksByUserId(req.currentUser.userId);
    const existingTask = userTasks.find((t) => t.taskId === taskId);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Delete task
    dataManager.deleteTask(taskId);

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
});

// PATCH /tasks/:taskId/toggle - Toggle task completion status
router.patch("/:taskId/toggle", (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if task exists and belongs to user
    const userTasks = dataManager.getTasksByUserId(req.currentUser.userId);
    const existingTask = userTasks.find((t) => t.taskId === taskId);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Toggle completion status
    const newCompletionStatus = !existingTask.isCompleted;
    const updatedTask = dataManager.updateExistingTask(taskId, {
      isCompleted: newCompletionStatus,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Task marked as ${
        newCompletionStatus ? "completed" : "incomplete"
      }`,
      task: updatedTask,
    });
  } catch (error) {
    console.error("Toggle task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle task status",
    });
  }
});

module.exports = router;

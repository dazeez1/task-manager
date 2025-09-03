import { v4 as uuidv4 } from "uuid";
import dataService from "../services/dataService.js";

// Get all tasks for the authenticated user
export const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`📋 Getting tasks for user: ${userId}`);

    const tasks = await dataService.getTasksByUserId(userId);

    res.json({
      success: true,
      tasks: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("❌ Get user tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      code: "FETCH_ERROR",
    });
  }
};

// Get a specific task by ID
export const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    console.log(`🔍 Getting task: ${taskId} for user: ${userId}`);

    const task = await dataService.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
        code: "TASK_NOT_FOUND",
      });
    }

    // Ensure user can only access their own tasks
    if (task.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this task",
        code: "ACCESS_DENIED",
      });
    }

    res.json({
      success: true,
      task: task,
    });
  } catch (error) {
    console.error("❌ Get task by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch task",
      code: "FETCH_ERROR",
    });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, status } = req.body;
    const userId = req.user.id;

    console.log(`➕ Creating task for user: ${userId}`, { title, priority });

    // Validate required fields
    if (!title || !priority) {
      return res.status(400).json({
        success: false,
        message: "Title and priority are required",
        code: "MISSING_FIELDS",
      });
    }

    // Validate priority
    const validPriorities = ["Low", "Medium", "High"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be Low, Medium, or High",
        code: "INVALID_PRIORITY",
      });
    }

    // Create task data
    const taskData = {
      id: uuidv4(),
      userId: userId,
      title: title.trim(),
      description: description ? description.trim() : "",
      priority: priority,
      status: status || "Pending",
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Validate task data
    try {
      dataService.validateTask(taskData);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message,
        code: "VALIDATION_ERROR",
      });
    }

    const newTask = await dataService.createTask(taskData);

    console.log(`✅ Task created successfully: ${newTask.id}`);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.error("❌ Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      code: "CREATE_ERROR",
    });
  }
};

// Update an existing task
export const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const updates = req.body;

    console.log(`✏️ Updating task: ${taskId} for user: ${userId}`, updates);

    // Get existing task
    const existingTask = await dataService.getTaskById(taskId);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
        code: "TASK_NOT_FOUND",
      });
    }

    // Ensure user can only update their own tasks
    if (existingTask.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this task",
        code: "ACCESS_DENIED",
      });
    }

    // Validate priority if it's being updated
    if (updates.priority) {
      const validPriorities = ["Low", "Medium", "High"];
      if (!validPriorities.includes(updates.priority)) {
        return res.status(400).json({
          success: false,
          message: "Priority must be Low, Medium, or High",
          code: "INVALID_PRIORITY",
        });
      }
    }

    // Update task
    const updatedTask = await dataService.updateTask(taskId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    console.log(`✅ Task updated successfully: ${taskId}`);

    res.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("❌ Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      code: "UPDATE_ERROR",
    });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    console.log(`🗑️ Deleting task: ${taskId} for user: ${userId}`);

    // Get existing task
    const existingTask = await dataService.getTaskById(taskId);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
        code: "TASK_NOT_FOUND",
      });
    }

    // Ensure user can only delete their own tasks
    if (existingTask.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this task",
        code: "ACCESS_DENIED",
      });
    }

    // Delete task
    await dataService.deleteTask(taskId);

    console.log(`✅ Task deleted successfully: ${taskId}`);

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      code: "DELETE_ERROR",
    });
  }
};

// Get task statistics for the user
export const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`📊 Getting task stats for user: ${userId}`);

    const tasks = await dataService.getTasksByUserId(userId);

    const stats = {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "Pending").length,
      inProgress: tasks.filter((task) => task.status === "In Progress").length,
      completed: tasks.filter((task) => task.status === "Completed").length,
      low: tasks.filter((task) => task.priority === "Low").length,
      medium: tasks.filter((task) => task.priority === "Medium").length,
      high: tasks.filter((task) => task.priority === "High").length,
    };

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error("❌ Get task stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch task statistics",
      code: "FETCH_ERROR",
    });
  }
};

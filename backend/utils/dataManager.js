const fs = require("fs");
const path = require("path");

class DataManager {
  constructor() {
    this.usersFilePath = path.join(__dirname, "../users.json");
    this.tasksFilePath = path.join(__dirname, "../tasks.json");
  }

  // Read data from JSON file
  readDataFromFile(filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      return JSON.parse(fileContent);
    } catch (error) {
      if (error.code === "ENOENT") {
        // File doesn't exist, return empty array
        return [];
      }
      console.error(`Error reading file ${filePath}:`, error);
      throw new Error("Failed to read data file");
    }
  }

  // Write data to JSON file
  writeDataToFile(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      return true;
    } catch (error) {
      console.error(`Error writing to file ${filePath}:`, error);
      throw new Error("Failed to write data file");
    }
  }

  // Get all users
  getAllUsers() {
    return this.readDataFromFile(this.usersFilePath);
  }

  // Save all users
  saveAllUsers(users) {
    return this.writeDataToFile(this.usersFilePath, users);
  }

  // Get all tasks
  getAllTasks() {
    return this.readDataFromFile(this.tasksFilePath);
  }

  // Save all tasks
  saveAllTasks(tasks) {
    return this.writeDataToFile(this.tasksFilePath, tasks);
  }

  // Find user by email
  findUserByEmail(emailAddress) {
    const users = this.getAllUsers();
    return users.find((user) => user.emailAddress === emailAddress);
  }

  // Find user by ID
  findUserById(userId) {
    const users = this.getAllUsers();
    return users.find((user) => user.userId === userId);
  }

  // Add new user
  addNewUser(userData) {
    const users = this.getAllUsers();
    users.push(userData);
    this.saveAllUsers(users);
    return userData;
  }

  // Get tasks by user ID
  getTasksByUserId(userId) {
    const tasks = this.getAllTasks();
    return tasks.filter((task) => task.userId === userId);
  }

  // Add new task
  addNewTask(taskData) {
    const tasks = this.getAllTasks();
    tasks.push(taskData);
    this.saveAllTasks(tasks);
    return taskData;
  }

  // Update existing task
  updateExistingTask(taskId, updatedTaskData) {
    const tasks = this.getAllTasks();
    const taskIndex = tasks.findIndex((task) => task.taskId === taskId);

    if (taskIndex === -1) {
      throw new Error("Task not found");
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTaskData };
    this.saveAllTasks(tasks);
    return tasks[taskIndex];
  }

  // Delete task
  deleteTask(taskId) {
    const tasks = this.getAllTasks();
    const taskIndex = tasks.findIndex((task) => task.taskId === taskId);

    if (taskIndex === -1) {
      throw new Error("Task not found");
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    this.saveAllTasks(tasks);
    return deletedTask;
  }
}

module.exports = new DataManager();

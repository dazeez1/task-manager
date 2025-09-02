const fs = require("fs");
const path = require("path");

class DataManager {
  constructor() {
    this.usersFilePath = path.join(__dirname, "../users.json");
    this.tasksFilePath = path.join(__dirname, "../tasks.json");

    console.log(`🏗️ DataManager initialized`);
    console.log(`🏗️ Users file path: ${this.usersFilePath}`);
    console.log(`🏗️ Tasks file path: ${this.tasksFilePath}`);
    console.log(`🏗️ Current directory: ${__dirname}`);
    console.log(`🏗️ Parent directory: ${path.dirname(__dirname)}`);
  }

  // Read data from JSON file
  readDataFromFile(filePath) {
    try {
      console.log(`📁 Attempting to read file: ${filePath}`);
      const fileContent = fs.readFileSync(filePath, "utf8");
      console.log(`📁 File content length: ${fileContent.length} characters`);
      const data = JSON.parse(fileContent);
      console.log(
        `📁 Successfully read ${
          Array.isArray(data) ? data.length : "data"
        } from ${filePath}`
      );
      return data;
    } catch (error) {
      console.error(`❌ Error reading file ${filePath}:`, error);
      if (error.code === "ENOENT") {
        console.log(
          `📁 File doesn't exist: ${filePath}, returning empty array`
        );
        return [];
      }
      throw new Error(`Failed to read data file: ${error.message}`);
    }
  }

  // Write data to JSON file
  writeDataToFile(filePath, data) {
    try {
      console.log(`📝 Attempting to write to file: ${filePath}`);
      console.log(`📝 Data to write:`, data);
      const jsonData = JSON.stringify(data, null, 2);
      console.log(`📝 JSON string length: ${jsonData.length} characters`);
      fs.writeFileSync(filePath, jsonData, "utf8");
      console.log(`📝 Successfully wrote to file: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Error writing to file ${filePath}:`, error);
      console.error(`❌ Error details:`, {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to write data file: ${error.message}`);
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

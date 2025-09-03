import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataService {
  constructor() {
    this.dataDir = path.join(__dirname, "../../data");
    this.usersFile = path.join(this.dataDir, "users.json");
    this.tasksFile = path.join(this.dataDir, "tasks.json");
  }

  // Generic file operations
  async readFile(filePath) {
    try {
      const data = await fs.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        // File doesn't exist, return empty array
        return [];
      }
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async writeFile(filePath, data) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
      return true;
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  // User operations
  async getAllUsers() {
    return await this.readFile(this.usersFile);
  }

  async getUserById(id) {
    const users = await this.getAllUsers();
    return users.find((user) => user.id === id);
  }

  async getUserByEmail(email) {
    const users = await this.getAllUsers();
    return users.find((user) => user.emailAddress === email);
  }

  async createUser(userData) {
    const users = await this.getAllUsers();
    const newUser = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    await this.writeFile(this.usersFile, users);
    return newUser;
  }

  async updateUser(id, updates) {
    const users = await this.getAllUsers();
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.writeFile(this.usersFile, users);
    return users[userIndex];
  }

  async deleteUser(id) {
    const users = await this.getAllUsers();
    const filteredUsers = users.filter((user) => user.id !== id);
    await this.writeFile(this.usersFile, filteredUsers);
    return true;
  }

  // Task operations
  async getAllTasks() {
    return await this.readFile(this.tasksFile);
  }

  async getTasksByUserId(userId) {
    const tasks = await this.getAllTasks();
    return tasks.filter((task) => task.userId === userId);
  }

  async getTaskById(id) {
    const tasks = await this.getAllTasks();
    return tasks.find((task) => task.id === id);
  }

  async createTask(taskData) {
    const tasks = await this.getAllTasks();
    const newTask = {
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    await this.writeFile(this.tasksFile, tasks);
    return newTask;
  }

  async updateTask(id, updates) {
    const tasks = await this.getAllTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      throw new Error("Task not found");
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.writeFile(this.tasksFile, tasks);
    return tasks[taskIndex];
  }

  async deleteTask(id) {
    const tasks = await this.getAllTasks();
    const filteredTasks = tasks.filter((task) => task.id !== id);
    await this.writeFile(this.tasksFile, filteredTasks);
    return true;
  }

  // Data validation
  validateUser(userData) {
    const { firstName, lastName, emailAddress, password } = userData;

    if (!firstName || !lastName || !emailAddress || !password) {
      throw new Error("All user fields are required");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      throw new Error("Invalid email format");
    }

    return true;
  }

  validateTask(taskData) {
    const { title, priority, userId } = taskData;

    if (!title || !priority || !userId) {
      throw new Error("Title, priority, and userId are required");
    }

    const validPriorities = ["Low", "Medium", "High"];
    if (!validPriorities.includes(priority)) {
      throw new Error("Priority must be Low, Medium, or High");
    }

    return true;
  }
}

export default new DataService();

// Dashboard-specific JavaScript
const API_BASE_URL = "https://task-manager-2ejf.onrender.com/api";

console.log("Dashboard.js loaded!");

// DOM elements
const userInfo = document.getElementById("userInfo");
const statsContainer = document.getElementById("statsContainer");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskForm = document.getElementById("taskForm");
const tasksContainer = document.getElementById("tasksContainer");

console.log("DOM elements found:", {
  userInfo: !!userInfo,
  statsContainer: !!statsContainer,
  addTaskBtn: !!addTaskBtn,
  taskForm: !!taskForm,
  tasksContainer: !!tasksContainer,
});

// Loading state
let isLoading = false;

// Utility functions
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showMessage(message, type = "info") {
  // Remove existing messages
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

function setLoading(loading) {
  isLoading = loading;
  const submitBtn = taskForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    if (loading) {
      submitBtn.textContent = "Creating...";
      submitBtn.disabled = true;
    } else {
      submitBtn.textContent = "Create Task";
      submitBtn.disabled = false;
    }
  }
}

// API request helper
async function makeApiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage =
          errorData.message || errorData.error || "API request failed";
      } catch {
        errorMessage =
          errorText || `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    const text = await response.text();
    if (!text) {
      return { data: null };
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.warn("Failed to parse JSON response:", parseError);
      return { data: text };
    }
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

// Authentication functions
async function checkAuthStatus() {
  try {
    const response = await makeApiRequest(`${API_BASE_URL}/auth/me`);
    return response.data;
  } catch (error) {
    return null;
  }
}

async function handleLogout() {
  try {
    await makeApiRequest(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
    });

    showMessage("Logged out successfully!", "success");

    // Redirect to login page
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// Task management functions
async function loadTasks() {
  try {
    const response = await makeApiRequest(`${API_BASE_URL}/tasks`);
    renderTasks(response.data);
    updateStats(response.data);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function createTask(event) {
  event.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData(taskForm);
    const taskData = {
      taskTitle: formData.get("taskTitle"),
      taskDescription: formData.get("taskDescription"),
      priorityLevel: formData.get("priorityLevel"),
      dueDate: formData.get("dueDate") || null,
    };

    const response = await makeApiRequest(`${API_BASE_URL}/tasks`, {
      method: "POST",
      body: JSON.stringify(taskData),
    });

    showMessage("Task created successfully!", "success");

    // Reset form and hide it
    taskForm.reset();
    hideTaskForm();

    // Reload tasks
    await loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function updateTask(taskId, updates) {
  try {
    const response = await makeApiRequest(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    showMessage("Task updated successfully!", "success");
    await loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function deleteTask(taskId) {
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  try {
    await makeApiRequest(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
    });

    showMessage("Task deleted successfully!", "success");
    await loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function toggleTaskCompletion(taskId, isCompleted) {
  try {
    await updateTask(taskId, { isCompleted: !isCompleted });
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// UI rendering functions
function renderTasks(tasks) {
  if (!tasks || tasks.length === 0) {
    tasksContainer.innerHTML =
      '<div class="no-tasks">No tasks found. Create your first task!</div>';
    return;
  }

  tasksContainer.innerHTML = tasks
    .map(
      (task) => `
    <div class="task-card ${
      task.isCompleted ? "completed" : ""
    } priority-${task.priorityLevel.toLowerCase()}">
      <div class="task-header">
        <div class="task-title">${escapeHtml(task.taskTitle)}</div>
        <div class="task-actions">
          <button class="btn-edit" onclick="editTask('${
            task.id
          }')">Edit</button>
          <button class="btn-delete" onclick="deleteTask('${
            task.id
          }')">Delete</button>
        </div>
      </div>
      
      <div class="task-description">${escapeHtml(
        task.taskDescription || "No description"
      )}</div>
      
      <div class="task-meta">
        <span class="priority-badge priority-${task.priorityLevel.toLowerCase()}">${
        task.priorityLevel
      }</span>
        ${
          task.dueDate
            ? `<span class="due-date">Due: ${new Date(
                task.dueDate
              ).toLocaleDateString()}</span>`
            : ""
        }
        <div class="completion-toggle">
          <input type="checkbox" id="task-${task.id}" ${
        task.isCompleted ? "checked" : ""
      } onchange="toggleTaskCompletion('${task.id}', ${task.isCompleted})">
          <label for="task-${task.id}">${
        task.isCompleted ? "Completed" : "Mark Complete"
      }</label>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function updateStats(tasks) {
  if (!tasks) return;

  const total = tasks.length;
  const completed = tasks.filter((task) => task.isCompleted).length;
  const pending = total - completed;
  const highPriority = tasks.filter(
    (task) => task.priorityLevel === "High" && !task.isCompleted
  ).length;

  statsContainer.innerHTML = `
    <div class="stat-card">
      <h3>${total}</h3>
      <p>Total Tasks</p>
    </div>
    <div class="stat-card">
      <h3>${completed}</h3>
      <p>Completed</p>
    </div>
    <div class="stat-card">
      <h3>${pending}</h3>
      <p>Pending</p>
    </div>
    <div class="stat-card">
      <h3>${highPriority}</h3>
      <p>High Priority</p>
    </div>
  `;
}

// Form management functions
function showTaskForm() {
  taskForm.style.display = "block";
  addTaskBtn.style.display = "none";
}

function hideTaskForm() {
  taskForm.style.display = "none";
  addTaskBtn.style.display = "block";
}

function editTask(taskId) {
  // For now, show a message. You can implement inline editing later
  showMessage("Edit functionality coming soon!", "info");
}

// Dashboard initialization
async function initializeDashboard() {
  console.log("Initializing dashboard...");

  const user = await checkAuthStatus();
  console.log("Auth check result:", user);

  if (!user) {
    console.log("No user found, redirecting to login...");
    window.location.href = "/";
    return;
  }

  console.log("User authenticated:", user.firstName);

  // Update user info
  if (userInfo) {
    userInfo.textContent = `Welcome, ${escapeHtml(user.firstName)}!`;
    console.log("Updated user info");
  }

  // Load initial data
  console.log("Loading tasks...");
  await loadTasks();
  console.log("Dashboard initialization complete!");
}

// Event listeners
if (addTaskBtn) {
  addTaskBtn.addEventListener("click", showTaskForm);
}

if (taskForm) {
  taskForm.addEventListener("submit", createTask);
}

// Initialize dashboard when page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded - Starting dashboard initialization");
  initializeDashboard();
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === "loading") {
  console.log("DOM still loading, waiting for DOMContentLoaded...");
} else {
  console.log("DOM already loaded, initializing immediately...");
  initializeDashboard();
}

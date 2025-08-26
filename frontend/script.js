// API Configuration
const API_BASE_URL = "http://localhost:3000/api";

// Global variables
let currentUser = null;
let currentTasks = [];
let editingTaskId = null;

// DOM Elements
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

// Dashboard elements
const userNameElement = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskForm = document.getElementById("taskForm");
const taskFormElement = document.getElementById("taskFormElement");
const formTitle = document.getElementById("formTitle");
const cancelBtn = document.getElementById("cancelBtn");
const tasksContainer = document.getElementById("tasksContainer");
const totalTasksElement = document.getElementById("totalTasks");
const completedTasksElement = document.getElementById("completedTasks");
const pendingTasksElement = document.getElementById("pendingTasks");

// Utility Functions
function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.display = "block";
  element.className = isError ? "error-message" : "success-message";

  setTimeout(() => {
    element.style.display = "none";
  }, 5000);
}

function setLoading(isLoading) {
  const buttons = document.querySelectorAll('button[type="submit"]');
  buttons.forEach((btn) => {
    btn.disabled = isLoading;
    if (isLoading) {
      btn.textContent = "Loading...";
    } else {
      btn.textContent = btn.dataset.originalText || btn.textContent;
    }
  });
}

function formatDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(dateString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

// API Functions
async function makeApiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// Authentication Functions
async function handleLogin(formData) {
  try {
    setLoading(true);
    const response = await makeApiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        emailAddress: formData.get("emailAddress"),
        password: formData.get("password"),
      }),
    });

    currentUser = response.user;
    showMessage(successMessage, "Login successful! Redirecting...", false);

    setTimeout(() => {
      window.location.href = "http://localhost:3000/dashboard";
    }, 1000);
  } catch (error) {
    showMessage(errorMessage, error.message, true);
  } finally {
    setLoading(false);
  }
}

async function handleSignup(formData) {
  try {
    setLoading(true);
    const response = await makeApiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        emailAddress: formData.get("emailAddress"),
        password: formData.get("password"),
      }),
    });

    currentUser = response.user;
    showMessage(
      successMessage,
      "Account created successfully! Redirecting...",
      false
    );

    setTimeout(() => {
      window.location.href = "http://localhost:3000/dashboard";
    }, 1000);
  } catch (error) {
    showMessage(errorMessage, error.message, true);
  } finally {
    setLoading(false);
  }
}

async function handleLogout() {
  try {
    await makeApiRequest("/auth/logout", {
      method: "POST",
    });

    window.location.href = "http://localhost:3000/";
  } catch (error) {
    // Force redirect even if logout fails
    window.location.href = "http://localhost:3000/";
  }
}

async function checkAuthStatus() {
  try {
    const response = await makeApiRequest("/auth/me");
    currentUser = response.user;
    return true;
  } catch (error) {
    return false;
  }
}

// Task Management Functions
async function loadTasks() {
  try {
    const response = await makeApiRequest("/tasks");
    currentTasks = response.tasks;
    renderTasks();
    updateStats();
  } catch (error) {
    showMessage(errorMessage, "Failed to load tasks: " + error.message, true);
  }
}

async function createTask(taskData) {
  try {
    const response = await makeApiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });

    currentTasks.push(response.task);
    renderTasks();
    updateStats();
    showMessage(successMessage, "Task created successfully!", false);

    return response.task;
  } catch (error) {
    showMessage(errorMessage, "Failed to create task: " + error.message, true);
    throw error;
  }
}

async function updateTask(taskId, taskData) {
  try {
    const response = await makeApiRequest(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });

    const index = currentTasks.findIndex((task) => task.taskId === taskId);
    if (index !== -1) {
      currentTasks[index] = response.task;
    }

    renderTasks();
    updateStats();
    showMessage(successMessage, "Task updated successfully!", false);

    return response.task;
  } catch (error) {
    showMessage(errorMessage, "Failed to update task: " + error.message, true);
    throw error;
  }
}

async function deleteTask(taskId) {
  try {
    await makeApiRequest(`/tasks/${taskId}`, {
      method: "DELETE",
    });

    currentTasks = currentTasks.filter((task) => task.taskId !== taskId);
    renderTasks();
    updateStats();
    showMessage(successMessage, "Task deleted successfully!", false);
  } catch (error) {
    showMessage(errorMessage, "Failed to delete task: " + error.message, true);
  }
}

async function toggleTaskCompletion(taskId) {
  try {
    const response = await makeApiRequest(`/tasks/${taskId}/toggle`, {
      method: "PATCH",
    });

    const index = currentTasks.findIndex((task) => task.taskId === taskId);
    if (index !== -1) {
      currentTasks[index] = response.task;
    }

    renderTasks();
    updateStats();
  } catch (error) {
    showMessage(
      errorMessage,
      "Failed to update task status: " + error.message,
      true
    );
  }
}

// UI Functions
function renderTasks() {
  if (currentTasks.length === 0) {
    tasksContainer.innerHTML = `
            <div class="empty-state">
                <h3>No tasks yet</h3>
                <p>Create your first task to get started!</p>
            </div>
        `;
    return;
  }

  const tasksHTML = currentTasks
    .map(
      (task) => `
        <div class="task-card ${
          task.isCompleted ? "completed" : ""
        }" data-task-id="${task.taskId}">
            <div class="task-header">
                <div>
                    <div class="task-title">${escapeHtml(task.taskTitle)}</div>
                    <span class="task-priority priority-${task.priorityLevel.toLowerCase()}">${
        task.priorityLevel
      }</span>
                </div>
            </div>
            
            ${
              task.taskDescription
                ? `<div class="task-description">${escapeHtml(
                    task.taskDescription
                  )}</div>`
                : ""
            }
            
            <div class="task-meta">
                <div>
                    <strong>Created:</strong> ${formatDate(task.createdAt)}
                    ${
                      task.dueDate
                        ? `<br><strong>Due:</strong> ${formatDate(
                            task.dueDate
                          )}`
                        : ""
                    }
                </div>
                <div class="task-actions">
                    <button class="task-btn complete" onclick="toggleTaskCompletion('${
                      task.taskId
                    }')">
                        ${task.isCompleted ? "Undo" : "Complete"}
                    </button>
                    <button class="task-btn edit" onclick="editTask('${
                      task.taskId
                    }')">Edit</button>
                    <button class="task-btn delete" onclick="deleteTask('${
                      task.taskId
                    }')">Delete</button>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  tasksContainer.innerHTML = tasksHTML;
}

function updateStats() {
  const total = currentTasks.length;
  const completed = currentTasks.filter((task) => task.isCompleted).length;
  const pending = total - completed;

  totalTasksElement.textContent = total;
  completedTasksElement.textContent = completed;
  pendingTasksElement.textContent = pending;
}

function showTaskForm(isEditing = false) {
  taskForm.classList.add("show");
  formTitle.textContent = isEditing ? "Edit Task" : "Add New Task";

  if (!isEditing) {
    taskFormElement.reset();
    editingTaskId = null;
  }
}

function hideTaskForm() {
  taskForm.classList.remove("show");
  taskFormElement.reset();
  editingTaskId = null;
}

function editTask(taskId) {
  const task = currentTasks.find((t) => t.taskId === taskId);
  if (!task) return;

  editingTaskId = taskId;

  // Populate form
  document.getElementById("taskTitle").value = task.taskTitle;
  document.getElementById("taskDescription").value = task.taskDescription;
  document.getElementById("priorityLevel").value = task.priorityLevel;

  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const localDateTime = new Date(
      dueDate.getTime() - dueDate.getTimezoneOffset() * 60000
    );
    document.getElementById("dueDate").value = localDateTime
      .toISOString()
      .slice(0, 16);
  }

  showTaskForm(true);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Event Listeners
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    await handleLogin(formData);
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(signupForm);
    await handleSignup(formData);
  });
}

if (toggleFormBtn) {
  toggleFormBtn.addEventListener("click", () => {
    const isLoginVisible = !loginForm.classList.contains("hidden");

    if (isLoginVisible) {
      loginForm.classList.add("hidden");
      signupForm.classList.remove("hidden");
      toggleFormBtn.textContent = "Already have an account? Login";
    } else {
      signupForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
      toggleFormBtn.textContent = "Don't have an account? Sign up";
    }
  });
}

// Dashboard event listeners
if (logoutBtn) {
  logoutBtn.addEventListener("click", handleLogout);
}

if (addTaskBtn) {
  addTaskBtn.addEventListener("click", () => showTaskForm(false));
}

if (cancelBtn) {
  cancelBtn.addEventListener("click", hideTaskForm);
}

if (taskFormElement) {
  taskFormElement.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(taskFormElement);
    const taskData = {
      taskTitle: formData.get("taskTitle"),
      taskDescription: formData.get("taskDescription"),
      priorityLevel: formData.get("priorityLevel"),
      dueDate: formData.get("dueDate") || null,
    };

    try {
      if (editingTaskId) {
        await updateTask(editingTaskId, taskData);
      } else {
        await createTask(taskData);
      }

      hideTaskForm();
    } catch (error) {
      // Error is already handled in the respective functions
    }
  });
}

// Initialize dashboard
async function initializeDashboard() {
  const isAuthenticated = await checkAuthStatus();

  if (!isAuthenticated) {
    window.location.href = "http://localhost:3000/";
    return;
  }

  if (userNameElement && currentUser) {
    userNameElement.textContent = `Welcome, ${currentUser.firstName}!`;
  }

  await loadTasks();
}

// Initialize based on current page
document.addEventListener("DOMContentLoaded", () => {
  // Store original button text for loading states
  const submitButtons = document.querySelectorAll('button[type="submit"]');
  submitButtons.forEach((btn) => {
    btn.dataset.originalText = btn.textContent;
  });

  // Check if we're on the dashboard page
  if (
    window.location.pathname === "/dashboard" ||
    window.location.pathname.endsWith("dashboard.html")
  ) {
    initializeDashboard();
  }
});

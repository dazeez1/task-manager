// Task Manager Frontend Script
// Version: 2.0 - Production Ready

// Auto-detect API base URL
const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "https://task-manager-2ejf.onrender.com/api";

console.log("🌍 Environment detected:", window.location.hostname);
console.log("🔗 API Base URL:", API_BASE_URL);

// DOM element references
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const taskForm = document.getElementById("taskForm");
const tasksContainer = document.getElementById("tasksContainer");
const userInfo = document.getElementById("userInfo");
const statsContainer = document.getElementById("statsContainer");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskFormContainer = document.getElementById("taskFormContainer");
const toggleFormBtn = document.getElementById("toggleFormBtn"); // Added this line

// Utility functions
function showMessage(message, type = "info") {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

function setLoading(isLoading) {
  const submitBtns = document.querySelectorAll('button[type="submit"]');
  submitBtns.forEach((btn) => {
    btn.disabled = isLoading;
    btn.textContent = isLoading
      ? "Loading..."
      : btn.getAttribute("data-original-text") || "Submit";
  });
}

function formatDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Generic API request function
async function makeApiRequest(url, options = {}) {
  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const responseText = await response.text();

    if (!responseText) {
      throw new Error("Empty response from server");
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse JSON:", responseText);
      throw new Error("Invalid JSON response from server");
    }

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

// Authentication functions
async function handleLogin(event) {
  event.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData(loginForm);
    const loginData = {
      emailAddress: formData.get("emailAddress"),
      password: formData.get("password"),
    };

    const response = await makeApiRequest(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify(loginData),
    });

    showMessage("Login successful!", "success");

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
          ? "http://localhost:3000/dashboard"
          : "/dashboard";
    }, 1000);
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function handleSignup(event) {
  event.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData(signupForm);
    const signupData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      emailAddress: formData.get("emailAddress"),
      password: formData.get("password"),
    };

    const response = await makeApiRequest(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      body: JSON.stringify(signupData),
    });

    showMessage("Account created successfully! Please login.", "success");

    // Switch to login form
    setTimeout(() => {
      toggleForms();
    }, 1000);
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    setLoading(false);
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
      window.location.href =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
          ? "http://localhost:3000/"
          : "/";
    }, 1000);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function checkAuthStatus() {
  try {
    const response = await makeApiRequest(`${API_BASE_URL}/auth/me`);
    return response.data;
  } catch (error) {
    return null;
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

    await makeApiRequest(`${API_BASE_URL}/tasks`, {
      method: "POST",
      body: JSON.stringify(taskData),
    });

    showMessage("Task created successfully!", "success");
    taskForm.reset();
    hideTaskForm();
    loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function updateTask(taskId, updates) {
  try {
    await makeApiRequest(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    showMessage("Task updated successfully!", "success");
    loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function deleteTask(taskId) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    await makeApiRequest(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
    });

    showMessage("Task deleted successfully!", "success");
    loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function toggleTaskCompletion(taskId) {
  try {
    await makeApiRequest(`${API_BASE_URL}/tasks/${taskId}/toggle`, {
      method: "PATCH",
    });

    loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// UI functions
function renderTasks(tasks) {
  if (!tasksContainer) return;

  if (tasks.length === 0) {
    tasksContainer.innerHTML =
      '<p class="no-tasks">No tasks yet. Create your first task!</p>';
    return;
  }

  const tasksHTML = tasks
    .map(
      (task) => `
    <div class="task-card priority-${task.priorityLevel.toLowerCase()} ${
        task.isCompleted ? "completed" : ""
      }">
      <div class="task-header">
        <h3 class="task-title">${escapeHtml(task.taskTitle)}</h3>
        <div class="task-actions">
          <button onclick="editTask('${
            task.taskId
          }')" class="btn-edit">Edit</button>
          <button onclick="deleteTask('${
            task.taskId
          }')" class="btn-delete">Delete</button>
        </div>
      </div>
      <p class="task-description">${escapeHtml(
        task.taskDescription || "No description"
      )}</p>
      <div class="task-meta">
        <span class="priority-badge priority-${task.priorityLevel.toLowerCase()}">${
        task.priorityLevel
      }</span>
        <span class="due-date">Due: ${formatDate(task.dueDate)}</span>
        <label class="completion-toggle">
          <input type="checkbox" ${task.isCompleted ? "checked" : ""} 
                 onchange="toggleTaskCompletion('${task.taskId}')">
          Complete
        </label>
      </div>
    </div>
  `
    )
    .join("");

  tasksContainer.innerHTML = tasksHTML;
}

function updateStats(tasks) {
  if (!statsContainer) return;

  const total = tasks.length;
  const completed = tasks.filter((task) => task.isCompleted).length;
  const pending = total - completed;
  const highPriority = tasks.filter(
    (task) => task.priorityLevel === "High"
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

function showTaskForm() {
  if (taskFormContainer) {
    taskFormContainer.style.display = "block";
    addTaskBtn.style.display = "none";
  }
}

function hideTaskForm() {
  if (taskFormContainer) {
    taskFormContainer.style.display = "none";
    addTaskBtn.style.display = "block";
  }
}

function editTask(taskId) {
  // Implementation for editing tasks
  showMessage("Edit functionality coming soon!", "info");
}

// Form toggle functionality
function toggleForms() {
  const isLoginVisible = !loginForm.classList.contains("hidden");

  if (isLoginVisible) {
    // Switch to signup form
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    toggleFormBtn.textContent = "Already have an account? Login";
  } else {
    // Switch to login form
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    toggleFormBtn.textContent = "Don't have an account? Sign up";
  }
}

// Event listeners
if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

if (signupForm) {
  signupForm.addEventListener("submit", handleSignup);
}

if (taskForm) {
  taskForm.addEventListener("submit", createTask);
}

if (addTaskBtn) {
  addTaskBtn.addEventListener("click", showTaskForm);
}

if (toggleFormBtn) {
  toggleFormBtn.addEventListener("click", toggleForms);
}

// Store original button text for loading states
document.addEventListener("DOMContentLoaded", () => {
  const submitBtns = document.querySelectorAll('button[type="submit"]');
  submitBtns.forEach((btn) => {
    btn.setAttribute("data-original-text", btn.textContent);
  });
});

// Dashboard initialization
async function initializeDashboard() {
  const user = await checkAuthStatus();

  if (!user) {
    window.location.href =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
        ? "http://localhost:3000/"
        : "/";
    return;
  }

  if (userInfo) {
    userInfo.innerHTML = `
      <h2>Welcome, ${escapeHtml(user.firstName)}!</h2>
      <button onclick="handleLogout()" class="btn-logout">Logout</button>
    `;
  }

  loadTasks();
}

// Initialize based on current page
if (
  window.location.pathname === "/dashboard" ||
  window.location.pathname.includes("dashboard")
) {
  initializeDashboard();
}

// Task Manager Authentication System
class TaskManagerAuth {
  constructor() {
    this.apiBaseUrl = this.getApiBaseUrl();
    this.currentUser = null;
    this.init();
  }

  // Initialize the authentication system
  init() {
    this.setupEventListeners();
    this.checkAuthStatus();
    console.log("🔐 Task Manager Auth initialized");
    console.log("🌐 API Base URL:", this.apiBaseUrl);
  }

  // Get API base URL based on environment
  getApiBaseUrl() {
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3000/api";
    } else if (hostname === "task-manager-rho-virid.vercel.app") {
      // Production frontend - use production backend
      return "https://task-manager-2ejf.onrender.com/api";
    } else {
      // Fallback to production
      return "https://task-manager-2ejf.onrender.com/api";
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Tab switching
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });

    // Form submissions
    document
      .getElementById("loginForm")
      .addEventListener("submit", (e) => this.handleLogin(e));
    document
      .getElementById("signupForm")
      .addEventListener("submit", (e) => this.handleSignup(e));

    // Toast close button
    document
      .querySelector(".toast-close")
      .addEventListener("click", () => this.hideNotification());
  }

  // Switch between login and signup tabs
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    // Update forms
    document.querySelectorAll(".auth-form").forEach((form) => {
      form.classList.toggle("active", form.id === `${tabName}Form`);
    });

    // Clear forms when switching
    this.clearForms();
  }

  // Clear form inputs
  clearForms() {
    document.querySelectorAll("input").forEach((input) => (input.value = ""));
  }

  // Handle login form submission
  async handleLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const loginData = {
      emailAddress: formData.get("emailAddress"),
      password: formData.get("password"),
    };

    console.log("🔐 Attempting login...", { email: loginData.emailAddress });

    try {
      this.showLoading(true);

      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("✅ Login successful:", data.user);
        this.currentUser = data.user;
        this.showNotification("Login successful!", "success");

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1500);
      } else {
        console.error("❌ Login failed:", data.message);
        this.showNotification(data.message || "Login failed", "error");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      this.showNotification("Network error. Please try again.", "error");
    } finally {
      this.showLoading(false);
    }
  }

  // Handle signup form submission
  async handleSignup(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const signupData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      emailAddress: formData.get("emailAddress"),
      password: formData.get("password"),
    };

    console.log("📝 Attempting signup...", {
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      email: signupData.emailAddress,
    });

    try {
      this.showLoading(true);

      const response = await fetch(`${this.apiBaseUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("✅ Signup successful:", data.user);
        this.currentUser = data.user;
        this.showNotification("Account created successfully!", "success");

        // Switch to login tab after successful signup
        setTimeout(() => {
          this.switchTab("login");
          this.showNotification(
            "Please log in with your new account",
            "success"
          );
        }, 1500);
      } else {
        console.error("❌ Signup failed:", data.message);
        this.showNotification(data.message || "Signup failed", "error");
      }
    } catch (error) {
      console.error("❌ Signup error:", error);
      this.showNotification("Network error. Please try again.", "error");
    } finally {
      this.showLoading(false);
    }
  }

  // Check authentication status
  async checkAuthStatus() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success && data.isAuthenticated) {
        console.log("✅ User is authenticated:", data.user);
        this.currentUser = data.user;

        // Redirect to dashboard if already logged in
        if (
          window.location.pathname.includes("index.html") ||
          window.location.pathname === "/"
        ) {
          window.location.href = "dashboard.html";
        }
      } else {
        console.log("❌ User is not authenticated");
        this.currentUser = null;
      }
    } catch (error) {
      console.error("❌ Auth check error:", error);
    }
  }

  // Show/hide loading overlay
  showLoading(show) {
    const overlay = document.getElementById("loadingOverlay");
    if (show) {
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
    }
  }

  // Show notification toast
  showNotification(message, type = "info") {
    const toast = document.getElementById("notificationToast");
    const toastIcon = toast.querySelector(".toast-icon");
    const toastMessage = toast.querySelector(".toast-message");

    // Set message and icon
    toastMessage.textContent = message;
    toastIcon.className = `toast-icon ${type}`;

    // Show toast
    toast.classList.remove("hidden");
    toast.classList.add("show");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  // Hide notification toast
  hideNotification() {
    const toast = document.getElementById("notificationToast");
    toast.classList.remove("show");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 300);
  }

  // Logout user
  async logout() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        console.log("✅ Logout successful");
        this.currentUser = null;
        window.location.href = "index.html";
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  }
}

// Initialize authentication when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.taskManagerAuth = new TaskManagerAuth();
});

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = TaskManagerAuth;
}

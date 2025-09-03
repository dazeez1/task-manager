// API configuration
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api" // Development
    : "https://task-manager-2ejf.onrender.com/api"; // Production (Backend)

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const toggleFormBtn = document.getElementById("toggleFormBtn");

  // Check if elements exist
  if (!loginForm || !signupForm || !toggleFormBtn) {
    console.error("❌ Required DOM elements not found");
    return;
  }

  // Toggle between login and signup forms
  function toggleForms() {
    if (signupForm.classList.contains("hidden")) {
      // Show signup, hide login
      signupForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
      toggleFormBtn.textContent = "Already have an account? Login";
    } else {
      // Show login, hide signup
      loginForm.classList.remove("hidden");
      signupForm.classList.add("hidden");
      toggleFormBtn.textContent = "Don't have an account? Sign up";
    }
  }

  // Initialize form toggle
  toggleForms();

  // Handle login form submission
  async function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const email = formData.get("emailAddress");
    const password = formData.get("password");

    try {
      console.log("🔐 Attempting login...");

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include", // CRITICAL: Include cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailAddress: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Login successful:", data);
        console.log("🍪 Session ID received:", data.sessionId);

        // Check if cookies were set
        const cookies = document.cookie;
        console.log("🍪 Cookies after login:", cookies);

        alert("Login successful! Redirecting to dashboard...");

        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        console.error("❌ Login failed:", data.message);
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      alert("Login error: " + error.message);
    }
  }

  // Handle signup form submission
  async function handleSignup(event) {
    event.preventDefault();

    const formData = new FormData(signupForm);
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("emailAddress");

    try {
      console.log("📝 Attempting signup...");

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        credentials: "include", // CRITICAL: Include cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          emailAddress: email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Signup successful:", data);
        console.log("🍪 Session ID received:", data.sessionId);

        // Check if cookies were set
        const cookies = document.cookie;
        console.log("🍪 Cookies after signup:", cookies);

        alert("Signup successful! Please login.");

        // Switch to login form
        toggleForms();
      } else {
        console.error("❌ Signup failed:", data.message);
        alert("Signup failed: " + data.message);
      }
    } catch (error) {
      console.error("❌ Signup error:", error);
      alert("Signup error: " + error.message);
    }
  }

  // Event listeners
  loginForm.addEventListener("submit", handleLogin);
  signupForm.addEventListener("submit", handleSignup);
  toggleFormBtn.addEventListener("click", toggleForms);

  // Test API connection on page load
  async function testAPI() {
    try {
      const response = await fetch(`${API_BASE_URL}/test`, {
        credentials: "include", // Include cookies for session testing
      });
      const data = await response.json();
      console.log("🌐 API connection test:", data);

      // Log current cookies
      const cookies = document.cookie;
      console.log("🍪 Current cookies:", cookies);
    } catch (error) {
      console.error("❌ API connection test failed:", error);
    }
  }

  testAPI();
});

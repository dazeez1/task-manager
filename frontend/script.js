// API configuration
const API_BASE_URL = "https://task-manager-2ejf.onrender.com/api";

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const toggleFormBtn = document.getElementById("toggleFormBtn");
  const loginSection = document.getElementById("loginSection");
  const signupSection = document.getElementById("signupSection");

  // Check if elements exist
  if (!loginForm || !signupForm || !toggleFormBtn || !loginSection || !signupSection) {
    console.error("❌ Required DOM elements not found");
    return;
  }

  // Toggle between login and signup forms
  function toggleForms() {
    if (loginSection.style.display === "none") {
      loginSection.style.display = "block";
      signupSection.style.display = "none";
      toggleFormBtn.textContent = "Don't have an account? Sign up";
    } else {
      loginSection.style.display = "none";
      signupSection.style.display = "block";
      toggleFormBtn.textContent = "Already have an account? Login";
    }
  }

  // Initialize form toggle
  toggleForms();

  // Handle login form submission
  async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(loginForm);
    const email = formData.get("email");
    const password = formData.get("password");
    
    try {
      console.log("🔐 Attempting login...");
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailAddress: email,
          password: password
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Login successful:", data);
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
    const email = formData.get("email");
    
    try {
      console.log("📝 Attempting signup...");
      
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          emailAddress: email
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Signup successful:", data);
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
      const response = await fetch(`${API_BASE_URL}/test`);
      const data = await response.json();
      console.log("🌐 API connection test:", data);
    } catch (error) {
      console.error("❌ API connection test failed:", error);
    }
  }

  testAPI();
});

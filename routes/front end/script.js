const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

const API_BASE = "http://127.0.0.1:8000"; // change if your backend runs on a different port

loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  loginMessage.textContent = "";
  registerMessage.textContent = "";
});

registerTab.addEventListener("click", () => {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  loginMessage.textContent = "";
  registerMessage.textContent = "";
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.username);
      loginMessage.style.color = "#b6ff2e";
      loginMessage.textContent = "Login successful!";
      setTimeout(() => {
    window.location.href = "leaderboard.html";
  }, 1000); 

    } else {
      loginMessage.style.color = "#ff5dcf";
      loginMessage.textContent = data.error || "Login failed";
    }
  } catch (error) {
    loginMessage.style.color = "#ff5dcf";
    loginMessage.textContent = "Server error. Please try again.";
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  
  const email = document.getElementById("registerEmail").value.trim();
  const name = document.getElementById("registerName").value.trim();
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value;

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, name, username, password })
    });

    const data = await response.json();

    if (data.message) {
      registerMessage.style.color = "#00d4ff";
      registerMessage.textContent = data.message;
      registerForm.reset();

      // Switch to login after registration
      setTimeout(() => {
        loginTab.click();
      }, 1200);
    } else {
      registerMessage.style.color = "#ff5dcf";
      registerMessage.textContent = data.error || "Registration failed";
    }
  } catch (error) {
    registerMessage.style.color = "#ff5dcf";
    registerMessage.textContent = "Server error. Please try again.";
  }
});
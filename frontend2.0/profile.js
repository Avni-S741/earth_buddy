const API_BASE = "http://127.0.0.1:8000/profile";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

const token = localStorage.getItem("token");


if (!token) {
  window.location.href = "index.html";
}

const decoded = parseJwt(token);
const currentTime = Date.now() / 1000;

if (!decoded || decoded.exp < currentTime) {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// 🚀 Load profile
async function loadProfile() {
  try {
    const res = await fetch(API_BASE, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    document.getElementById("name").textContent = data.name;
    document.getElementById("username").textContent = "@" + data.username;
    document.getElementById("email").textContent = data.email;
    document.getElementById("points").textContent = data.total_points;

    
const badgeImages = {
  "Eco Initiate": "images/eco-initiate.png",
  "Green Guardian": "images/green-guardian.png",
  "Earth Defender": "images/earth-defender.png",
  "Planet Protector": "images/planet-protector.png"
};

const badgesDiv = document.getElementById("badgesList");
badgesDiv.innerHTML = data.badges.length
  ? data.badges
      .map(badge => {
        const src = badgeImages[badge] || "";
        return `<img src="${src}" alt="${badge}" title="${badge}" class="badge-icon" />`;
      })
      .join("")
  : "No badges yet";

    
    const tasksDiv = document.getElementById("tasksList");
    tasksDiv.innerHTML = data.completed_tasks.length
      ? data.completed_tasks.map(t => `
          <div class="task-item">
            ${t.title} (+${t.points})
          </div>
        `).join("")
      : "No tasks completed yet";

  } catch (err) {
    console.error(err);
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");

  window.location.href = "index.html";
}

loadProfile();
document.addEventListener("DOMContentLoaded", () => {
  const profileBtn = document.getElementById("profileBtn");
  if (profileBtn) {
    profileBtn.classList.add("active");
  }
});
const API_BASE = "http://127.0.0.1:8000";

const leaderboardBody = document.getElementById("leaderboardBody");
const topThreeCards = document.getElementById("topThreeCards");
const errorBox = document.getElementById("errorBox");
const refreshBtn = document.getElementById("refreshBtn");

const totalUsersEl = document.getElementById("totalUsers");
const topScoreEl = document.getElementById("topScore");
const yourRankEl = document.getElementById("yourRank");

function getToken() {
  return localStorage.getItem("token");
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function renderTopThree(leaderboard) {
  const topThree = leaderboard.slice(0, 3);

  const medals = ["🥇", "🥈", "🥉"];

  if (topThree.length === 0) {
    topThreeCards.innerHTML = `<div class="loading-card">No leaderboard data yet.</div>`;
    return;
  }

  topThreeCards.innerHTML = topThree.map((user, index) => `
    <article class="top-card">
      <div class="rank-pill">${medals[index] || `#${user.rank}`}</div>
      <h4>${user.username}</h4>
      <p class="points">${user.total_points} points</p>
      <div class="trophy">🌍</div>
    </article>
  `).join("");
}

function renderTable(leaderboard) {
  if (!leaderboard.length) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="3" class="loading-row">No users found yet.</td>
      </tr>
    `;
    return;
  }

  leaderboardBody.innerHTML = leaderboard.map(user => `
    <tr>
      <td class="rank-cell">#${user.rank}</td>
      <td class="username-cell">${user.username}</td>
      <td class="points-cell">${user.total_points}</td>
    </tr>
  `).join("");
}

async function loadLeaderboard() {
  clearError();

  const token = getToken();
  if (!token) {
    showError("You are not logged in. Please log in first.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/leaderboard/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    // --- EVERYTHING BELOW THIS LINE IS WHAT YOU ARE REPLACING ---
    const data = await response.json();
    const leaderboard = data.leaderboard || [];

    renderTopThree(leaderboard);
    renderTable(leaderboard);

    totalUsersEl.textContent = leaderboard.length;
    topScoreEl.textContent = leaderboard.length ? leaderboard[0].total_points : "0";

    // UPDATED: Case-insensitive search for your rank
    const username = localStorage.getItem("username");
    const me = leaderboard.find(user => 
        user.username.toLowerCase() === (username || "").toLowerCase()
    );
    yourRankEl.textContent = me ? `#${me.rank}` : "—";
    // --- END OF REPLACEMENT ---

  } catch (error) {
    console.error("Failed to load leaderboard:", error);
    showError("Could not load leaderboard. Please try again.");
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="3" class="loading-row">Failed to load leaderboard.</td>
      </tr>
    `;
  }
}




document.addEventListener("DOMContentLoaded", () => {
  const leaderboardBtn = document.getElementById("leaderboardBtn");
  if (leaderboardBtn) {
    leaderboardBtn.classList.add("active");
  }
  refreshBtn.addEventListener("click", loadLeaderboard);
  loadLeaderboard();
});
const API_BASE = "http://127.0.0.1:8000";

const leaderboardBody = document.getElementById("leaderboardBody");
const topThreeCards = document.getElementById("topThreeCards");

const totalUsersEl = document.getElementById("totalUsers");
const topScoreEl = document.getElementById("topScore");
const yourRankEl = document.getElementById("yourRank");

const errorBox = document.getElementById("errorBox");
const refreshBtn = document.getElementById("refreshBtn");

// 🔐 Get token (assuming you stored it after login)
const token = localStorage.getItem("token");

// 🚀 Fetch leaderboard
async function fetchLeaderboard() {
  try {
    errorBox.classList.add("hidden");

    const res = await fetch(`${API_BASE}/leaderboard/`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed to fetch leaderboard");

    const data = await res.json();
    const leaderboard = data.leaderboard;

    renderLeaderboard(leaderboard);
    renderTopThree(leaderboard);
    renderStats(leaderboard);

  } catch (err) {
    showError(err.message);
  }
}

// 📊 Render full table
function renderLeaderboard(data) {
  leaderboardBody.innerHTML = "";

  if (data.length === 0) {
    leaderboardBody.innerHTML =
      `<tr><td colspan="3">No data available</td></tr>`;
    return;
  }

  data.forEach(user => {

     let rowClass = "";
    if (user.username === currentUsername) {
      rowClass = "highlight-row";
    }
    
    const row = `
      <tr>
        <td class="rank-cell">#${user.rank}</td>
        <td class="username-cell">${user.username}</td>
        <td class="points-cell">${user.total_points}</td>
      </tr>
    `;
    leaderboardBody.innerHTML += row;
  });
}

// 🏆 Top 3 cards
function renderTopThree(data) {
  topThreeCards.innerHTML = "";

  const topThree = data.slice(0, 3);

  const trophies = ["🥇", "🥈", "🥉"];

  topThree.forEach((user, index) => {
    const card = `
      <div class="top-card">
        <div class="rank-pill">#${user.rank}</div>
        <h4>${user.username}</h4>
        <p class="points">${user.total_points} pts</p>
        <div class="trophy">${trophies[index]}</div>
      </div>
    `;
    topThreeCards.innerHTML += card;
  });
}

// 📈 Stats
function renderStats(data) {
  totalUsersEl.textContent = data.length;

  if (data.length > 0) {
    topScoreEl.textContent = data[0].total_points;
  }

  // 🧠 Find current user's rank
  const currentUsername = localStorage.getItem("username");

  const user = data.find(u => u.username === currentUsername);

  if (user) {
    yourRankEl.textContent = `#${user.rank}`;
  } else {
    yourRankEl.textContent = "—";
  }
}

// ❌ Error handler
function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

// 🔄 Refresh button
refreshBtn.addEventListener("click", fetchLeaderboard);

// 🚀 Initial load
fetchLeaderboard();
const API_BASE = "http://127.0.0.1:8000";

const leaderboardBody = document.getElementById("leaderboardBody");
const topThreeCards = document.getElementById("topThreeCards");

const totalUsersEl = document.getElementById("totalUsers");
const topScoreEl = document.getElementById("topScore");
const yourRankEl = document.getElementById("yourRank");

const errorBox = document.getElementById("errorBox");
const refreshBtn = document.getElementById("refreshBtn");


const token = localStorage.getItem("token");


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


function renderLeaderboard(data) {
    const currentUsername = localStorage.getItem("username");
    leaderboardBody.innerHTML = "";

    if (data.length === 0) {
        leaderboardBody.innerHTML = `<tr><td colspan="3">No data available</td></tr>`;
        return;
    }

    data.forEach(user => {
        const row = document.createElement("tr");
        
        
        const rankCell = document.createElement("td");
        rankCell.className = "rank-cell";
        rankCell.textContent = `#${user.rank}`;
        row.appendChild(rankCell);
        
        
        const usernameCell = document.createElement("td");
        usernameCell.className = "username-cell";
        usernameCell.textContent = user.username;
        row.appendChild(usernameCell);
        
        
        const pointsCell = document.createElement("td");
        pointsCell.className = "points-cell";
        pointsCell.textContent = user.total_points;
        row.appendChild(pointsCell);
        
        
        if (user.username === currentUsername) {
            row.style.backgroundColor = "rgba(182, 255, 46, 0.15)";
            row.style.borderLeft = "3px solid #b6ff2e";
        }
        
        leaderboardBody.appendChild(row);
    });
}


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


function renderStats(data) {
  totalUsersEl.textContent = data.length;

  if (data.length > 0) {
    topScoreEl.textContent = data[0].total_points;
  }

  
  const currentUsername = localStorage.getItem("username");

  const user = data.find(u => u.username === currentUsername);

  if (user) {
    yourRankEl.textContent = `#${user.rank}`;
  } else {
    yourRankEl.textContent = "—";
  }
}


function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}


refreshBtn.addEventListener("click", fetchLeaderboard);


fetchLeaderboard();
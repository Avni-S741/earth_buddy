const API_BASE = "http://127.0.0.1:8000";
const taskCount = document.getElementById("taskCount");

const token = localStorage.getItem("token");

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(taskId, message, type) {
  const statusEl = document.getElementById(`status-${taskId}`);
  if (!statusEl) return;
  statusEl.className = `status-chip ${type}`;
  statusEl.textContent = message;
}

function fileLabel(taskId, fileName) {
  const label = document.getElementById(`file-name-${taskId}`);
  if (label) label.textContent = fileName || "No file selected";
}

function isValidJpeg(file) {
  const nameOk = /\.(jpe?g)$/i.test(file.name);
  const typeOk = file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "";
  return nameOk && typeOk;
}

function renderTasks(tasks) {
  const tasksGrid = document.getElementById("tasksGrid");
  if (!tasksGrid) return;

  if (!tasks || tasks.length === 0) {
    tasksGrid.innerHTML = `<p class="loading-cell">No tasks found.</p>`;
    taskCount.textContent = "0 tasks";
    return;
  }

  taskCount.textContent = `${tasks.length} tasks`;

  tasksGrid.innerHTML = tasks.map(task => `
    <div class="task-card">
      <div class="card-header">
        <span class="category-chip">${escapeHtml(task.category)}</span>
        <span class="points-chip">+${escapeHtml(task.points)} pts</span>
      </div>
      <h4 class="card-title">${escapeHtml(task.title)}</h4>
      <p class="card-desc">${escapeHtml(task.description)}</p>
      <div class="card-actions">
        <div class="upload-area">
          <input
            type="file"
            id="file-${task.id}"
            accept=".jpg,.jpeg,image/jpeg"
            hidden
          />
          <button class="ghost-btn" data-action="choose" data-task-id="${task.id}">
            📷 Choose JPG/JPEG
          </button>
          <span class="file-name" id="file-name-${task.id}">No file selected</span>
        </div>
        <button class="action-btn" data-action="submit" data-task-id="${task.id}">
          🚀 Upload
        </button>
      </div>
      <div class="card-status">
        <span class="status-chip pending" id="status-${task.id}">Pending</span>
      </div>
    </div>
  `).join("");

  // Re‑attach event listeners (same logic as before)
  document.querySelectorAll('[data-action="choose"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const taskId = btn.getAttribute("data-task-id");
      document.getElementById(`file-${taskId}`).click();
    });
  });

  document.querySelectorAll('input[type="file"][id^="file-"]').forEach(input => {
    input.addEventListener("change", () => {
      const taskId = input.id.replace("file-", "");
      const file = input.files[0];
      if (!file) {
        fileLabel(taskId, "");
        return;
      }
      if (!isValidJpeg(file)) {
        input.value = "";
        fileLabel(taskId, "");
        alert("incorrect image format");
        return;
      }
      fileLabel(taskId, file.name);
      setStatus(taskId, "Ready to upload", "pending");
    });
  });

  document.querySelectorAll('[data-action="submit"]').forEach(btn => {
    btn.addEventListener("click", async () => {
      const taskId = btn.getAttribute("data-task-id");
      const fileInput = document.getElementById(`file-${taskId}`);
      const file = fileInput.files[0];

      if (!token) {
        setStatus(taskId, "Missing login token", "error");
        return;
      }
      if (!file) {
        setStatus(taskId, "Please choose a JPG/JPEG file", "error");
        return;
      }
      if (!isValidJpeg(file)) {
        setStatus(taskId, "Only JPG/JPEG allowed", "error");
        return;
      }

      const formData = new FormData();
      formData.append("task_id", taskId);
      formData.append("image", file);

      btn.disabled = true;
      const oldText = btn.textContent;
      btn.textContent = "Uploading...";

      try {
        const response = await fetch(`${API_BASE}/tasks/complete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Upload failed");
        }

        if (data.verified) {
          setStatus(taskId, `Verified +${data.points_earned} pts`, "success");
          alert(`congrats! points granted (+${data.points_earned} pts)`);
          // 🏆 Check for new badges
          if (data.new_badges && data.new_badges.length > 0) {
            data.new_badges.forEach(badge => {
              alert(`New badge unlocked: ${badge} !`);
            });
          }
        } else {
          setStatus(taskId, data.msg || "Rejected", "error");
          alert("invalid submission, AI verification failed");
        }
      } catch (err) {
        setStatus(taskId, err.message, "error");
      } finally {
        btn.disabled = false;
        btn.textContent = oldText;
      }
    });
  });
}

  document.querySelectorAll('[data-action="choose"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const taskId = btn.getAttribute("data-task-id");
      document.getElementById(`file-${taskId}`).click();
    });
  });

  document.querySelectorAll('input[type="file"][id^="file-"]').forEach(input => {
    input.addEventListener("change", () => {
      const taskId = input.id.replace("file-", "");
      const file = input.files[0];
      if (!file) {
        fileLabel(taskId, "");
        return;
      }

      if (!isValidJpeg(file)) {
        input.value = "";
        fileLabel(taskId, "");
         alert("Please select a valid JPG/JPEG file");
        return;
      }

      fileLabel(taskId, file.name);
      setStatus(taskId, "Ready to upload", "pending");
    });
  });

  document.querySelectorAll('[data-action="submit"]').forEach(btn => {
    btn.addEventListener("click", async () => {
      const taskId = btn.getAttribute("data-task-id");
      const fileInput = document.getElementById(`file-${taskId}`);
      const file = fileInput.files[0];

      if (!token) {
        setStatus(taskId, "Missing login token", "error");
        return;
      }

      if (!file) {
        setStatus(taskId, "Please choose a JPG/JPEG file", "error");
        return;
      }

      if (!isValidJpeg(file)) {
        setStatus(taskId, "Only JPG/JPEG allowed", "error");
        return;
      }

      const formData = new FormData();
      formData.append("task_id", taskId);
      formData.append("image", file);

      btn.disabled = true;
      const oldText = btn.textContent;
      btn.textContent = "Uploading...";

try {
    console.log("Sending request for task:", taskId);

    const response = await fetch(`${API_BASE}/tasks/complete`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    console.log("Response status:", response.status);

    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
        throw new Error(data.detail || data.msg || data.error || "Upload failed");
    }

    if (data.verified) {
        setStatus(taskId, `Verified +${data.points_earned} pts`, "success");
        alert("AI verification successful! Congrats!! points granted");
        // 🏆 Check for new badges
    if (data.new_badges && data.new_badges.length > 0) {
        data.new_badges.forEach(badge => {
            alert(`New badge unlocked: ${badge} !`);
        });
    } 
    } else {
        setStatus(taskId, data.msg || "Rejected", "error");
        alert("Invalid submission, AI verification failed");
    }

} catch (err) {
    console.error("Upload error:", err);
    setStatus(taskId, err.message, "error");
} finally {
    btn.disabled = false;
    btn.textContent = oldText;
}
    });   // closes addEventListener click callback
  });     // closes querySelectorAll forEach

       // closes renderTasks function

async function loadTasks() {
  if (!token) {
    tasksGrid.innerHTML = `<p class="loading-cell">Please log in to view tasks.</p>`;
    taskCount.textContent = "Login required";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/tasks/all`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to load tasks");
    }

    renderTasks(data.tasks || []);
  } catch (err) {
    tasksGrid.innerHTML = `<p class="loading-cell">${escapeHtml(err.message)}</p>`;
    taskCount.textContent = "Error";
  }
}

loadTasks();
    
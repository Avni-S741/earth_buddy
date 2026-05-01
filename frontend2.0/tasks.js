const API_BASE = "http://127.0.0.1:8000";
const tasksBody = document.getElementById("tasksBody");
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
  if (!tasks || tasks.length === 0) {
    tasksBody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-cell">No tasks found.</td>
      </tr>
    `;
    taskCount.textContent = "0 tasks";
    return;
  }

  taskCount.textContent = `${tasks.length} tasks`;

  tasksBody.innerHTML = tasks.map(task => `
    <tr>
      <td><span class="category-chip">${escapeHtml(task.category)}</span></td>
      <td><strong>${escapeHtml(task.title)}</strong></td>
      <td>${escapeHtml(task.description)}</td>
      <td><span class="points-chip">${escapeHtml(task.points)} pts</span></td>
      <td>
        <div class="upload-stack">
          <input
            type="file"
            id="file-${task.id}"
            accept=".jpg,.jpeg,image/jpeg"
            hidden
          />
          <button class="ghost-btn" data-action="choose" data-task-id="${task.id}">
            Choose JPG/JPEG
          </button>
          <span class="file-name" id="file-name-${task.id}">No file selected</span>
        </div>
      </td>
      <td>
        <button class="action-btn" data-action="submit" data-task-id="${task.id}">
          Upload
        </button>
      </td>
      <td>
        <span class="status-chip pending" id="status-${task.id}">Pending</span>
      </td>
    </tr>
  `).join("");

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
        setStatus(taskId, "Only JPG/JPEG allowed", "error");
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
  console.log("🚀 Sending request for task:", taskId);

  const response = await fetch(`${API_BASE}/tasks/complete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  console.log("✅ Response status:", response.status);

  const data = await response.json();
  console.log("📦 Response data:", data);

  if (!response.ok) {
    throw new Error(data.detail || data.msg || data.error || "Upload failed");
  }

  if (data.verified) {
    setStatus(taskId, `Verified +${data.points_earned} pts`, "success");
  } else {
    setStatus(taskId, data.msg || "Rejected", "error");
  }

} catch (err) {
  console.error("❌ Upload error:", err);
  setStatus(taskId, err.message, "error");
}
       finally {
        btn.disabled = false;
        btn.textContent = oldText;
      }
    });
  });
}

async function loadTasks() {
  if (!token) {
    tasksBody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-cell">Please log in to view tasks.</td>
      </tr>
    `;
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
    tasksBody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-cell">${escapeHtml(err.message)}</td>
      </tr>
    `;
    taskCount.textContent = "Error";
  }
}

loadTasks();
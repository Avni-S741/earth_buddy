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
  if (label) {
    label.textContent = fileName || "No file selected";
  }
}

function isValidJpeg(file) {
  const nameOk = /\.(jpe?g)$/i.test(file.name);

  const typeOk =
    file.type === "image/jpeg" ||
    file.type === "image/jpg" ||
    file.type === "";

  return nameOk && typeOk;
}


function renderTasks(tasks) {
  const tasksGrid = document.getElementById("tasksGrid");

  if (!tasksGrid) return;

  if (!tasks || tasks.length === 0) {
    tasksGrid.innerHTML = `
      <p class="loading-cell">No tasks found.</p>
    `;
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

      <p class="card-desc">
        ${escapeHtml(task.description)}
      </p>

      <div class="card-actions">

        <div class="upload-area">
          <input
            type="file"
            id="file-${task.id}"
            accept=".jpg,.jpeg,image/jpeg"
            hidden
          />

          <div
            type="button"
            class="ghost-btn"
            data-action="choose"
            data-task-id="${task.id}"
          >
            📷 Choose JPG/JPEG
          </div>

          <span
            class="file-name"
            id="file-name-${task.id}"
          >
            No file selected
          </span>
        </div>

          <div
            type="button"
            class="action-btn"
            data-action="submit"
            data-task-id="${task.id}"
        >
          🚀 Upload
        </div>

      </div>

      <div class="card-status">
        <span
          class="status-chip pending"
          id="status-${task.id}"
        >
          Pending
        </span>
      </div>

    </div>
  `).join("");

  
  document.querySelectorAll('[data-action="choose"]').forEach(btn => {

    btn.onclick = async (e) => {

      e.preventDefault();
      e.stopPropagation();
      const taskId = btn.getAttribute("data-task-id");

      document.getElementById(`file-${taskId}`).click();
    };

  });

  
  document
    .querySelectorAll('input[type="file"][id^="file-"]')
    .forEach(input => {

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

          alert("Only JPG/JPEG images are allowed.");

          return;
        }

        fileLabel(taskId, file.name);

        setStatus(taskId, "Ready to upload", "pending");

      });

    });

  
  document.querySelectorAll('[data-action="submit"]').forEach(btn => {

    btn.onclick = async (e) => {

      e.preventDefault();
      e.stopPropagation();

      console.log(e.target);
      console.log(e.currentTarget);

      console.log(
        e.currentTarget.closest("form")
      );

      const taskId = btn.getAttribute("data-task-id");

      const fileInput = document.getElementById(`file-${taskId}`);

      const file = fileInput.files[0];

      if (!token) {

        alert("Please login again.");

        setStatus(taskId, "Missing token", "error");

        return;
      }

      if (!file) {

        alert("Please select an image.");

        setStatus(taskId, "No file selected", "error");

        return;
      }

      if (!isValidJpeg(file)) {

        alert("Only JPG/JPEG images allowed.");

        setStatus(taskId, "Invalid image format", "error");

        return;
      }

      const formData = new FormData();

      formData.append("task_id", taskId);
      formData.append("image", file);

      btn.disabled = true;

      const oldText = btn.textContent;

      btn.textContent = "Uploading...";

      try {

        const response = await fetch(`${API_BASE}/tasks/complete/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        alert(`AI is verifying your image....`);
        const raw = await response.text();

        console.log("RAW RESPONSE:", raw);

        let data;

        try {
          data = JSON.parse(raw);
        } catch (jsonError) {

          console.error("JSON PARSE ERROR:", jsonError);

          throw new Error("Backend returned invalid JSON");
        }

        console.log("JSON PARSED:", data);

        if (!response.ok) {
          throw new Error(data.detail || data.msg || "Upload failed");
        }

        console.log("TYPE:", typeof data.verified, data.verified);
        
        if (String(data.verified) === "true" || data.verified === 1 || data.verified === true){

          setStatus(
            taskId,
            `Verified +${data.points_earned} pts`,
            "success"
          );
          alert(
            `🎉 Congrats! Points granted (+${data.points_earned} pts)`
          );

          if (data.new_badges && data.new_badges.length > 0) {

            data.new_badges.forEach(badge => {

              console.log("BADGE:", badge);

              alert(`🏆 New badge unlocked: ${badge}!`);
            });
          }

        } else {

          setStatus(
            taskId,
            data.msg || "Rejected",
            "error"
          );

          alert(
            data.msg || "Submission rejected."
          );
        }

      } catch (err) {

        console.error("UPLOAD ERROR:", err);

        setStatus(
          taskId,
          err.message || "Upload failed",
          "error"
        );

        alert("Upload error: " + err.message);

      } finally {

        btn.disabled = false;

        btn.textContent = oldText;
      }

    };

  });
}


async function loadTasks() {

  if (!token) {

    const tasksGrid = document.getElementById("tasksGrid");

    tasksGrid.innerHTML = `
      <p class="loading-cell">
        Please log in first.
      </p>
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

    console.error(err);

    const tasksGrid = document.getElementById("tasksGrid");

    tasksGrid.innerHTML = `
      <p class="loading-cell">
        ${escapeHtml(err.message)}
      </p>
    `;

    taskCount.textContent = "Error";
  }
}

loadTasks();
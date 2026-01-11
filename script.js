let entries = JSON.parse(localStorage.getItem("timesheetEntries")) || [];

/* ADD ENTRY */
function addEntry() {
  const date = document.getElementById("date").value;
  const task = document.getElementById("task").value;
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;

  if (!date || !task || !start || !end) {
    alert("Please fill all fields");
    return;
  }

  const startTime = new Date(`1970-01-01T${start}`);
  const endTime = new Date(`1970-01-01T${end}`);
  const hours = (endTime - startTime) / 3600000;

  if (hours <= 0) {
    alert("Invalid time range");
    return;
  }

  entries.push({
    id: Date.now(),
    date,
    task,
    start,
    end,
    hours: Number(hours)
  });

  localStorage.setItem("timesheetEntries", JSON.stringify(entries));
  renderTodayEntries();
  updateDashboard();

  document.getElementById("task").value = "";
  document.getElementById("start").value = "";
  document.getElementById("end").value = "";
}

/* DELETE ENTRY */
function deleteEntry(id) {
  if (!confirm("Delete this entry?")) return;

  entries = entries.filter(e => e.id !== id);
  localStorage.setItem("timesheetEntries", JSON.stringify(entries));

  renderTodayEntries();
  renderAllEntries();
  updateDashboard();
}

/* TODAY ENTRIES (ADD PAGE) */
function renderTodayEntries() {
  const list = document.getElementById("entryList");
  if (!list) return;

  const today = new Date().toISOString().split("T")[0];
  list.innerHTML = "";
  let total = 0;

  entries.filter(e => e.date === today).forEach(e => {
    total += e.hours;
    list.innerHTML += `
      <div class="entry">
        <strong>${e.task}</strong><br>
        ${e.start} – ${e.end} (${e.hours.toFixed(2)} hrs)
        <button onclick="deleteEntry(${e.id})">Delete</button>
      </div>`;
  });

  list.innerHTML += `<strong>Total Today: ${total.toFixed(2)} hrs</strong>`;
}

/* VIEW ALL */
function renderAllEntries() {
  const container = document.getElementById("entries");
  if (!container) return;

  container.innerHTML = "";
  entries.forEach(e => {
    container.innerHTML += `
      <div class="entry">
        <strong>${e.date}</strong> – ${e.task}<br>
        ${e.start} – ${e.end} (${e.hours.toFixed(2)} hrs)
        <button onclick="deleteEntry(${e.id})">Delete</button>
      </div>`;
  });
}

/* DASHBOARD TOTALS */
function updateDashboard() {
  const t = document.getElementById("todayHours");
  const w = document.getElementById("weekHours");
  const m = document.getElementById("monthHours");
  const y = document.getElementById("yearHours");

  if (!t || !w || !m || !y) return;

  let today = 0, week = 0, month = 0, year = 0;
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const weekStart = new Date(now);
  const day = weekStart.getDay() || 7;
  weekStart.setDate(weekStart.getDate() - day + 1);
  weekStart.setHours(0, 0, 0, 0);

  entries.forEach(e => {
    const hrs = Number(e.hours);
    if (!Number.isFinite(hrs)) return;

    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);

    if (e.date === todayStr) today += hrs;
    if (d >= weekStart) week += hrs;
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) month += hrs;
    if (d.getFullYear() === now.getFullYear()) year += hrs;
  });

  t.innerText = today.toFixed(2);
  w.innerText = week.toFixed(2);
  m.innerText = month.toFixed(2);
  y.innerText = year.toFixed(2);
}

/* AUTO LOAD */
window.onload = () => {
  updateDashboard();
  renderTodayEntries();
};


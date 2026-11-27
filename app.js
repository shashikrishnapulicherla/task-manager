const STORAGE_KEY = "task-manager.tasks";
let tasks = load();

const form = document.getElementById("task-form");
const idInput = document.getElementById("task-id");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");
const prioInput = document.getElementById("priority");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const filterSelect = document.getElementById("filter");
const list = document.getElementById("task-list");
const count = document.getElementById("count");

// ---------- Persistence ----------
function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

// ---------- CRUD ----------
function createTask(title, description, priority) {
  tasks.push({ id: Date.now().toString(), title, description, priority, done: false });
}
function updateTask(id, changes) {
  tasks = tasks.map(t => (t.id === id ? { ...t, ...changes } : t));
}
function deleteTask(id) { tasks = tasks.filter(t => t.id !== id); }

// ---------- Rendering ----------
const ORDER = { High: 0, Medium: 1, Low: 2 };

function render() {
  const f = filterSelect.value;
  const visible = tasks
    .filter(t => f === "All" || t.priority === f)
    .sort((a, b) => ORDER[a.priority] - ORDER[b.priority]);

  list.innerHTML = "";
  count.textContent = `${visible.length} task(s)`;
  if (!visible.length) {
    list.innerHTML = '<li class="empty">No tasks yet.</li>';
    return;
  }
  visible.forEach(t => {
    const li = document.createElement("li");
    li.className = `task ${t.priority}${t.done ? " done" : ""}`;

    const info = document.createElement("div");
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = t.title;
    const desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = t.description;
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = t.priority;
    info.append(title, desc, badge);

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(
      button(t.done ? "Undo" : "Done", "secondary", () => { updateTask(t.id, { done: !t.done }); save(); render(); }),
      button("Edit", "", () => startEdit(t)),
      button("Delete", "danger", () => { if (confirm("Delete this task?")) { deleteTask(t.id); save(); render(); } })
    );
    li.append(info, actions);
    list.appendChild(li);
  });
}

function button(label, cls, onClick) {
  const b = document.createElement("button");
  b.textContent = label;
  b.className = cls;
  b.addEventListener("click", onClick);
  return b;
}

// ---------- Form handling ----------
function startEdit(t) {
  idInput.value = t.id;
  titleInput.value = t.title;
  descInput.value = t.description;
  prioInput.value = t.priority;
  submitBtn.textContent = "Update Task";
  cancelBtn.hidden = false;
  titleInput.focus();
}
function resetForm() {
  form.reset();
  idInput.value = "";
  submitBtn.textContent = "Add Task";
  cancelBtn.hidden = true;
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  const data = { title, description: descInput.value.trim(), priority: prioInput.value };
  if (idInput.value) updateTask(idInput.value, data);
  else createTask(data.title, data.description, data.priority);
  save(); resetForm(); render();
});
cancelBtn.addEventListener("click", resetForm);
filterSelect.addEventListener("change", render);

render();
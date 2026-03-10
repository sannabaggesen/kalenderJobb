const state = {
  users: [],
  activeUserId: null,
  activeCalendarId: null,
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const userListEl = document.getElementById("userList");
const calendarTabsEl = document.getElementById("calendarTabs");
const weekGridEl = document.getElementById("weekGrid");
const calendarMetaEl = document.getElementById("calendarMeta");
const addUserBtn = document.getElementById("addUserBtn");
const addCalendarBtn = document.getElementById("addCalendarBtn");

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function getCurrentWeekStart() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekNumber(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

function addUser(name) {
  const user = {
    id: uid("user"),
    name,
    calendars: [],
  };

  state.users.push(user);
  state.activeUserId = user.id;
  addCalendar("Default Calendar", user.id);
  render();
}

function addCalendar(name, userId = state.activeUserId) {
  const user = state.users.find((entry) => entry.id === userId);
  if (!user) return;

  const calendar = {
    id: uid("cal"),
    name,
    weekStart: getCurrentWeekStart(),
  };

  user.calendars.push(calendar);
  state.activeUserId = user.id;
  state.activeCalendarId = calendar.id;
  render();
}

function selectUser(userId) {
  const user = state.users.find((entry) => entry.id === userId);
  if (!user) return;

  state.activeUserId = userId;
  state.activeCalendarId = user.calendars[0]?.id ?? null;
  render();
}

function selectCalendar(calendarId) {
  state.activeCalendarId = calendarId;
  render();
}

function renderUsers() {
  userListEl.innerHTML = "";

  if (!state.users.length) {
    const empty = document.createElement("li");
    empty.textContent = "No users yet. Add one to begin.";
    empty.className = "cell";
    userListEl.appendChild(empty);
    return;
  }

  state.users.forEach((user) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `user-item ${state.activeUserId === user.id ? "active" : ""}`;
    btn.textContent = `${user.name} (${user.calendars.length})`;
    btn.addEventListener("click", () => selectUser(user.id));
    li.appendChild(btn);
    userListEl.appendChild(li);
  });
}

function renderTabs(activeUser) {
  calendarTabsEl.innerHTML = "";

  if (!activeUser) {
    addCalendarBtn.disabled = true;
    return;
  }

  addCalendarBtn.disabled = false;

  activeUser.calendars.forEach((calendar) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.role = "tab";
    tab.className = `tab ${state.activeCalendarId === calendar.id ? "active" : ""}`;
    tab.textContent = calendar.name;
    tab.addEventListener("click", () => selectCalendar(calendar.id));
    calendarTabsEl.appendChild(tab);
  });
}

function renderWeek(calendar) {
  weekGridEl.innerHTML = "";

  if (!calendar) {
    calendarMetaEl.textContent = "Select a user and calendar to view a week.";
    return;
  }

  const start = new Date(calendar.weekStart);
  const weekNumber = getWeekNumber(start);

  calendarMetaEl.textContent = `Week ${weekNumber} • ${start.toLocaleDateString()} - ${new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + 6
  ).toLocaleDateString()}`;

  const emptyHeader = document.createElement("div");
  emptyHeader.className = "cell header empty";
  weekGridEl.appendChild(emptyHeader);

  for (let i = 0; i < 7; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);

    const headerCell = document.createElement("div");
    headerCell.className = "cell header";
    headerCell.innerHTML = `<div>${weekdays[i]}</div><div>${day.toLocaleDateString()}</div>`;
    weekGridEl.appendChild(headerCell);
  }

  for (let hour = 0; hour < 24; hour += 1) {
    const hourCell = document.createElement("div");
    hourCell.className = "cell time";
    hourCell.textContent = `${String(hour).padStart(2, "0")}:00`;
    weekGridEl.appendChild(hourCell);

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const slot = document.createElement("div");
      slot.className = "cell";
      weekGridEl.appendChild(slot);
    }
  }
}

function render() {
  const activeUser = state.users.find((entry) => entry.id === state.activeUserId) || null;

  if (activeUser && !activeUser.calendars.some((calendar) => calendar.id === state.activeCalendarId)) {
    state.activeCalendarId = activeUser.calendars[0]?.id ?? null;
  }

  const activeCalendar = activeUser?.calendars.find((calendar) => calendar.id === state.activeCalendarId) || null;

  renderUsers();
  renderTabs(activeUser);
  renderWeek(activeCalendar);
}

addUserBtn.addEventListener("click", () => {
  const name = window.prompt("Enter user name:");
  if (!name || !name.trim()) return;
  addUser(name.trim());
});

addCalendarBtn.addEventListener("click", () => {
  const name = window.prompt("Enter calendar name:");
  if (!name || !name.trim()) return;
  addCalendar(name.trim());
});

addUser("Alice");
addCalendar("Work", state.activeUserId);
addCalendar("Personal", state.activeUserId);
render();

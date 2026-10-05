/**
 * Application Controller
 * Handles priority calculation, view rendering, and state persistence.
 * Follows Apple Human Interface Guidelines: quiet, restrained, and accessible.
 */

// ----------------- State Keys -----------------
const STORAGE_KEYS = {
  TASKS: "yathin_apple_tasks_v3",
  SUBJECTS: "yathin_apple_subjects_v3",
  LEADS: "yathin_apple_leads_v3",
  CONTENT: "yathin_apple_content_v3",
  DISPUTES: "yathin_apple_disputes_v3"
};

let appState = {
  currentView: "focus",
  filter: "all",
  activeDay: "Monday",
  tasks: [],
  subjects: [],
  leads: [],
  content: [],
  disputes: []
};

// ----------------- Priority Calculation -----------------
function calculatePriorityScore(task) {
  if (task.status === "Done") return 0;

  let base = 10;
  if (task.priority === "P1") base = 100;
  else if (task.priority === "P2") base = 70;
  else if (task.priority === "P3") base = 40;

  const impactBonus = (parseInt(task.impact) || 3) * 5;

  let urgencyBonus = 0;
  if (task.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      urgencyBonus = 50; // Overdue
    } else if (diffDays === 0) {
      urgencyBonus = 40; // Today
    } else if (diffDays <= 2) {
      urgencyBonus = 25; // Imminent
    } else if (diffDays <= 7) {
      urgencyBonus = 10; // This week
    }
  }

  return base + impactBonus + urgencyBonus;
}

function getDueDateLabel(dateStr) {
  if (!dateStr) return { text: "", isUrgent: false, isOverdue: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Overdue by ${Math.abs(diffDays)}d`, isUrgent: true, isOverdue: true };
  } else if (diffDays === 0) {
    return { text: "Due today", isUrgent: true, isOverdue: false };
  } else if (diffDays === 1) {
    return { text: "Due tomorrow", isUrgent: false, isOverdue: false };
  } else if (diffDays <= 7) {
    return { text: `Due in ${diffDays} days`, isUrgent: false, isOverdue: false };
  } else {
    return { text: `Due ${dateStr}`, isUrgent: false, isOverdue: false };
  }
}

function getRelativeDate(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
}

// ----------------- Initialization -----------------
document.addEventListener("DOMContentLoaded", () => {
  loadStoredData();
  bindEvents();
  updateRhythmStatus();
  setInterval(updateRhythmStatus, 60000);
  renderCurrentView();
  updateBadges();
});

function loadStoredData() {
  const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
  appState.tasks = storedTasks ? JSON.parse(storedTasks) : (typeof DEFAULT_TASKS !== 'undefined' ? DEFAULT_TASKS : []);

  const storedSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  appState.subjects = storedSubjects ? JSON.parse(storedSubjects) : (typeof DEFAULT_SUBJECTS !== 'undefined' ? DEFAULT_SUBJECTS : []);

  const storedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
  appState.leads = storedLeads ? JSON.parse(storedLeads) : (typeof DEFAULT_LEADS !== 'undefined' ? DEFAULT_LEADS : []);

  const storedContent = localStorage.getItem(STORAGE_KEYS.CONTENT);
  appState.content = storedContent ? JSON.parse(storedContent) : (typeof DEFAULT_CONTENT !== 'undefined' ? DEFAULT_CONTENT : []);

  const storedDisputes = localStorage.getItem(STORAGE_KEYS.DISPUTES);
  appState.disputes = storedDisputes ? JSON.parse(storedDisputes) : (typeof DEFAULT_CR_DISPUTES !== 'undefined' ? DEFAULT_CR_DISPUTES : []);
}

function persistData(key) {
  if (key === "tasks" || !key) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(appState.tasks));
  if (key === "leads" || !key) localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(appState.leads));
  if (key === "content" || !key) localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(appState.content));
  if (key === "disputes" || !key) localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(appState.disputes));
  updateBadges();
}

// ----------------- Event Listeners -----------------
function bindEvents() {
  // Segmented control navigation
  document.querySelectorAll(".segment-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      switchView(view);
    });
  });

  // Modal sheet opening
  document.getElementById("openCaptureBtn").addEventListener("click", openCaptureSheet);

  // Global keybindings: 'C' to capture, 'Escape' to close
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") {
      if (e.key === "Escape") closeSheets();
      return;
    }

    if (e.key === "c" || e.key === "C") {
      e.preventDefault();
      openCaptureSheet();
    } else if (e.key === "Escape") {
      closeSheets();
    }
  });

  // Close sheet buttons
  document.getElementById("closeCaptureBtn").addEventListener("click", closeSheets);
  document.getElementById("cancelCaptureBtn").addEventListener("click", closeSheets);
  document.getElementById("closeAnnouncementBtn").addEventListener("click", closeSheets);
  document.getElementById("cancelAnnouncementBtn").addEventListener("click", closeSheets);

  // Form submission
  document.getElementById("captureForm").addEventListener("submit", handleCaptureSubmit);

  // Due date selector toggle
  document.getElementById("dueDateSelect").addEventListener("change", (e) => {
    const customInput = document.getElementById("customDueDate");
    if (e.target.value === "custom") {
      customInput.classList.remove("hidden");
      customInput.focus();
    } else {
      customInput.classList.add("hidden");
    }
  });

  // Announcement composer listeners
  bindAnnouncementComposer();
}

function switchView(viewName) {
  appState.currentView = viewName;

  document.querySelectorAll(".segment-btn").forEach(btn => {
    const isActive = btn.getAttribute("data-view") === viewName;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  renderCurrentView();
}

function openCaptureSheet() {
  const modal = document.getElementById("captureModal");
  modal.classList.remove("hidden");
  const input = document.getElementById("taskTitleInput");
  input.value = "";
  setTimeout(() => input.focus(), 50);
}

function closeSheets() {
  document.getElementById("captureModal").classList.add("hidden");
  document.getElementById("announcementModal").classList.add("hidden");
}

// ----------------- Day Rhythm Status -----------------
function updateRhythmStatus() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeNum = hours + minutes / 60;

  const rhythmStatus = document.getElementById("rhythmStatus");
  if (!rhythmStatus) return;

  if (timeNum < 8.5) {
    rhythmStatus.textContent = "Morning (Classes begin at 9:00)";
  } else if (timeNum >= 8.5 && timeNum < 9.0) {
    rhythmStatus.textContent = "Transit to College";
  } else if (timeNum >= 9.0 && timeNum < 13.25) {
    rhythmStatus.textContent = "Morning Lectures (9:00 – 13:15)";
  } else if (timeNum >= 13.25 && timeNum < 14.0) {
    rhythmStatus.textContent = "Lunch Break";
  } else if (timeNum >= 14.0 && timeNum < 16.5) {
    rhythmStatus.textContent = "Lab Session (14:00 – 16:30)";
  } else if (timeNum >= 16.5 && timeNum < 18.0) {
    rhythmStatus.textContent = "Transit & Personal Time";
  } else {
    rhythmStatus.textContent = "Evening Work Window";
  }
}

// ----------------- Badges -----------------
function updateBadges() {
  const activeFocus = appState.tasks.filter(t => t.status === "Next" || t.status === "In Progress").length;
  const activeInbox = appState.tasks.filter(t => t.status === "Inbox").length;
  const crPending = appState.tasks.filter(t => t.area === "CR" && t.status !== "Done").length;

  document.getElementById("focusBadge").textContent = activeFocus;
  document.getElementById("inboxBadge").textContent = activeInbox;
  document.getElementById("crBadge").textContent = crPending;
}

// ----------------- View Rendering -----------------
function renderCurrentView() {
  const container = document.getElementById("viewContainer");
  container.innerHTML = "";

  switch (appState.currentView) {
    case "focus":
      renderFocusView(container);
      break;
    case "inbox":
      renderInboxView(container);
      break;
    case "academics":
      renderAcademicsView(container);
      break;
    case "cr":
      renderCRView(container);
      break;
    case "business":
      renderBusinessView(container);
      break;
    case "schedule":
      renderScheduleView(container);
      break;
    default:
      renderFocusView(container);
  }
}

// 1. FOCUS VIEW
function renderFocusView(container) {
  const section = document.createElement("section");
  section.className = "view-section active";

  let tasks = appState.tasks.filter(t => t.status === "Next" || t.status === "In Progress");

  if (appState.filter === "college") tasks = tasks.filter(t => t.area === "College");
  else if (appState.filter === "cr") tasks = tasks.filter(t => t.area === "CR");
  else if (appState.filter === "business") tasks = tasks.filter(t => t.area === "Business");
  else if (appState.filter === "personal") tasks = tasks.filter(t => t.area === "Personal");

  tasks.sort((a, b) => calculatePriorityScore(b) - calculatePriorityScore(a));

  section.innerHTML = `
    <div class="view-header">
      <div>
        <h2 class="view-title">Focus</h2>
        <p class="view-subtitle">Active priorities organized by urgency and impact</p>
      </div>
    </div>

    <div class="subfilter-bar">
      <button class="subfilter-btn ${appState.filter === 'all' ? 'active' : ''}" data-filter="all">All</button>
      <button class="subfilter-btn ${appState.filter === 'college' ? 'active' : ''}" data-filter="college">Academics</button>
      <button class="subfilter-btn ${appState.filter === 'cr' ? 'active' : ''}" data-filter="cr">Representative</button>
      <button class="subfilter-btn ${appState.filter === 'business' ? 'active' : ''}" data-filter="business">Business</button>
      <button class="subfilter-btn ${appState.filter === 'personal' ? 'active' : ''}" data-filter="personal">Personal</button>
    </div>

    <div id="focusTaskList"></div>
  `;

  container.appendChild(section);

  const listContainer = section.querySelector("#focusTaskList");
  if (tasks.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-state-title">No Active Tasks</h3>
        <p class="empty-state-text">Your focus queue is clear. Capture a new item or review your inbox.</p>
        <button class="btn btn-secondary btn-sm" id="emptyCaptureBtn">Add Task</button>
      </div>
    `;
    listContainer.querySelector("#emptyCaptureBtn").addEventListener("click", openCaptureSheet);
  } else {
    const listGroup = document.createElement("div");
    listGroup.className = "grouped-list";
    tasks.forEach(t => listGroup.appendChild(createTaskRow(t)));
    listContainer.appendChild(listGroup);
  }

  section.querySelectorAll(".subfilter-btn").forEach(b => {
    b.addEventListener("click", () => {
      appState.filter = b.getAttribute("data-filter");
      renderFocusView(container);
    });
  });
}

// 2. INBOX VIEW
function renderInboxView(container) {
  const section = document.createElement("section");
  section.className = "view-section active";

  const inboxTasks = appState.tasks.filter(t => t.status === "Inbox");

  section.innerHTML = `
    <div class="view-header">
      <div>
        <h2 class="view-title">Inbox</h2>
        <p class="view-subtitle">Captured thoughts and requests awaiting prioritization</p>
      </div>
    </div>

    <div id="inboxTaskList"></div>
  `;

  container.appendChild(section);

  const listContainer = section.querySelector("#inboxTaskList");
  if (inboxTasks.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-state-title">Inbox is Empty</h3>
        <p class="empty-state-text">All captured items have been assigned to focus or completed.</p>
      </div>
    `;
  } else {
    const listGroup = document.createElement("div");
    listGroup.className = "grouped-list";
    inboxTasks.forEach(t => listGroup.appendChild(createTaskRow(t)));
    listContainer.appendChild(listGroup);
  }
}

// 3. ACADEMICS VIEW
function renderAcademicsView(container) {
  const section = document.createElement("section");
  section.className = "view-section active";

  const academicTasks = appState.tasks.filter(t => t.area === "College" && t.status !== "Done");

  section.innerHTML = `
    <div class="view-header">
      <div>
        <h2 class="view-title">Academics</h2>
        <p class="view-subtitle">Computer Science & Engineering · Semester 3</p>
      </div>
      <button class="btn btn-secondary btn-sm" id="addAcademicTaskBtn">Add Academic Task</button>
    </div>

    ${academicTasks.length > 0 ? `
      <div style="margin-bottom: var(--space-24);">
        <h3 style="font-size: var(--text-footnote); font-weight: 600; color: var(--system-label-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-8);">
          Pending Deliverables (${academicTasks.length})
        </h3>
        <div class="grouped-list" id="academicListGroup"></div>
      </div>
    ` : ''}

    <h3 style="font-size: var(--text-footnote); font-weight: 600; color: var(--system-label-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-8);">
      Subjects & Faculty
    </h3>
    <div class="academics-grid" id="subjectsGrid"></div>
  `;

  container.appendChild(section);

  if (academicTasks.length > 0) {
    const academicListGroup = section.querySelector("#academicListGroup");
    academicTasks.forEach(t => academicListGroup.appendChild(createTaskRow(t)));
  }

  const subjectsGrid = section.querySelector("#subjectsGrid");
  appState.subjects.forEach(sub => {
    const cell = document.createElement("div");
    cell.className = "subject-cell";
    cell.innerHTML = `
      <div>
        <span class="subject-code">${escapeHtml(sub.code)} · ${escapeHtml(sub.type)} (${sub.credits} Credits)</span>
        <h4 class="subject-name">${escapeHtml(sub.name)}</h4>
        <p class="subject-faculty">${escapeHtml(sub.faculty)}</p>
      </div>
      <div class="subject-footer">
        <a href="${escapeHtml(sub.classroomLink)}" target="_blank" rel="noopener" class="link-subtle">
          Google Classroom ↗
        </a>
        <button class="btn btn-ghost btn-sm add-subject-task-btn" data-subject="${escapeHtml(sub.name)}">
          + Task
        </button>
      </div>
    `;
    subjectsGrid.appendChild(cell);
  });

  section.querySelector("#addAcademicTaskBtn").addEventListener("click", () => {
    openCaptureSheet();
    document.getElementById("areaSelect").value = "College";
  });

  section.querySelectorAll(".add-subject-task-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const subName = btn.getAttribute("data-subject");
      openCaptureSheet();
      document.getElementById("taskTitleInput").value = `${subName}: `;
      document.getElementById("areaSelect").value = "College";
    });
  });
}

// 4. CLASS REPRESENTATIVE VIEW
function renderCRView(container) {
  const section = document.createElement("section");
  section.className = "view-section active";

  const crTasks = appState.tasks.filter(t => t.area === "CR" && t.status !== "Done");

  section.innerHTML = `
    <div class="view-header">
      <div>
        <h2 class="view-title">Class Representative</h2>
        <p class="view-subtitle">Class communications, assignment books, and office coordination</p>
      </div>
      <button class="btn btn-primary btn-sm" id="openNoticeFormatterBtn">Notice Formatter</button>
    </div>

    <div style="margin-bottom: var(--space-24);">
      <h3 style="font-size: var(--text-footnote); font-weight: 600; color: var(--system-label-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-8);">
        Representative Tasks (${crTasks.length})
      </h3>
      <div id="crTaskList"></div>
    </div>
  `;

  container.appendChild(section);

  const crList = section.querySelector("#crTaskList");
  if (crTasks.length === 0) {
    crList.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-state-title">No Pending Representative Tasks</h3>
        <p class="empty-state-text">All blue/yellow book errands and class notices are handled.</p>
      </div>
    `;
  } else {
    const listGroup = document.createElement("div");
    listGroup.className = "grouped-list";
    crTasks.forEach(t => listGroup.appendChild(createTaskRow(t)));
    crList.appendChild(listGroup);
  }

  section.querySelector("#openNoticeFormatterBtn").addEventListener("click", () => {
    document.getElementById("announcementModal").classList.remove("hidden");
  });
}

// 5. BUSINESS & PROJECTS VIEW
function renderBusinessView(container) {
  const section = document.createElement("section");
  section.className = "view-section active";

  const businessTasks = appState.tasks.filter(t => (t.area === "Business" || t.area === "Content") && t.status !== "Done");

  section.innerHTML = `
    <div class="view-header">
      <div>
        <h2 class="view-title">Projects & Business</h2>
        <p class="view-subtitle">Website client outreach and digital media projects</p>
      </div>
      <button class="btn btn-secondary btn-sm" id="addProjectTaskBtn">Add Project Task</button>
    </div>

    <div style="margin-bottom: var(--space-24);">
      <h3 style="font-size: var(--text-footnote); font-weight: 600; color: var(--system-label-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-8);">
        Active Project Deliverables (${businessTasks.length})
      </h3>
      <div id="projectTaskList"></div>
    </div>

    <div class="empty-state" style="margin-top: var(--space-16);">
      <h3 class="empty-state-title">No External Client Contracts Recorded</h3>
      <p class="empty-state-text">You have not logged active client contracts or external invoices. Tasks can be tagged as Business in New Task.</p>
    </div>
  `;

  container.appendChild(section);

  const taskList = section.querySelector("#projectTaskList");
  if (businessTasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-state-title">No Project Tasks</h3>
        <p class="empty-state-text">No active business or media tasks found.</p>
      </div>
    `;
  } else {
    const listGroup = document.createElement("div");
    listGroup.className = "grouped-list";
    businessTasks.forEach(t => listGroup.appendChild(createTaskRow(t)));
    taskList.appendChild(listGroup);
  }

  section.querySelector("#addProjectTaskBtn").addEventListener("click", () => {
    openCaptureSheet();
    document.getElementById("areaSelect").value = "Business";
  });
}

// 6. SCHEDULE TIMETABLE VIEW
function renderScheduleView(container) {
  const section = document.createElement("section");
  section.className = "view-section active";

  section.innerHTML = `
    <div class="view-header">
      <div>
        <h2 class="view-title">Schedule</h2>
        <p class="view-subtitle">Weekly timetable for CSE Semester 3 (Classes start at 9:00)</p>
      </div>
    </div>

    <div class="day-selector-row">
      ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => `
        <button class="day-tab-btn ${appState.activeDay === day ? 'active' : ''}" data-day="${day}">${day}</button>
      `).join('')}
    </div>

    <div class="grouped-list" id="scheduleListContainer"></div>
  `;

  container.appendChild(section);

  section.querySelectorAll(".day-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      appState.activeDay = btn.getAttribute("data-day");
      renderScheduleView(container);
    });
  });

  const scheduleContainer = section.querySelector("#scheduleListContainer");
  const daySchedule = DEFAULT_TIMETABLE.find(d => d.day === appState.activeDay);

  if (daySchedule && daySchedule.slots) {
    daySchedule.slots.forEach(slot => {
      const row = document.createElement("div");
      row.className = "schedule-row";
      row.innerHTML = `
        <span class="schedule-time">${escapeHtml(slot.time)}</span>
        <div class="schedule-details">
          <div class="schedule-title">${escapeHtml(slot.subject)}</div>
          ${slot.faculty ? `<div class="schedule-faculty">${escapeHtml(slot.faculty)}</div>` : ''}
        </div>
        <span class="badge badge-neutral">${escapeHtml(slot.type)}</span>
      `;
      scheduleContainer.appendChild(row);
    });
  }
}

// ----------------- Inset Grouped Task Row Component -----------------
function createTaskRow(task) {
  const row = document.createElement("div");
  row.className = `list-item ${task.status === 'Done' ? 'is-done' : ''}`;

  const dueInfo = getDueDateLabel(task.dueDate);
  const priorityClass = `badge-${task.priority.toLowerCase()}`;

  row.innerHTML = `
    <div class="list-item-main">
      <button class="check-button" title="Toggle status" aria-label="Mark completed">
        ${task.status === 'Done' ? '✓' : ''}
      </button>

      <div class="item-content">
        <div class="item-title" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</div>
        <div class="item-metadata">
          <span class="badge ${priorityClass}">${escapeHtml(task.priority)}</span>
          <span class="badge badge-neutral">${escapeHtml(task.area || 'General')}</span>
          ${task.dueDate ? `
            <span class="due-label ${dueInfo.isUrgent ? 'is-urgent' : ''}">
              ${escapeHtml(dueInfo.text)}
            </span>
          ` : ''}
          <span style="color: var(--system-label-tertiary);">${escapeHtml(task.effort || '')}</span>
        </div>
      </div>
    </div>

    <div class="item-actions">
      <button class="status-button" title="Change status">
        ${escapeHtml(task.status)}
      </button>
      <button class="btn btn-ghost btn-sm delete-btn" title="Delete" style="padding: 2px 6px;">✕</button>
    </div>
  `;

  // Toggle done
  row.querySelector(".check-button").addEventListener("click", () => {
    task.status = (task.status === "Done") ? "Next" : "Done";
    persistData("tasks");
    renderCurrentView();
  });

  // Cycle status
  row.querySelector(".status-button").addEventListener("click", () => {
    const sequence = ["Next", "In Progress", "Inbox", "Done"];
    const idx = sequence.indexOf(task.status);
    task.status = sequence[(idx + 1) % sequence.length];
    persistData("tasks");
    renderCurrentView();
  });

  // Delete
  row.querySelector(".delete-btn").addEventListener("click", () => {
    appState.tasks = appState.tasks.filter(t => t.id !== task.id);
    persistData("tasks");
    showToast("Task deleted");
    renderCurrentView();
  });

  return row;
}

// ----------------- Capture Form Handler -----------------
function handleCaptureSubmit(e) {
  e.preventDefault();
  const input = document.getElementById("taskTitleInput");
  const title = input.value.trim();
  if (!title) return;

  const priority = document.getElementById("prioritySelect").value;
  const area = document.getElementById("areaSelect").value;
  const dueSelect = document.getElementById("dueDateSelect").value;
  const effort = document.getElementById("effortSelect").value;
  const destination = document.getElementById("destinationSelect").value;

  let dueDate = null;
  if (dueSelect === "today") dueDate = getRelativeDate(0);
  else if (dueSelect === "tomorrow") dueDate = getRelativeDate(1);
  else if (dueSelect === "weekend") dueDate = getRelativeDate(4);
  else if (dueSelect === "nextweek") dueDate = getRelativeDate(7);
  else if (dueSelect === "custom") {
    dueDate = document.getElementById("customDueDate").value || getRelativeDate(1);
  }

  const newTask = {
    id: "task-" + Date.now(),
    title: title,
    priority: priority,
    area: area,
    status: destination,
    effort: effort,
    dueDate: dueDate,
    impact: 3
  };

  appState.tasks.unshift(newTask);
  persistData("tasks");
  closeSheets();
  showToast("Task added");
  renderCurrentView();
}

// ----------------- Notice Composer -----------------
function bindAnnouncementComposer() {
  const topicInput = document.getElementById("announcementTopic");
  const sourceInput = document.getElementById("announcementSource");
  const deadlineInput = document.getElementById("announcementDeadline");
  const rawNotesInput = document.getElementById("announcementRawNotes");
  const previewBox = document.getElementById("whatsappPreviewBox");
  const copyBtn = document.getElementById("copyWhatsAppBtn");

  const updatePreview = () => {
    const topic = topicInput.value.trim() || "CLASS NOTICE";
    const source = sourceInput.value;
    const deadline = deadlineInput.value.trim();
    const notes = rawNotesInput.value.trim();

    let text = `CSE Semester 3 · Notice\n\n`;
    text += `Topic: ${topic}\n`;
    text += `Faculty / Source: ${source}\n`;
    if (deadline) {
      text += `Deadline: ${deadline}\n`;
    }
    text += `\nInstructions:\n`;
    text += notes ? `${notes}\n\n` : `Please ensure required records and submissions are completed on schedule.\n\n`;
    text += `— Yathin (Class Representative)`;

    previewBox.textContent = text;
  };

  [topicInput, sourceInput, deadlineInput, rawNotesInput].forEach(el => {
    el.addEventListener("input", updatePreview);
  });
  updatePreview();

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(previewBox.textContent).then(() => {
      showToast("Notice copied to clipboard");
    });
  });
}

// ----------------- Understated Toast -----------------
function showToast(message) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.2s ease-out";
    setTimeout(() => toast.remove(), 200);
  }, 2000);
}

// ----------------- Helper: HTML Escaping -----------------
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

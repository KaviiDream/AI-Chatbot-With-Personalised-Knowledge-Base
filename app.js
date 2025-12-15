const resourceData = [
    { subject: "Mathematics", title: "Quadratic Mastery Pack", type: "Worksheet", duration: "2 hrs", description: "20 exam-style problems with annotated solutions." },
    { subject: "Science", title: "Biology Diagrams Clinic", type: "Video", duration: "45 min", description: "Visual walkthrough of labelling techniques for plant and human systems." },
    { subject: "English", title: "Essay Hooks Toolkit", type: "Guide", duration: "30 min", description: "Sentence starters and cohesive device drills." },
    { subject: "History", title: "Sri Lankan Timeline Flashcards", type: "Flashcards", duration: "25 min", description: "Rapid recall of key dates from 1505 onwards." },
    { subject: "Commerce", title: "Bookkeeping Speed Drills", type: "Worksheet", duration: "50 min", description: "Ledger balancing with timed prompts." },
    { subject: "ICT", title: "Logic Gate Sandbox", type: "Interactive", duration: "40 min", description: "Practice building truth tables under time pressure." },
    { subject: "Science", title: "Chemistry Equation Lab", type: "Worksheet", duration: "60 min", description: "Balancing exercises and practical hints." }
];

const sprintIdeas = [
    "Recall Sinhala poetry terms for 10 minutes, write a micro-summary, then self-quiz with two past questions.",
    "20 minutes of algebra simplification followed by a 5-question timed drill.",
    "Sketch the digestive system from memory, label, then review with textbook diagrams.",
    "Write a 150-word English essay introduction using a news article as prompt.",
    "Complete a Commerce balancing question, then explain your steps out loud.",
    "Practice ICT pseudocode problems and check against solutions."
];

const quotes = [
    '"Small wins are still wins."',
    '"Consistency beats intensity."',
    '"Trust the process, track the hours."',
    '"Revision is reflection plus correction."'
];

const timelineSteps = [
    "Complete syllabus overview",
    "Finish first round of notes",
    "Attempt 3 full past papers",
    "Conduct error analysis",
    "Final 2-week revision sprint"
];

const API_BASE_URL = window.__OL_API_BASE_URL__ || "http://localhost:4000/api";
const USER_ID = "default-user";
const MAX_SNAPSHOT_ITEMS = 5;
const fallbackSnapshots = [
    { subject: "Mathematics", topic: "Past paper drills", hours: 6 },
    { subject: "Science", topic: "Diagrams & labelling", hours: 4 },
    { subject: "English", topic: "Essay practice", hours: 3 }
];
const defaultTimelineState = timelineSteps.map(step => ({ step, completed: false }));

const weeklyGoal = 20;

let plannerState = {
    loggedHours: 0,
    weeklyGoal,
    snapshots: [],
    lastPlan: null
};

let toolsState = {
    timeline: defaultTimelineState.map(item => ({ ...item }))
};

const resourceGrid = document.getElementById("resourceGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const sprintOutput = document.getElementById("sprintOutput");
const sprintButton = document.getElementById("sprintButton");
const mindsetQuote = document.getElementById("mindsetQuote");
const quoteButton = document.getElementById("quoteButton");
const timelineEl = document.getElementById("timeline");
const timelineFill = document.getElementById("timelineFill");
const snapList = document.getElementById("snapshotList");
const hoursLoggedEl = document.getElementById("hoursLogged");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const logButton = document.getElementById("logButton");
const logHoursInput = document.getElementById("logHours");
const form = document.getElementById("studyForm");
const planResult = document.getElementById("planResult");
const themeToggle = document.getElementById("themeToggle");
const themeToggleIcon = document.getElementById("themeToggleIcon");
const rootElement = document.documentElement;
const THEME_STORAGE_KEY = "ol-theme";

function updateThemeToggleIcon(theme) {
    if (!themeToggle || !themeToggleIcon) {
        return;
    }
    const isDark = theme === "dark";
    themeToggleIcon.textContent = isDark ? "☾" : "☀";
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

function syncChatbotTheme(theme) {
    const script = document.getElementById("uBz514QKNAzhlYwxpJ_ev");
    if (script) {
        script.setAttribute("data-theme", theme);
    }
    document.querySelectorAll("#chatbase-bubble-button, #chatbase-message-window").forEach(node => {
        node.setAttribute("data-theme", theme);
    });
    if (typeof window.chatbase === "function") {
        try {
            window.chatbase("setTheme", theme);
        } catch (error) {
            // Ignore theme sync errors from the chatbot SDK.
        }
    }
}

function applyTheme(theme) {
    rootElement.dataset.theme = theme;
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        // Storage might be unavailable; fail silently.
    }
    updateThemeToggleIcon(theme);
    syncChatbotTheme(theme);
    window.dispatchEvent(new CustomEvent("ol-theme-change", { detail: theme }));
}

const initialTheme = rootElement.dataset.theme || "dark";
updateThemeToggleIcon(initialTheme);
syncChatbotTheme(initialTheme);

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const nextTheme = (rootElement.dataset.theme || "dark") === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
    });
}

if (window.MutationObserver) {
    const chatbotObserver = new MutationObserver((_, observer) => {
        const bubble = document.getElementById("chatbase-bubble-button");
        const panel = document.getElementById("chatbase-message-window");
        if (bubble || panel) {
            syncChatbotTheme(rootElement.dataset.theme || "dark");
            observer.disconnect();
        }
    });
    chatbotObserver.observe(document.body, { childList: true, subtree: true });
}

function clampHours(value) {
    if (!Number.isFinite(Number(value))) {
        return 0;
    }
    return Math.max(0, Math.min(Number(value), 200));
}

function getConfidenceAdvice(confidence = "Medium") {
    const normalized = (confidence || "Medium").toLowerCase();
    if (normalized === "low") {
        return "Confidence low → add extra recap day.";
    }
    if (normalized === "medium") {
        return "Confidence medium → close with a timed drill.";
    }
    return "Confidence high → turn last session into teaching.";
}

function renderPlan(plan) {
    if (!planResult) {
        return;
    }
    if (!plan) {
        planResult.innerHTML = `
            <p>Fill in the form to get a personalised routine.</p>
        `;
        return;
    }
    const hours = clampHours(plan.hours);
    const sessions = Math.max(2, Math.ceil(hours / 2));
    const minutes = sessions ? Math.round((hours * 60) / sessions) : 0;
    planResult.innerHTML = `
        <p><strong>${plan.subject}</strong> · ${plan.topic}</p>
        <ul>
            <li>Break it into ${sessions} sessions of ${minutes} minutes.</li>
            <li>Start with 10-minute recall, then deep practice, end with reflection.</li>
            <li>${getConfidenceAdvice(plan.confidence)}</li>
        </ul>
    `;
}

function renderSnapshots(list) {
    if (!snapList) {
        return;
    }
    const source = list && list.length ? list : fallbackSnapshots;
    snapList.innerHTML = "";
    source.slice(0, MAX_SNAPSHOT_ITEMS).forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.subject} · ${item.topic} · ${item.hours} hrs`;
        snapList.appendChild(li);
    });
}

function addSnapshot(snapshot) {
    if (!snapshot) {
        return;
    }
    const clean = {
        subject: snapshot.subject || "General",
        topic: snapshot.topic || "Focus area",
        hours: clampHours(snapshot.hours)
    };
    plannerState.snapshots = [clean, ...plannerState.snapshots].slice(0, MAX_SNAPSHOT_ITEMS);
    renderSnapshots(plannerState.snapshots);
}

function hydratePlannerFromState() {
    updateProgress();
    renderSnapshots(plannerState.snapshots);
    renderPlan(plannerState.lastPlan);
}

function renderTimeline() {
    if (!timelineEl) {
        return;
    }
    timelineEl.innerHTML = "";
    toolsState.timeline.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <label>
                <input type="checkbox" data-index="${index}" />
                <span>${item.step}</span>
            </label>
        `;
        const checkbox = li.querySelector("input");
        checkbox.checked = Boolean(item.completed);
        timelineEl.appendChild(li);
    });
}

function applyRemotePlannerState(remote = {}) {
    if (!remote) {
        hydratePlannerFromState();
        return;
    }
    if (Number.isFinite(Number(remote.loggedHours))) {
        plannerState.loggedHours = clampHours(remote.loggedHours);
    }
    if (Number.isFinite(Number(remote.weeklyGoal)) && Number(remote.weeklyGoal) > 0) {
        plannerState.weeklyGoal = Math.max(1, Math.min(Number(remote.weeklyGoal), 200));
    }
    if (Array.isArray(remote.snapshots)) {
        plannerState.snapshots = remote.snapshots.slice(0, MAX_SNAPSHOT_ITEMS);
    }
    if (remote.lastPlan) {
        plannerState.lastPlan = remote.lastPlan;
    }
    hydratePlannerFromState();
}

function applyRemoteToolsState(remote = {}) {
    const incoming = Array.isArray(remote.timeline) ? remote.timeline : [];
    toolsState.timeline = defaultTimelineState.map(item => {
        const match = incoming.find(entry => entry.step === item.step);
        return {
            step: item.step,
            completed: match ? Boolean(match.completed) : false
        };
    });
    renderTimeline();
    refreshTimelineProgress();
}

async function bootstrapRemoteState() {
    if (typeof fetch !== "function") {
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/state/${USER_ID}`);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const payload = await response.json();
        if (payload.planner) {
            applyRemotePlannerState(payload.planner);
        }
        if (payload.tools) {
            applyRemoteToolsState(payload.tools);
        }
    } catch (error) {
        console.warn("State sync unavailable:", error.message);
    }
}

async function persistPlannerState() {
    if (typeof fetch !== "function") {
        return;
    }
    try {
        await fetch(`${API_BASE_URL}/state/${USER_ID}/planner`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                loggedHours: plannerState.loggedHours,
                weeklyGoal: plannerState.weeklyGoal,
                snapshots: plannerState.snapshots,
                lastPlan: plannerState.lastPlan
            })
        });
    } catch (error) {
        console.warn("Unable to save planner state:", error.message);
    }
}

async function persistToolsState() {
    if (typeof fetch !== "function") {
        return;
    }
    try {
        await fetch(`${API_BASE_URL}/state/${USER_ID}/tools`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                timeline: toolsState.timeline
            })
        });
    } catch (error) {
        console.warn("Unable to save tools state:", error.message);
    }
}

function renderResources(filterSubject = "All") {
    if (!resourceGrid) {
        return;
    }
    resourceGrid.innerHTML = "";
    resourceData
        .filter(item => filterSubject === "All" || item.subject === filterSubject)
        .forEach(item => {
            const card = document.createElement("article");
            card.className = "resource-card";
            card.innerHTML = `
                <div class="resource-meta">
                    <span class="pill">${item.subject}</span>
                    <span class="pill muted">${item.type}</span>
                </div>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
                <small>${item.duration}</small>
            `;
            resourceGrid.appendChild(card);
        });
}

if (resourceGrid) {
    renderResources();
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderResources(btn.dataset.subject);
        });
    });
}
hydratePlannerFromState();

function updateProgress() {
    if (!progressFill || !progressLabel) {
        return;
    }
    const goal = Math.max(1, plannerState.weeklyGoal || weeklyGoal);
    const loggedHours = Math.min(clampHours(plannerState.loggedHours), goal);
    const percentage = Math.min((loggedHours / goal) * 100, 100);
    progressFill.style.width = `${percentage}%`;
    progressLabel.textContent = `${loggedHours} / ${goal} hrs`;
    if (hoursLoggedEl) {
        hoursLoggedEl.textContent = loggedHours.toString().padStart(2, "0");
    }
}

if (progressFill && progressLabel && logButton && logHoursInput) {
    updateProgress();
    logButton.addEventListener("click", () => {
        const value = Number(logHoursInput.value);
        if (!Number.isNaN(value) && value >= 0) {
            const increment = clampHours(value);
            const goal = Math.max(1, plannerState.weeklyGoal || weeklyGoal);
            plannerState.loggedHours = Math.min(
                clampHours((plannerState.loggedHours || 0) + increment),
                goal
            );
            updateProgress();
            persistPlannerState();
        }
    });
}

if (form) {
    form.addEventListener("submit", event => {
        event.preventDefault();
        const subject = document.getElementById("subject").value;
        const topic = document.getElementById("topic").value;
        const hours = Number(document.getElementById("hours").value);
        const confidence = form.querySelector("input[name='confidence']:checked").value;
        const plan = { subject, topic, hours, confidence };
        plannerState.lastPlan = plan;
        renderPlan(plan);
        addSnapshot({ subject, topic, hours });
        persistPlannerState();
    });
}

if (sprintButton && sprintOutput) {
    sprintButton.addEventListener("click", () => {
        const random = sprintIdeas[Math.floor(Math.random() * sprintIdeas.length)];
        sprintOutput.textContent = random;
    });
}

if (quoteButton && mindsetQuote) {
    quoteButton.addEventListener("click", () => {
        const random = quotes[Math.floor(Math.random() * quotes.length)];
        mindsetQuote.textContent = random;
    });
}

function refreshTimelineProgress() {
    if (!timelineFill) {
        return;
    }
    const total = toolsState.timeline.length || timelineSteps.length || 1;
    const completed = toolsState.timeline.filter(item => item.completed).length;
    const percent = (completed / total) * 100;
    timelineFill.style.width = `${percent}%`;
}

if (timelineEl) {
    renderTimeline();
    refreshTimelineProgress();
    timelineEl.addEventListener("change", event => {
        const target = event.target;
        if (!target || target.type !== "checkbox") {
            return;
        }
        const index = Number(target.dataset.index);
        if (!Number.isInteger(index) || !toolsState.timeline[index]) {
            return;
        }
        toolsState.timeline[index].completed = target.checked;
        refreshTimelineProgress();
        persistToolsState();
    });
}

bootstrapRemoteState();

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

const weeklyGoal = 20;
let logged = 0;

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

function updateProgress() {
    if (!progressFill || !progressLabel) {
        return;
    }
    const percentage = Math.min((logged / weeklyGoal) * 100, 100);
    progressFill.style.width = `${percentage}%`;
    progressLabel.textContent = `${logged} / ${weeklyGoal} hrs`;
    if (hoursLoggedEl) {
        hoursLoggedEl.textContent = logged.toString().padStart(2, "0");
    }
}

if (progressFill && progressLabel && logButton && logHoursInput) {
    updateProgress();
    logButton.addEventListener("click", () => {
        const value = Number(logHoursInput.value);
        if (!Number.isNaN(value) && value >= 0) {
            logged = Math.min(logged + value, weeklyGoal);
            updateProgress();
        }
    });
}

function updateSnapshot(subject, topic, hours) {
    if (!snapList) {
        return;
    }
    const newItem = document.createElement("li");
    newItem.textContent = `${subject} · ${topic} · ${hours} hrs`;
    snapList.insertBefore(newItem, snapList.firstChild);
    if (snapList.children.length > 5) {
        snapList.removeChild(snapList.lastChild);
    }
}

if (form) {
    form.addEventListener("submit", event => {
        event.preventDefault();
        const subject = document.getElementById("subject").value;
        const topic = document.getElementById("topic").value;
        const hours = Number(document.getElementById("hours").value);
        const confidence = form.querySelector("input[name='confidence']:checked").value;
        const sessions = Math.max(2, Math.ceil(hours / 2));
        const minutes = Math.round((hours * 60) / sessions);
        document.getElementById("planResult").innerHTML = `
            <p><strong>${subject}</strong> · ${topic}</p>
            <ul>
                <li>Break it into ${sessions} sessions of ${minutes} minutes.</li>
                <li>Start with 10-minute recall, then deep practice, end with reflection.</li>
                <li>Confidence ${confidence.toLowerCase()} → ${confidence === "Low" ? "add extra recap day." : confidence === "Medium" ? "close with a timed drill." : "turn last session into teaching."}</li>
            </ul>
        `;
        updateSnapshot(subject, topic, hours);
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

function initTimeline() {
    if (!timelineEl) {
        return;
    }
    timelineSteps.forEach((step, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <label>
                <input type="checkbox" data-index="${index}" />
                <span>${step}</span>
            </label>
        `;
        timelineEl.appendChild(li);
    });
}

function refreshTimelineProgress() {
    if (!timelineEl || !timelineFill) {
        return;
    }
    const checkboxes = Array.from(timelineEl.querySelectorAll("input[type='checkbox']"));
    const completed = checkboxes.filter(cb => cb.checked).length;
    const percent = (completed / checkboxes.length) * 100;
    timelineFill.style.width = `${percent}%`;
}

if (timelineEl) {
    initTimeline();
    refreshTimelineProgress();
    timelineEl.addEventListener("change", refreshTimelineProgress);
}

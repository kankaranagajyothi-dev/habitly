
const defaultHabits = [
    { id: 1, name: "Read Books", emoji: "📚", streak: 0, completedDates: [] },
    { id: 2, name: "Drink Water", emoji: "💧", streak: 0, completedDates: [] },
    { id: 3, name: "Daily Exercise", emoji: "🏃", streak: 0, completedDates: [] },
    { id: 4, name: "Learn Coding", emoji: "💻", streak: 0, completedDates: [] },
    { id: 5, name: "Sleep Early", emoji: "🌙", streak: 0, completedDates: [] }
];

const STORAGE_KEY = "habitlyHabits";

let habits;

try {
    const savedHabits = localStorage.getItem(STORAGE_KEY);
    habits = savedHabits ? JSON.parse(savedHabits) : defaultHabits;
    if (!Array.isArray(habits)) habits = defaultHabits;
} catch {
    habits = defaultHabits;
}

function getToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function saveHabits() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function showDate() {
    const today = new Date();

    document.getElementById("currentDate").textContent =
        today.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    const hour = today.getHours();
    let greeting = "Good evening! 👋";

    if (hour < 12) {
        greeting = "Good morning! 👋";
    } else if (hour < 17) {
        greeting = "Good afternoon! 👋";
    }

    document.getElementById("greeting").textContent = greeting;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function renderHabits() {
    const habitGrid = document.getElementById("habitGrid");
    const today = getToday();

    habitGrid.innerHTML = "";

    habits.forEach(habit => {
        const completed = habit.completedDates.includes(today);

        const card = document.createElement("div");
        card.className = `habit-card ${completed ? "completed" : ""}`;

        card.innerHTML = `
            <span class="habit-emoji">${escapeHTML(habit.emoji)}</span>

            <div class="habit-info">
                <h3>${escapeHTML(habit.name)}</h3>
                <p>🔥 ${habit.streak} day streak</p>
                <p>${completed ? "Completed today ✓" : "Not completed yet"}</p>
            </div>

            <div class="habit-actions">
                <button class="complete-btn" data-action="complete" data-id="${habit.id}">
                    ${completed ? "Undo" : "Complete"}
                </button>

                <button class="delete-btn" data-action="delete" data-id="${habit.id}">
                    Delete
                </button>
            </div>
        `;

        habitGrid.appendChild(card);
    });

    updateStats();
}

function updateStats() {
    const today = getToday();

    const completedToday = habits.filter(habit =>
        habit.completedDates.includes(today)
    ).length;

    document.getElementById("doneToday").textContent =
        `${completedToday}/${habits.length}`;

    const bestStreak = habits.length
        ? Math.max(...habits.map(habit => Number(habit.streak) || 0))
        : 0;

    document.getElementById("bestStreak").textContent =
        `${bestStreak} Days`;

    let completedThisWeek = 0;

    habits.forEach(habit => {
        completedThisWeek += habit.completedDates.filter(date => {
            const difference = Math.floor(
                (new Date(today + "T00:00:00") - new Date(date + "T00:00:00")) /
                (1000 * 60 * 60 * 24)
            );

            return difference >= 0 && difference < 7;
        }).length;
    });

    const totalPossible = habits.length * 7;
    const percentage = totalPossible
        ? Math.round((completedThisWeek / totalPossible) * 100)
        : 0;

    document.getElementById("weeklyProgress").textContent =
        `${Math.min(percentage, 100)}%`;
}

document.getElementById("habitForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const nameInput = document.getElementById("habitName");
    const emojiInput = document.getElementById("habitEmoji");

    const name = nameInput.value.trim();
    const emoji = emojiInput.value.trim() || "🌟";

    if (!name) return;

    habits.push({
        id: Date.now(),
        name,
        emoji,
        streak: 0,
        completedDates: []
    });

    saveHabits();
    renderHabits();

    nameInput.value = "";
    emojiInput.value = "";
});

document.getElementById("habitGrid").addEventListener("click", function(event) {
    const button = event.target.closest("button");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    const habit = habits.find(item => item.id === id);

    if (!habit) return;

    if (action === "complete") {
        const today = getToday();
        const index = habit.completedDates.indexOf(today);

        if (index === -1) {
            habit.completedDates.push(today);
        } else {
            habit.completedDates.splice(index, 1);
        }
    }

    if (action === "delete") {
        habits = habits.filter(item => item.id !== id);
    }

    saveHabits();
    renderHabits();
});

async function fetchQuote() {
    const quoteElement = document.getElementById("quote");
    const authorElement = document.getElementById("quoteAuthor");

    try {
        const response = await fetch("https://dummyjson.com/quotes/random");

        if (!response.ok) {
            throw new Error("Could not fetch quote");
        }

        const data = await response.json();

        quoteElement.textContent = `"${data.quote}"`;
        authorElement.textContent = `— ${data.author}`;
    } catch (error) {
        quoteElement.textContent =
            '"Success is the sum of small efforts repeated day in and day out."';

        authorElement.textContent = "— Robert Collier";
    }
}

showDate();
renderHabits();
fetchQuote();

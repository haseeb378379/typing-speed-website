
/* ==========================================
   TYPEMASTER - CORRECT DUAL TYPING ENGINE
========================================== */

/* ELEMENTS */

const passage = document.getElementById("passage");
const typingInput = document.getElementById("typingInput");

const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const timerDisplay = document.getElementById("timer");
const errorsDisplay = document.getElementById("errors");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");

const resultBox = document.getElementById("result");
const finalWpm = document.getElementById("finalWpm");
const finalAccuracy = document.getElementById("finalAccuracy");

const durationButtons = document.querySelectorAll(".duration");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const modeButtons = document.querySelectorAll(".mode-btn");

const nextBtn = document.getElementById("nextBtn");
const previousBtn = document.getElementById("previousBtn");


/* PARAGRAPHS */

const paragraphSets = {
    easy: easyParagraphs,
    normal: normalParagraphs,
    hard: hardParagraphs,
    fullHard: fullHardParagraphs
};


/* VARIABLES */

let currentDifficulty = "easy";
let currentParagraphIndex = -1;
let originalText = "";

let currentMode = "classic";
let liveTypedText = "";

let paragraphHistory = [];
let historyPosition = -1;

let selectedDuration = 30;
let timeLeft = 30;

let timer = null;
let startTime = null;

let testStarted = false;
let testFinished = false;


/* GET PARAGRAPH */

function getParagraphText(paragraph) {

    if (typeof paragraph === "string") return paragraph;

    if (paragraph && typeof paragraph.text === "string") {
        return paragraph.text;
    }

    return "";

}


/* ==========================================
   CHARACTER ALIGNMENT
========================================== */

function alignCharacters(typed, target) {

    const n = typed.length;
    const m = target.length;

    const dp = Array.from(
        { length: n + 1 },
        () => new Array(m + 1).fill(0)
    );

    for (let i = 0; i <= n; i++) dp[i][0] = i;
    for (let j = 0; j <= m; j++) dp[0][j] = j;

    for (let i = 1; i <= n; i++) {

        for (let j = 1; j <= m; j++) {

            const cost =
                typed[i - 1] === target[j - 1] ? 0 : 1;

            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );

        }

    }

    // Find best matching target prefix

    let endPosition = 0;
    let minimumCost = Infinity;

    for (let j = 0; j <= m; j++) {

        if (
            dp[n][j] < minimumCost ||
            (dp[n][j] === minimumCost && j > endPosition)
        ) {

            minimumCost = dp[n][j];
            endPosition = j;

        }

    }

    const statuses = new Array(m).fill("remaining");

    let i = n;
    let j = endPosition;

    let errors = 0;
    let correct = 0;

    while (i > 0) {

        // Match or replace

        if (
            j > 0 &&
            dp[i][j] === dp[i - 1][j - 1] +
            (typed[i - 1] === target[j - 1] ? 0 : 1)
        ) {

            if (typed[i - 1] === target[j - 1]) {

                statuses[j - 1] = "correct";
                correct++;

            } else {

                statuses[j - 1] = "wrong";
                errors++;

            }

            i--;
            j--;

        }

        // Extra typed character

        else if (dp[i][j] === dp[i - 1][j] + 1) {

            errors++;
            i--;

        }

        // Missing target character

        else if (j > 0) {

            statuses[j - 1] = "wrong";
            errors++;

            j--;

        }

        else {

            errors++;
            i--;

        }

    }

    return {
        statuses,
        errors,
        correct,
        endPosition
    };

}


/* ==========================================
   RENDER PARAGRAPH
========================================== */

function renderPassage() {

    const typed = currentMode === "classic"
        ? typingInput.value
        : liveTypedText;

    const result = alignCharacters(typed, originalText);

    passage.replaceChildren();

    passage.classList.toggle(
        "live-typing-area",
        currentMode === "highlight"
    );

    passage.contentEditable = "false";

    passage.setAttribute("tabindex", "0");

    originalText.split("").forEach((char, index) => {

        const span = document.createElement("span");

        span.textContent = char;

        const status = result.statuses[index];

        if (status === "correct") {

            span.className = "correct-char";

        } else if (status === "wrong") {

            span.className = "wrong-char";

        } else {

            span.className = "remaining-char";

        }

        passage.appendChild(span);

    });

    // Current typing position

    if (currentMode === "highlight") {

        const current = document.createElement("span");

        current.className = "current-position";
        current.textContent = "\u200B";

        const nextChar = passage.children[result.endPosition];

        if (nextChar) {
            passage.insertBefore(current, nextChar);
        } else {
            passage.appendChild(current);
        }

    }

}


/* ==========================================
   LOAD RANDOM PARAGRAPH
========================================== */

function loadRandomParagraph() {

    const paragraphs = paragraphSets[currentDifficulty];

    if (!paragraphs || paragraphs.length === 0) {

        originalText = "";
        passage.textContent = "No paragraphs available.";

        typingInput.disabled = true;
        startBtn.hidden = true;

        return;

    }

    let randomIndex;

    do {

        randomIndex = Math.floor(
            Math.random() * paragraphs.length
        );

    } while (
        paragraphs.length > 1 &&
        randomIndex === currentParagraphIndex
    );

    currentParagraphIndex = randomIndex;

    originalText = getParagraphText(paragraphs[randomIndex]);

    paragraphHistory = paragraphHistory.slice(
        0,
        historyPosition + 1
    );

    paragraphHistory.push({
        difficulty: currentDifficulty,
        index: randomIndex
    });

    historyPosition++;

    resetTest();

}


/* PREVIOUS PARAGRAPH */

function loadPreviousParagraph() {

    if (historyPosition <= 0) return;

    historyPosition--;

    const previous = paragraphHistory[historyPosition];

    currentDifficulty = previous.difficulty;
    currentParagraphIndex = previous.index;

    originalText = getParagraphText(
        paragraphSets[currentDifficulty][currentParagraphIndex]
    );

    difficultyButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.difficulty === currentDifficulty
        );

    });

    resetTest();

}


/* NEXT PARAGRAPH */

function loadNextParagraph() {
    loadRandomParagraph();
}


/* ==========================================
   DIFFICULTY SELECTION
========================================== */

difficultyButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (testStarted) return;

        const difficulty = button.dataset.difficulty;

        if (!paragraphSets[difficulty]) return;

        currentDifficulty = difficulty;
        currentParagraphIndex = -1;

        difficultyButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        paragraphHistory = [];
        historyPosition = -1;

        loadRandomParagraph();

    });

});


/* ==========================================
   MODE SELECTION
========================================== */

modeButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (testStarted) return;

        currentMode = button.dataset.mode;

        modeButtons.forEach(btn => {
            btn.classList.toggle(
                "active",
                btn === button
            );
        });

        resetTest();

    });

});


/* ==========================================
   NAVIGATION
========================================== */

nextBtn.addEventListener("click", loadNextParagraph);
previousBtn.addEventListener("click", loadPreviousParagraph);

function updateNavigationButtons() {
    previousBtn.disabled = historyPosition <= 0;
}


/* ==========================================
   RESET
========================================== */

function resetTest() {

    clearInterval(timer);

    timer = null;

    timeLeft = selectedDuration;
    startTime = null;

    testStarted = false;
    testFinished = false;

    liveTypedText = "";

    typingInput.value = "";
    typingInput.disabled = false;

    typingInput.hidden = currentMode === "highlight";

    passage.style.opacity = "";
    passage.classList.toggle(
        "live-typing-area",
        currentMode === "highlight"
    );

    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "100%";
    errorsDisplay.textContent = "0";
    timerDisplay.textContent = timeLeft;

    resultBox.hidden = true;
    startBtn.hidden = false;

    renderPassage();
    updateNavigationButtons();

}


/* ==========================================
   START TIMER
========================================== */

function startTest() {

    if (testStarted || testFinished || !originalText) return;

    testStarted = true;
    startBtn.hidden = true;

    startTime = Date.now();

    if (currentMode === "classic") {

        typingInput.focus();

    } else {

        passage.focus();

    }

    timer = setInterval(() => {

        timeLeft--;

        timerDisplay.textContent = timeLeft;

        updateStats();

        if (timeLeft <= 0) {
            finishTest();
        }

    }, 1000);

}


/* ==========================================
   GET TYPED TEXT
========================================== */

function getTypedText() {

    return currentMode === "classic"
        ? typingInput.value
        : liveTypedText;

}


/* ==========================================
   STATISTICS
========================================== */

function updateStats() {

    const typed = getTypedText();

    const result = alignCharacters(typed, originalText);

    const elapsed = Math.max(
        (Date.now() - startTime) / 1000,
        1
    );

    const wpm = Math.round(
        (result.correct / 5) / (elapsed / 60)
    );

    const accuracy = typed.length === 0
        ? 100
        : Math.round(
            (result.correct / (result.correct + result.errors)) * 100
        );

    wpmDisplay.textContent = wpm;
    accuracyDisplay.textContent = accuracy + "%";
    errorsDisplay.textContent = result.errors;

    return {
        wpm,
        accuracy,
        errors: result.errors
    };

}


/* ==========================================
   FINISH TEST
========================================== */

function finishTest() {

    if (testFinished) return;

    clearInterval(timer);

    testFinished = true;
    testStarted = false;

    typingInput.disabled = true;
    passage.blur();

    startBtn.hidden = true;

    const stats = updateStats();

    finalWpm.textContent = stats.wpm + " WPM";

    finalAccuracy.textContent =
        "Accuracy: " + stats.accuracy + "%";

    resultBox.hidden = false;

}


/* ==========================================
   CLASSIC MODE INPUT
========================================== */

typingInput.addEventListener("input", () => {

    if (currentMode !== "classic" || testFinished) return;

    if (!testStarted && typingInput.value.length > 0) {
        startTest();
    }

    renderPassage();

    if (testStarted) updateStats();

    if (typingInput.value.length >= originalText.length) {
        finishTest();
    }

});


/* ==========================================
   LIVE HIGHLIGHT KEYBOARD INPUT
========================================== */

passage.addEventListener("keydown", event => {

    if (currentMode !== "highlight" || testFinished) return;

    // Ignore browser shortcuts

    if (event.ctrlKey || event.metaKey || event.altKey) return;

    event.preventDefault();

    if (event.key === "Backspace") {

        if (liveTypedText.length > 0) {
            liveTypedText = liveTypedText.slice(0, -1);
        }

    } else if (event.key.length === 1) {

        liveTypedText += event.key;

    } else {

        return;

    }

    if (!testStarted && liveTypedText.length > 0) {
        startTest();
    }

    renderPassage();

    if (testStarted) updateStats();

    if (liveTypedText.length >= originalText.length) {
        finishTest();
    }

});


/* ==========================================
   START / RESTART / TRY AGAIN
========================================== */

startBtn.addEventListener("click", startTest);

restartBtn.addEventListener("click", resetTest);

tryAgainBtn.addEventListener("click", resetTest);


/* ==========================================
   DURATION
========================================== */

durationButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (testStarted) return;

        durationButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedDuration = Number(button.dataset.time);

        resetTest();

    });

});


/* INITIAL SETUP */

typingInput.hidden = false;

loadRandomParagraph();

// ==========================================
// TypeMaster - Falling Words Game
// ==========================================


// ==========================================
// DOM ELEMENTS
// ==========================================

const gameScreen = document.getElementById("gameScreen");
const startGameButton = document.getElementById("startGameButton");
const wordInput = document.getElementById("wordInput");
const restartButton = document.getElementById("restartButton");

const scoreElement = document.getElementById("score");
const wordsTypedElement = document.getElementById("wordsTyped");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level");

const gameStatus = document.getElementById("gameStatus");
const startMessage = document.getElementById("startMessage");


// ==========================================
// WORD LIST
// ==========================================

const wordList = [
    "type",
    "keyboard",
    "speed",
    "accuracy",
    "practice",
    "computer",
    "coding",
    "developer",
    "website",
    "program",
    "javascript",
    "function",
    "monitor",
    "internet",
    "browser",
    "software",
    "technology",
    "digital",
    "learning",
    "master",
    "challenge",
    "creative",
    "student",
    "future",
    "success",
    "focus",
    "improve",
    "performance",
    "typing",
    "programming",
    "development",
    "project",
    "application"
];


// ==========================================
// GAME VARIABLES
// ==========================================

let score = 0;
let wordsTyped = 0;
let lives = 3;
let level = 1;

let gameRunning = false;

let gameTimer = null;
let spawnTimer = null;

let activeWords = [];


// ==========================================
// SPEED SETTINGS
// ==========================================

// Very slow at the beginning.

const START_FALL_SPEED = 0.18;

// Speed increase after each level.

const SPEED_INCREASE_PER_LEVEL = 0.055;


// ==========================================
// START / SPAWN SETTINGS
// ==========================================

const START_SPAWN_DELAY = 3500;

const MIN_SPAWN_DELAY = 1100;

const SPAWN_DECREASE_PER_LEVEL = 180;


// ==========================================
// START GAME
// ==========================================

function startGame() {

    resetGame();

    gameRunning = true;

    startMessage.style.display = "none";

    wordInput.disabled = false;

    wordInput.value = "";

    wordInput.focus();

    gameStatus.textContent =
        "Game started! Type the falling words.";

    updateStats();

    // Start with ONE word.
    spawnWord();

    // Start gradual spawning.
    startWordSpawning();

    // Smooth movement.
    gameTimer = setInterval(
        updateWords,
        30
    );
}


// ==========================================
// RESET GAME
// ==========================================

function resetGame() {

    clearInterval(gameTimer);
    clearInterval(spawnTimer);

    removeAllWords();

    score = 0;
    wordsTyped = 0;
    lives = 3;
    level = 1;

    gameRunning = false;

    wordInput.value = "";

    updateStats();
}


// ==========================================
// SPAWN TIMER
// ==========================================

function startWordSpawning() {

    setSpawnInterval();
}


function setSpawnInterval() {

    clearInterval(spawnTimer);

    const spawnDelay =
        Math.max(
            MIN_SPAWN_DELAY,
            START_SPAWN_DELAY -
            ((level - 1) * SPAWN_DECREASE_PER_LEVEL)
        );


    spawnTimer = setInterval(
        function () {

            if (!gameRunning) {
                return;
            }

            spawnWord();

        },
        spawnDelay
    );
}


// ==========================================
// FIND SAFE HORIZONTAL POSITION
// ==========================================

function findSafeLeftPosition(wordWidth) {

    const gameWidth =
        gameScreen.clientWidth;

    const maxLeft =
        Math.max(
            20,
            gameWidth - wordWidth - 20
        );


    const minimumDistance = 150;


    for (let attempt = 0; attempt < 30; attempt++) {

        const candidate =
            20 +
            Math.random() *
            (maxLeft - 20);


        let safe = true;


        for (const existingWord of activeWords) {

            const existingLeft =
                parseFloat(
                    existingWord.style.left
                );


            const existingTop =
                parseFloat(
                    existingWord.style.top
                );


            // Only compare words that are
            // currently near the top area.

            if (
                existingTop < 220 &&
                Math.abs(
                    candidate -
                    existingLeft
                ) < minimumDistance
            ) {

                safe = false;

                break;
            }

        }


        if (safe) {
            return candidate;
        }

    }


    // Fallback position.
    return 30;
}


// ==========================================
// CREATE FALLING WORD
// ==========================================

function spawnWord() {

    if (!gameRunning) {
        return;
    }


    const word =
        document.createElement("div");

    word.classList.add(
        "falling-word"
    );


    const randomIndex =
        Math.floor(
            Math.random() *
            wordList.length
        );


    const selectedWord =
        wordList[randomIndex];


    word.textContent =
        selectedWord;

    word.dataset.word =
        selectedWord;


    // ======================================
    // SAFE HORIZONTAL POSITION
    // ======================================

    const wordWidth = 130;

    const safeLeft =
        findSafeLeftPosition(
            wordWidth
        );


    word.style.left =
        `${safeLeft}px`;


    // ======================================
    // DIFFERENT STARTING HEIGHT
    // ======================================

    // Small variation prevents
    // every word from appearing
    // at exactly the same position.

    const startingTop =
        -50 -
        (Math.random() * 80);


    word.style.top =
        `${startingTop}px`;


    // ======================================
    // FALLING SPEED
    // ======================================

    const speed =
        START_FALL_SPEED +
        ((level - 1) *
        SPEED_INCREASE_PER_LEVEL);


    word.dataset.speed =
        speed;


    gameScreen.appendChild(
        word
    );


    activeWords.push(
        word
    );
}


// ==========================================
// UPDATE WORD POSITIONS
// ==========================================

function updateWords() {

    if (!gameRunning) {
        return;
    }


    for (
        let i = activeWords.length - 1;
        i >= 0;
        i--
    ) {

        const word =
            activeWords[i];


        let currentTop =
            parseFloat(
                word.style.top
            );


        const speed =
            parseFloat(
                word.dataset.speed
            );


        currentTop += speed;


        word.style.top =
            `${currentTop}px`;


        // ==================================
        // WORD REACHED BOTTOM
        // ==================================

        if (
            currentTop >
            gameScreen.clientHeight - 55
        ) {

            word.remove();

            activeWords.splice(
                i,
                1
            );


            loseLife();

        }

    }
}


// ==========================================
// INPUT
// ==========================================

wordInput.addEventListener(
    "input",
    function () {

        if (!gameRunning) {
            return;
        }


        const typedWord =
            wordInput.value
                .trim()
                .toLowerCase();


        if (
            typedWord === ""
        ) {
            return;
        }


        checkTypedWord(
            typedWord
        );

    }
);


// ==========================================
// CHECK WORD
// ==========================================

function checkTypedWord(
    typedWord
) {

    let matchedWord = null;


    for (
        let i = 0;
        i < activeWords.length;
        i++
    ) {

        const currentWord =
            activeWords[i];


        if (
            currentWord.dataset.word
                .toLowerCase()
                === typedWord
        ) {

            matchedWord =
                currentWord;

            break;

        }

    }


    // ======================================
    // CORRECT
    // ======================================

    if (matchedWord) {

        matchedWord.remove();


        activeWords =
            activeWords.filter(
                word =>
                    word !== matchedWord
            );


        score += 10;

        wordsTyped++;


        checkLevelUp();

        updateStats();


        gameStatus.textContent =
            "Correct! +10 points";


        wordInput.value =
            "";

        wordInput.focus();

    }

}


// ==========================================
// LOSE LIFE
// ==========================================

function loseLife() {

    lives--;

    updateStats();


    if (lives <= 0) {

        endGame();

        return;

    }


    gameStatus.textContent =
        `A word reached the bottom! ${lives} lives remaining.`;
}


// ==========================================
// LEVEL UP
// ==========================================

function checkLevelUp() {

    const newLevel =
        Math.floor(
            wordsTyped / 5
        ) + 1;


    if (
        newLevel > level
    ) {

        level =
            newLevel;


        updateExistingWordSpeeds();

        setSpawnInterval();


        gameStatus.textContent =
            `Level ${level}! Words are getting faster.`;

    }

}


// ==========================================
// UPDATE EXISTING WORD SPEEDS
// ==========================================

function updateExistingWordSpeeds() {

    const newSpeed =
        START_FALL_SPEED +
        ((level - 1) *
        SPEED_INCREASE_PER_LEVEL);


    activeWords.forEach(
        function (word) {

            word.dataset.speed =
                newSpeed;

        }
    );
}


// ==========================================
// UPDATE STATS
// ==========================================

function updateStats() {

    scoreElement.textContent =
        score;

    wordsTypedElement.textContent =
        wordsTyped;

    livesElement.textContent =
        lives;

    levelElement.textContent =
        level;

}


// ==========================================
// GAME OVER
// ==========================================

function endGame() {

    gameRunning = false;

    clearInterval(gameTimer);
    clearInterval(spawnTimer);

    wordInput.disabled = true;

    removeAllWords();

    gameStatus.textContent =
        `Game Over! Final score: ${score}`;


    const gameOverMessage =
        document.createElement(
            "div"
        );


    gameOverMessage.classList.add(
        "game-start-message"
    );


    gameOverMessage.innerHTML = `

        <div class="start-icon">
            💀
        </div>

        <h2>
            Game Over
        </h2>

        <p>
            You scored ${score} points
            and typed ${wordsTyped} words.
        </p>

        <button
            id="playAgainButton"
            class="start-game-btn"
            type="button"
        >
            Play Again →
        </button>

    `;


    gameScreen.appendChild(
        gameOverMessage
    );


    const playAgainButton =
        document.getElementById(
            "playAgainButton"
        );


    playAgainButton.addEventListener(
        "click",
        function () {

            gameOverMessage.remove();

            startGame();

        }
    );
}


// ==========================================
// REMOVE ALL WORDS
// ==========================================

function removeAllWords() {

    activeWords.forEach(
        function (word) {

            word.remove();

        }
    );


    activeWords = [];
}


// ==========================================
// START BUTTON
// ==========================================

startGameButton.addEventListener(
    "click",
    function () {

        startGame();

    }
);


// ==========================================
// RESTART BUTTON
// ==========================================

restartButton.addEventListener(
    "click",
    function () {

        resetGame();

        startMessage.style.display =
            "block";

        wordInput.disabled =
            true;

        gameStatus.textContent =
            "Start the game to begin typing.";

    }
);


// ==========================================
// INITIAL STATE
// ==========================================

updateStats();

wordInput.disabled = true;
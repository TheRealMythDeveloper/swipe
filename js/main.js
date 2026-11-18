

const screens = {
    menu: document.getElementById("main-menu"),
    levels: document.getElementById("level-screen"),
    game: document.getElementById("game-screen"),
    pause: document.getElementById("pause-screen"),
    results: document.getElementById("results-screen"),
    gameOver: document.getElementById("game-over-screen")
};

const elements = {
    campaignButton: document.getElementById("campaign-button"),
    endlessButton: document.getElementById("endless-button"),

    selectedMode: document.getElementById("selected-mode"),
    levelList: document.getElementById("level-list"),
    startLevelButton: document.getElementById("start-level-button"),

    modeLabel: document.getElementById("mode-label"),
    levelLabel: document.getElementById("level-label"),
    scoreLabel: document.getElementById("score-label"),

    challengeNumber: document.getElementById("challenge-number"),
    challengeTitle: document.getElementById("challenge-title"),
    challengeInstructions: document.getElementById("challenge-instructions"),

    minigameContent: document.getElementById("minigame-content"),
    feedback: document.getElementById("feedback-message"),

    timer: document.getElementById("timer-label"),
    progressBar: document.getElementById("progress-bar"),
    progressLabel: document.getElementById("progress-label"),

    pauseButton: document.getElementById("pause-button"),
    resumeButton: document.getElementById("resume-button"),
    restartButton: document.getElementById("restart-button"),
    quitButton: document.getElementById("quit-button"),

    finalScore: document.getElementById("final-score"),
    completedCount: document.getElementById("completed-count"),
    bestStreak: document.getElementById("best-streak"),

    continueButton: document.getElementById("continue-button"),
    retryButton: document.getElementById("retry-button"),
    resultsMenuButton: document.getElementById("results-menu-button"),

    gameOverScore: document.getElementById("game-over-score"),
    gameOverRetry: document.getElementById("game-over-retry"),
    gameOverMenu: document.getElementById("game-over-menu")
};



const CONFIG = {
    challengesPerLevel: 1,
    campaignLevels: 10,
    startingTime: 15,
    baseScore: 100
    
};


/* =========================================
   MINIGAME REGISTRY
========================================= */

// Each minigame will eventually register its
// own setup, update, and cleanup functions.

const MINIGAMES = [
    { id: "slice", name: "SLICE", instruction: "Swipe through targets. Avoid hazards!" },
    { id: "direction", name: "DIRECTION", instruction: "Swipe in the indicated direction." },
    { id: "trace", name: "TRACE", instruction: "Follow the path without leaving it." },
    { id: "stop", name: "STOP", instruction: "Stop inside the target zone." },
    { id: "deflect", name: "DEFLECT", instruction: "Redirect objects toward the goal." },
    { id: "sort", name: "SORT", instruction: "Move objects into matching zones." },
    { id: "flick", name: "FLICK", instruction: "Flick the object toward its target." },
    { id: "circle", name: "CIRCLE", instruction: "Draw a circle within the target." },
    { id: "dodge", name: "DODGE", instruction: "Avoid the incoming objects." },
    { id: "catch", name: "CATCH", instruction: "Catch the falling objects." },
    { id: "tap", name: "TAP", instruction: "Hit targets in the correct sequence." },
    { id: "memory", name: "MEMORY", instruction: "Remember and repeat the pattern." },
    { id: "connect", name: "CONNECT", instruction: "Connect the matching points." },
    { id: "balance", name: "BALANCE", instruction: "Keep the object inside the moving zone." },
    { id: "react", name: "REACT", instruction: "React when the signal appears." },
    { id: "precision", name: "PRECISION", instruction: "Hit the moving target." },
    { id: "follow", name: "FOLLOW", instruction: "Keep tracking the moving object." },
    { id: "combo", name: "COMBO", instruction: "Complete a rapid sequence of actions." }
];



const state = {
    mode: "CAMPAIGN",

    level: 1,
    challenge: 0,

    score: 0,
    levelScore: 0,

    completed: 0,
    streak: 0,
    bestStreak: 0,

    timeLeft: CONFIG.startingTime,

    selectedLevel: 1,

    running: false,
    paused: false,

    currentMinigame: null,
currentModule: null,
levelChallenges: [],

timerInterval: null,

countdownActive: false,
countdownIndex: 0,
countdownTimeout: null,
transitionTimeout: null,
challengeToken: 0
};



function showScreen(screenName) {

    Object.values(screens).forEach(screen => {
        screen.classList.add("hidden");
        screen.classList.remove("active");
    });

    const selectedScreen = screens[screenName];

    if (selectedScreen) {
        selectedScreen.classList.remove("hidden");
        selectedScreen.classList.add("active");
    }
}


function returnToMenu() {

    stopTimer();
    cleanupMinigame();

    state.running = false;
    state.paused = false;

    showScreen("menu");
}



function openCampaign() {

    state.mode = "CAMPAIGN";

    elements.selectedMode.textContent = "CAMPAIGN";
    document.getElementById("level-screen-title").textContent =
        "SELECT LEVEL";

    generateLevelButtons();

    showScreen("levels");
}


function generateLevelButtons() {

    elements.levelList.innerHTML = "";

    for (let i = 1; i <= CONFIG.campaignLevels; i++) {

        const button = document.createElement("button");

        button.className = "level-button";
        button.textContent = i;

        if (i === state.selectedLevel) {
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {

            state.selectedLevel = i;

            document.querySelectorAll(".level-button").forEach(item => {
                item.classList.remove("selected");
            });

            button.classList.add("selected");

        });

        elements.levelList.appendChild(button);
    }
}



function startCampaign() {

    state.mode = "CAMPAIGN";
    state.level = state.selectedLevel;

    beginRun();
}


function startEndless() {

    state.mode = "ENDLESS";
    state.level = 1;

    beginRun();
}


function beginRun() {

    state.score = 0;
    state.levelScore = 0;

    state.completed = 0;
    state.streak = 0;
    state.bestStreak = 0;

    state.challenge = 0;

    generateLevelChallenges();

    elements.modeLabel.textContent = state.mode;

    showScreen("game");

    updateHUD();

    loadChallenge();
}




let previousChallenges = [];

function generateLevelChallenges() {

    let available = MINIGAMES.filter(game =>
        !previousChallenges.includes(game.id)
    );

    // If too few remain, allow the full roster again.
    if (available.length < CONFIG.challengesPerLevel) {
        available = [...MINIGAMES];
    }

    // Shuffle.
    for (let i = available.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [available[i], available[j]] =
        [available[j], available[i]];

    }

    state.levelChallenges = available.slice(
        0,
        CONFIG.challengesPerLevel
    );

    previousChallenges = state.levelChallenges.map(
        game => game.id
    );

    console.log(
        "Selected minigames:",
        state.levelChallenges.map(game => game.name)
    );

}


/* =========================================
   LOADING A MINIGAME
========================================= */



function loadChallenge() {
    cleanupMinigame();
    stopTimer();

    const challenge = state.levelChallenges[state.challenge];
    if (!challenge) return;

    const token = ++state.challengeToken;

    state.currentMinigame = challenge;
    state.timeLeft = CONFIG.startingTime;
    state.running = false;
    state.paused = false;
    state.countdownActive = true;

    elements.challengeTitle.textContent = challenge.name;
    elements.challengeInstructions.textContent = challenge.instruction;
    elements.challengeNumber.textContent =
        `CHALLENGE ${state.challenge + 1} / ${CONFIG.challengesPerLevel}`;
    elements.timer.textContent = state.timeLeft;
    elements.feedback.textContent = "GET READY";

    const module = MinigameModules[challenge.id];

    if (!module || typeof module.start !== "function") {
        elements.minigameContent.textContent =
            `MODULE ERROR: ${challenge.name} could not be loaded.`;
        state.countdownActive = false;
        return;
    }

    state.currentModule = module;

    try {
        module.start(
            elements.minigameContent,
            (success = true) => {
                if (!state.running || state.paused) return;
                if (success) completeChallenge();
                else failChallenge();
            },
            Math.min(5, Math.floor((state.level - 1) / 2) + 1)
        );
    } catch (error) {
        state.running = false;
        state.countdownActive = false;
        elements.minigameContent.textContent =
            `ERROR STARTING ${challenge.name}`;
        console.error("Minigame startup error:", error);
        return;
    }

    updateHUD();
    startChallengeCountdown(token);
}

function startChallengeCountdown(token) {
    const arena = elements.minigameContent;
    const sequence = ["3", "2", "2", "1", "GO!"];
    let index = 0;

    const overlay = document.createElement("div");

    overlay.style.cssText = `
        position:absolute;
        inset:0;
        z-index:9999;
        display:flex;
        align-items:center;
        justify-content:center;
        background:rgba(16,17,22,0.88);
        color:white;
        font-size:clamp(4rem,15vw,9rem);
        font-weight:900;
        pointer-events:all;
    `;

    arena.style.position = "relative";
    arena.appendChild(overlay);

    const tick = () => {
        if (token !== state.challengeToken || state.paused) return;

        if (index >= sequence.length) {
            overlay.remove();
            state.countdownActive = false;
            state.running = true;
            elements.feedback.textContent = "GO!";
            startTimer();
            return;
        }

        overlay.textContent = sequence[index];
        index++;

        state.countdownTimeout = setTimeout(tick, 650);
    };

    tick();
}




function startTimer() {
    stopTimer();

    if (!state.running || state.paused || state.countdownActive) return;

    state.timerInterval = setInterval(() => {
        if (!state.running || state.paused || state.countdownActive) return;

        state.timeLeft--;
        updateTimerDisplay();

        if (state.timeLeft <= 0) {
            stopTimer();
            failChallenge();
        }
    }, 1000);
}



function updateTimerDisplay() {
    const timer = elements.timer;
    const value = state.timeLeft;

    timer.textContent = value;

    timer.classList.remove(
        "timer-warning",
        "timer-danger",
        "timer-critical"
    );

    if (value <= 2) {
        timer.classList.add("timer-critical");
    } else if (value <= 5) {
        timer.classList.add("timer-danger");
    } else if (value <= 10) {
        timer.classList.add("timer-warning");
    }
}





function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}




function awardPoints(amount) {

    if (!state.running || state.paused) return;

    state.score += amount;
    state.levelScore += amount;

    updateHUD();
}

function transitionToNextChallenge() {
    const arena = elements.minigameContent;

    state.running = false;
    stopTimer();

    if (state.currentModule) {
        state.currentModule.cleanup();
        state.currentModule = null;
    }

    const transitions = [
        "transition-fade",
        "transition-spin",
        "transition-shatter",
        "transition-swipe"
    ];

    const chosen = transitions[
        Math.floor(Math.random() * transitions.length)
    ];

    arena.classList.remove(...transitions);
    void arena.offsetWidth;
    arena.classList.add(chosen);

    const finish = () => {
        arena.classList.remove(...transitions);
        loadChallenge();
    };

    arena.addEventListener("animationend", finish, { once: true });

    setTimeout(finish, 650);
}


function completeChallenge() {
    if (!state.running || state.paused) return;

    state.completed++;
    state.streak++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);

    awardPoints(CONFIG.baseScore);

    elements.feedback.textContent = "COMPLETE!";

    state.running = false;
    state.countdownActive = false;
    stopTimer();

    const token = state.challengeToken;

    setTimeout(() => {
        if (token !== state.challengeToken) return;

        state.challenge++;

        if (state.challenge >= CONFIG.challengesPerLevel) {
            finishLevel();
        } else {
            transitionToNextChallenge();
        }
    }, 450);
}



function failChallenge() {

    if (!state.running) return;

    state.running = false;
    state.streak = 0;

    stopTimer();
    cleanupMinigame();

    elements.feedback.textContent = "FAILED";

    setTimeout(() => {
        showGameOver();
    }, 700);
}




function finishLevel() {

    stopTimer();

    state.running = false;

    if (state.mode === "CAMPAIGN" &&
        state.level >= CONFIG.campaignLevels) {

        showResults(true);
        return;
    }

    showResults(false);
}


function nextLevel() {

    state.level++;
    state.challenge = 0;
    state.levelScore = 0;
state.completed = 0;
state.streak = 0;
    generateLevelChallenges();

    showScreen("game");

    updateHUD();
    loadChallenge();
}




function showResults(campaignComplete) {

    showScreen("results");

    document.getElementById("results-title").textContent =
        campaignComplete ? "CAMPAIGN COMPLETE" : "LEVEL COMPLETE";

    elements.finalScore.textContent = state.score;

    elements.completedCount.textContent =
        `${state.completed} / ${CONFIG.challengesPerLevel}`;

    elements.bestStreak.textContent = state.bestStreak;

    elements.continueButton.textContent =
        state.mode === "ENDLESS" ? "NEXT LEVEL" : "CONTINUE";

    elements.continueButton.disabled = campaignComplete;
}


function showGameOver() {

    showScreen("gameOver");

    elements.gameOverScore.textContent = state.score;
}





function pauseGame() {
    if (!state.running && !state.countdownActive) return;
    if (state.paused) return;

    state.paused = true;
    stopTimer();

    if (state.countdownTimeout) {
        clearTimeout(state.countdownTimeout);
        state.countdownTimeout = null;
    }

    if (state.currentModule && state.currentModule.pause) {
        state.currentModule.pause();
    }

    showScreen("pause");
}



function resumeGame() {

    if (!state.paused) return;

    state.paused = false;

    showScreen("game");
}


function restartGame() {

    stopTimer();
    cleanupMinigame();

    state.challenge = 0;
    state.completed = 0;
    state.streak = 0;

    state.score = 0;
    state.levelScore = 0;

    generateLevelChallenges();

    showScreen("game");

    updateHUD();
    loadChallenge();
}




function updateHUD() {

    elements.modeLabel.textContent = state.mode;
    elements.levelLabel.textContent = state.level;
    elements.scoreLabel.textContent = state.score;

    elements.progressLabel.textContent =
        `${state.completed} / ${CONFIG.challengesPerLevel}`;

    elements.progressBar.style.width =
        `${(state.completed / CONFIG.challengesPerLevel) * 100}%`;
}




function cleanupMinigame() {
    if (state.currentModule) {
        state.currentModule.cleanup();
        state.currentModule = null;
    }

    elements.minigameContent.innerHTML = "";
}



elements.campaignButton.addEventListener("click", openCampaign);

elements.endlessButton.addEventListener("click", startEndless);

elements.startLevelButton.addEventListener("click", startCampaign);

document.querySelector('[data-back="menu"]').addEventListener(
    "click",
    returnToMenu
);

elements.pauseButton.addEventListener("click", pauseGame);

elements.resumeButton.addEventListener("click", resumeGame);

elements.restartButton.addEventListener("click", restartGame);

elements.quitButton.addEventListener("click", returnToMenu);

elements.continueButton.addEventListener("click", nextLevel);

elements.retryButton.addEventListener("click", restartGame);

elements.resultsMenuButton.addEventListener("click", returnToMenu);

elements.gameOverRetry.addEventListener("click", restartGame);

elements.gameOverMenu.addEventListener("click", returnToMenu);


/* Initialization */
showScreen("menu");

console.log("SWIPE ENGINE INITIALIZED");
console.log(`${MINIGAMES.length} minigames registered.`);

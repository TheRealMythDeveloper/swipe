const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game-screen");

const campaignButton = document.getElementById("campaign-button");
const endlessButton = document.getElementById("endless-button");
const backButton = document.getElementById("back-button");

const gameModeTitle = document.getElementById("game-mode-title");
let currentMode = "CAMPAIGN";
let currentLevel = 1;
let currentChallenge = 1;
let score = 0;
let timeLeft = 10;

const challenges = [
    {
        name: "SLICE",
        instruction: "Swipe through the target!",
    },
    {
        name: "DIRECTION",
        instruction: "Follow the indicated direction!",
    },
    {
        name: "TRACE",
        instruction: "Follow the path!",
    },
    {
        name: "STOP",
        instruction: "Stop inside the target zone!",
    },
    {
        name: "DEFLECT",
        instruction: "Redirect the object!",
    }
];
function startGame(mode) {

    currentMode = mode;
    currentLevel = 1;
    currentChallenge = 1;
    score = 0;

    mainMenu.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    document.getElementById("mode-label").textContent = mode;

    loadChallenge();

}
function loadChallenge() {

    const challenge = challenges[currentChallenge - 1];

    document.getElementById("challenge-title").textContent = challenge.name;
    document.getElementById("challenge-instructions").textContent = challenge.instruction;

    document.getElementById("level-label").textContent = "LEVEL " + currentLevel;
    document.getElementById("score-label").textContent = "SCORE: " + score;
    document.getElementById("progress-label").textContent =
        "CHALLENGE " + currentChallenge + " / 5";

}
function returnToMenu() {

    gameScreen.classList.add("hidden");
    mainMenu.classList.remove("hidden");

}
campaignButton.addEventListener("click", () => {
    startGame("CAMPAIGN");
});

endlessButton.addEventListener("click", () => {
    startGame("ENDLESS");
});

backButton.addEventListener("click", returnToMenu);
function completeChallenge() {

    score += 100;

    if (currentChallenge < 5) {

        currentChallenge++;

    } else {

        currentLevel++;
        currentChallenge = 1;

    }

    loadChallenge();

}
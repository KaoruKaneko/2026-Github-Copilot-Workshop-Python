import {
    createInitialTimerState,
    formatExpectedEndTime,
    formatRemainingTime,
    pauseTimer,
    resetTimer,
    resumeTimer,
    startTimer,
    tickTimer,
} from "./timer_engine.js";

const timerDisplay = document.getElementById("timer-display");
const statusDisplay = document.getElementById("status");
const endTimeDisplay = document.getElementById("end-time");
const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const resumeButton = document.getElementById("resume-button");
const resetButton = document.getElementById("reset-button");

let state = createInitialTimerState();

function getStatusLabel(status) {
    switch (status) {
        case "running":
            return "Focus中";
        case "paused":
            return "一時停止中";
        case "completed":
            return "完了";
        default:
            return "待機中";
    }
}

function render() {
    if (timerDisplay) {
        timerDisplay.textContent = formatRemainingTime(state.remainingSeconds);
    }

    if (statusDisplay) {
        statusDisplay.textContent = `状態: ${getStatusLabel(state.status)}`;
    }

    if (endTimeDisplay) {
        endTimeDisplay.textContent = formatExpectedEndTime(state.expectedEndAtMs);
    }

    if (startButton) {
        startButton.disabled = state.status !== "idle";
    }
    if (pauseButton) {
        pauseButton.disabled = state.status !== "running";
    }
    if (resumeButton) {
        resumeButton.disabled = state.status !== "paused";
    }
    if (resetButton) {
        resetButton.disabled = state.status === "idle" && state.remainingSeconds === state.initialDurationSeconds;
    }
}

if (startButton) {
    startButton.addEventListener("click", () => {
        state = startTimer(state, Date.now());
        render();
    });
}

if (pauseButton) {
    pauseButton.addEventListener("click", () => {
        state = pauseTimer(state, Date.now());
        render();
    });
}

if (resumeButton) {
    resumeButton.addEventListener("click", () => {
        state = resumeTimer(state, Date.now());
        render();
    });
}

if (resetButton) {
    resetButton.addEventListener("click", () => {
        state = resetTimer(state);
        render();
    });
}

setInterval(() => {
    state = tickTimer(state, Date.now());
    render();
}, 250);

render();

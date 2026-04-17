export const DEFAULT_FOCUS_SECONDS = 25 * 60;

export function createInitialTimerState({ durationSeconds = DEFAULT_FOCUS_SECONDS } = {}) {
    const initialDurationSeconds = Math.max(1, Math.floor(durationSeconds));
    return {
        mode: "focus",
        status: "idle",
        initialDurationSeconds,
        remainingSeconds: initialDurationSeconds,
        expectedEndAtMs: null,
    };
}

export function startTimer(state, nowMs) {
    if (state.status !== "idle") {
        return state;
    }

    const currentMs = Number.isFinite(nowMs) ? nowMs : Date.now();
    return {
        ...state,
        status: "running",
        expectedEndAtMs: currentMs + state.remainingSeconds * 1000,
    };
}

export function pauseTimer(state, nowMs) {
    if (state.status !== "running" || state.expectedEndAtMs == null) {
        return state;
    }

    const currentMs = Number.isFinite(nowMs) ? nowMs : Date.now();
    return {
        ...state,
        status: "paused",
        remainingSeconds: calculateRemainingSeconds(state.expectedEndAtMs, currentMs),
        expectedEndAtMs: null,
    };
}

export function resumeTimer(state, nowMs) {
    if (state.status !== "paused") {
        return state;
    }

    const currentMs = Number.isFinite(nowMs) ? nowMs : Date.now();
    return {
        ...state,
        status: "running",
        expectedEndAtMs: currentMs + state.remainingSeconds * 1000,
    };
}

export function resetTimer(state) {
    return {
        ...state,
        status: "idle",
        remainingSeconds: state.initialDurationSeconds,
        expectedEndAtMs: null,
    };
}

export function tickTimer(state, nowMs) {
    if (state.status !== "running" || state.expectedEndAtMs == null) {
        return state;
    }

    const currentMs = Number.isFinite(nowMs) ? nowMs : Date.now();
    const remainingSeconds = calculateRemainingSeconds(state.expectedEndAtMs, currentMs);
    if (remainingSeconds === 0) {
        return {
            ...state,
            status: "completed",
            remainingSeconds: 0,
            expectedEndAtMs: null,
        };
    }

    return {
        ...state,
        remainingSeconds,
    };
}

export function calculateRemainingSeconds(expectedEndAtMs, nowMs) {
    const deltaMs = expectedEndAtMs - nowMs;
    return Math.max(0, Math.ceil(deltaMs / 1000));
}

export function formatRemainingTime(totalSeconds) {
    const clamped = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(clamped / 60);
    const seconds = clamped % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatExpectedEndTime(expectedEndAtMs) {
    if (expectedEndAtMs == null) {
        return "--:--";
    }

    return new Date(expectedEndAtMs).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

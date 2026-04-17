import test from "node:test";
import assert from "node:assert/strict";

import {
    createInitialTimerState,
    formatExpectedEndTime,
    formatRemainingTime,
    pauseTimer,
    resetTimer,
    resumeTimer,
    startTimer,
    tickTimer,
} from "../../static/js/timer_engine.js";

test("formatRemainingTime formats minutes and seconds", () => {
    assert.equal(formatRemainingTime(65), "01:05");
});

test("formatRemainingTime clamps negative values to zero", () => {
    assert.equal(formatRemainingTime(-1), "00:00");
});

test("startTimer switches state to running", () => {
    const initial = createInitialTimerState({ durationSeconds: 120 });

    const started = startTimer(initial, 1_000);

    assert.equal(started.status, "running");
    assert.equal(started.expectedEndAtMs, 121_000);
    assert.equal(started.remainingSeconds, 120);
});

test("tickTimer updates remaining seconds from expected end time", () => {
    const initial = createInitialTimerState({ durationSeconds: 120 });
    const started = startTimer(initial, 1_000);

    const after60Sec = tickTimer(started, 61_000);

    assert.equal(after60Sec.remainingSeconds, 60);
    assert.equal(after60Sec.status, "running");
});

test("pause and resume preserve remaining seconds", () => {
    const initial = createInitialTimerState({ durationSeconds: 120 });
    const started = startTimer(initial, 10_000);

    const paused = pauseTimer(started, 40_000);
    const resumed = resumeTimer(paused, 70_000);

    assert.equal(paused.status, "paused");
    assert.equal(paused.remainingSeconds, 90);
    assert.equal(paused.expectedEndAtMs, null);

    assert.equal(resumed.status, "running");
    assert.equal(resumed.expectedEndAtMs, 160_000);
});

test("tickTimer moves to completed at zero", () => {
    const initial = createInitialTimerState({ durationSeconds: 10 });
    const started = startTimer(initial, 5_000);

    const completed = tickTimer(started, 15_001);

    assert.equal(completed.status, "completed");
    assert.equal(completed.remainingSeconds, 0);
    assert.equal(completed.expectedEndAtMs, null);
});

test("resetTimer returns to idle with initial duration", () => {
    const initial = createInitialTimerState({ durationSeconds: 90 });
    const started = startTimer(initial, 0);
    const paused = pauseTimer(started, 30_000);

    const reset = resetTimer(paused);

    assert.equal(reset.status, "idle");
    assert.equal(reset.remainingSeconds, 90);
    assert.equal(reset.expectedEndAtMs, null);
});

test("formatExpectedEndTime returns placeholder when no timestamp", () => {
    assert.equal(formatExpectedEndTime(null), "--:--");
});

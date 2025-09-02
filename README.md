# Pomodoro Extension ⏱️

A tiny, no-frills Pomodoro timer for VS Code. Shows a countdown in the status bar, notifies when sessions end, and provides Start/Pause/Reset commands + shortcuts.

## Features

-   🍅 Status bar countdown (work/break/long break)
-   🔔 Notifications on session end
-   🎹 Shortcuts:
    -   Start: **Ctrl+Alt+P** (macOS: Cmd+Option+P)
    -   Pause: **Ctrl+Alt+O** (macOS: Cmd+Option+O)
    -   Reset: **Ctrl+Alt+R** (macOS: Cmd+Option+R)

## Commands

-   **Pomodoro: Start** — `pomodoro.start`
-   **Pomodoro: Pause** — `pomodoro.pause`
-   **Pomodoro: Reset** — `pomodoro.reset`

## Settings

-   `pomodoro.workMinutes` (default: 25)
-   `pomodoro.breakMinutes` (default: 5)
-   `pomodoro.longBreakMinutes` (default: 15)
-   `pomodoro.sessionsBeforeLongBreak` (default: 4)
-   `pomodoro.showNotifications` (default: true)

## How to Use

1. Run the command **Pomodoro: Start**.
2. Watch the status bar countdown.
3. Use Pause/Reset as needed. Configure durations in _Settings → Extensions → Pomodoro_.

---

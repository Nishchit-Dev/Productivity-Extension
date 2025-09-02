import * as vscode from 'vscode'

type Mode = 'work' | 'break' | 'long-break'

class Pomodoro {
    private status: vscode.StatusBarItem
    private timer?: NodeJS.Timeout
    private remaining = 0 // seconds
    private mode: Mode = 'work'
    private sessionsCompleted = 0

    constructor(private ctx: vscode.ExtensionContext) {
        this.status = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        )
        this.status.command = 'pomodoro.start'
        this.status.tooltip = 'Pomodoro Timer'

        /** Tailwind orange-400 foreground */
        this.status.color = '#fb923c'

        /** Optional: make it stand out using a prominent background from theme */
        this.status.backgroundColor = new vscode.ThemeColor(
            'statusBarItem.prominentBackground'
        )

        this.status.show()
        this.updateStatus('Ready 🍅')
    }

    private config() {
        const c = vscode.workspace.getConfiguration('pomodoro')
        return {
            work: Math.max(1, c.get<number>('workMinutes', 25)) * 60,
            shortBreak: Math.max(1, c.get<number>('breakMinutes', 5)) * 60,
            longBreak: Math.max(1, c.get<number>('longBreakMinutes', 15)) * 60,
            sessionsBeforeLong: Math.max(
                1,
                c.get<number>('sessionsBeforeLongBreak', 4)
            ),
            notify: c.get<boolean>('showNotifications', true),
        }
    }

    start() {
        if (this.timer) return // already running
        if (this.remaining <= 0) {
            // fresh start
            this.mode = this.mode || 'work'
            this.remaining = this.durationFor(this.mode)
        }
        this.tick() // update immediately
        this.timer = setInterval(() => this.tick(), 1000)
        this.updateStatus(this.label())
    }

    pause() {
        if (!this.timer) return
        clearInterval(this.timer)
        this.timer = undefined
        this.updateStatus(`Paused ⏸ ${this.mmss(this.remaining)}`)
    }

    reset() {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = undefined
        }
        this.mode = 'work'
        this.remaining = 0
        this.sessionsCompleted = 0
        this.updateStatus('Ready 🍅')
    }

    private tick() {
        if (this.remaining > 0) {
            this.remaining -= 1
            this.updateStatus(this.label())
            return
        }
        // phase finished
        const cfg = this.config()
        if (cfg.notify) {
            vscode.window.showInformationMessage(
                this.mode === 'work'
                    ? 'Work session done! Take a break.'
                    : 'Break finished! Back to work.'
            )
        }
        if (this.mode === 'work') {
            this.sessionsCompleted += 1
            // decide next break
            if (this.sessionsCompleted % cfg.sessionsBeforeLong === 0) {
                this.mode = 'long-break'
            } else {
                this.mode = 'break'
            }
        } else {
            // from any break -> work
            this.mode = 'work'
        }
        this.remaining = this.durationFor(this.mode)
        this.updateStatus(this.label())
    }

    private durationFor(mode: Mode) {
        const cfg = this.config()
        switch (mode) {
            case 'work':
                return cfg.work
            case 'break':
                return cfg.shortBreak
            case 'long-break':
                return cfg.longBreak
        }
    }

    private label() {
        const icon =
            this.mode === 'work' ? '🍅' : this.mode === 'break' ? '☕' : '🧘'
        const word =
            this.mode === 'work'
                ? 'Work'
                : this.mode === 'break'
                ? 'Break'
                : 'Long Break'
        return `${icon} ${word}: ${this.mmss(this.remaining)}`
    }

    private mmss(totalSeconds: number) {
        const m = Math.floor(totalSeconds / 60)
        const s = totalSeconds % 60
        const mm = String(m).padStart(2, '0')
        const ss = String(s).padStart(2, '0')
        return `${mm}:${ss}`
    }

    private updateStatus(text: string) {
        this.status.text = text
    }

    dispose() {
        if (this.timer) clearInterval(this.timer)
        this.status.dispose()
    }
}

let pomo: Pomodoro | undefined

export function activate(context: vscode.ExtensionContext) {
    pomo = new Pomodoro(context)

    context.subscriptions.push(
        vscode.commands.registerCommand('pomodoro.start', () => pomo?.start()),
        vscode.commands.registerCommand('pomodoro.pause', () => pomo?.pause()),
        vscode.commands.registerCommand('pomodoro.reset', () => pomo?.reset()),
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('pomodoro')) {
                // if running, immediately reflect new durations on next cycle
                // no special action required; new config is read dynamically
            }
        })
    )
}

export function deactivate() {
    pomo?.dispose()
}

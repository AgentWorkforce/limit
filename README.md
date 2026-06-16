# Agent Limit

A native macOS **menu bar app** that shows your **Claude Code** and **Codex**
usage limits as burndown charts — so you can see at a glance whether you're
ahead of or behind your usage pace before you hit a wall.

## What it does

- Lives in the menu bar and shows your highest current usage as a percentage.
- Click it to open a popover with a **burndown chart** for each limit window
  (e.g. 5-hour and weekly):
  - A dashed line shows the *ideal* pace (a straight burn from 100% to 0% over
    the window).
  - A solid blue line shows your *actual* remaining quota over time.
  - The gap between them is shaded **green** when you're **under pace** (you
    have headroom) or **red** when you're **over pace** (you'll hit the limit
    early).
- Switch between **Codex** and **Claude** from the provider picker.
- Auto-refreshes every 60 seconds; refresh manually any time.

## How it reads your usage

The app reuses the credentials the official CLIs already store on your Mac — it
never asks you to log in again:

| Provider | Credentials | Endpoint |
|----------|-------------|----------|
| Claude   | `Claude Code-credentials` login-keychain item (written by Claude Code) | `https://api.anthropic.com/api/oauth/usage` |
| Codex    | `~/.codex/auth.json` (written by the Codex CLI) | `https://chatgpt.com/backend-api/wham/usage` |

If a provider isn't authenticated, run `claude` or `codex` once to log in.

The first time it reads the Claude keychain item, macOS may prompt you to allow
access — choose **Always Allow**.

## Build & run

Requires macOS 13+ and the Swift toolchain (Xcode or the Command Line Tools).

```bash
./build.sh
open dist/AgentLimit.app
```

To install it permanently:

```bash
cp -R dist/AgentLimit.app /Applications/
```

For development you can also run straight from the package:

```bash
swift run
```

## Project layout

```
Package.swift                 Swift package manifest
App/Info.plist                Bundle metadata (LSUIElement → menu-bar-only app)
build.sh                      Builds AgentLimit.app
Sources/AgentLimit/
  AgentLimitApp.swift         App entry point + menu bar label
  ContentView.swift           Popover UI
  BurndownChartView.swift     Swift Charts burndown rendering
  UsageViewModel.swift        Loading, refresh timer, view state
  Providers.swift             Claude + Codex usage fetchers
  Credentials.swift           Reads keychain / auth.json
  UsageHistory.swift          Persists samples for the usage curve
  Burndown.swift              Turns samples into chart data
  Models.swift                Shared types
```

## License

MIT — see [LICENSE](LICENSE).

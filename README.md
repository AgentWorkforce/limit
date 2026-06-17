# Agent Limit

A native macOS **menu bar app** that shows your **Claude Code** and **Codex**
usage limits as burndown charts — so you can see at a glance whether you're
ahead of or behind your usage pace before you hit a wall.

## What it does

- Lives in the menu bar as a flame icon that warms from **orange to red** as
  your highest current usage climbs, and fills in (turns "hot") when that window
  is burning faster than its target pace.
- Click it to open a popover with a **burndown chart** for each limit window
  (e.g. 5-hour and weekly):
  - A dashed line shows the *ideal* pace (a straight burn from 100% to 0% over
    the window).
  - A solid blue line shows your *actual* remaining quota over time.
  - The gap between them is shaded **green** when you're **under pace** (you
    have headroom) or **red** when you're **over pace** (you'll hit the limit
    early).
- Switch between **OpenAI/Codex** and **Claude** with brand-icon buttons
  ([lobe-icons](https://github.com/lobehub/lobe-icons)).
- Auto-refreshes every 60 seconds, and backs off automatically if the usage API
  rate-limits (it keeps showing your last reading instead of erroring out).

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

## Install

Download the latest **`AgentLimit.dmg`** from the
[Releases](../../releases) page, open it, and drag **Agent Limit** to
**Applications**. The build is signed and notarized, so it launches without
Gatekeeper warnings. It runs as a menu bar item (no Dock icon).

Or build it yourself (below).

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
  ContentView.swift           Popover UI + provider icon picker
  BurndownChartView.swift     Swift Charts burndown card
  BrandIcon.swift             Loads/tints the lobe-icons SVGs
  UsageViewModel.swift        Loading, refresh timer, view state
  Providers.swift             Claude + Codex usage fetchers
  Credentials.swift           Reads keychain / auth.json
  UsageHistory.swift          Persists samples for the usage curve
  Burndown.swift              Turns samples into chart data
  Models.swift                Shared types
  Resources/                  claude.svg, openai.svg (lobe-icons, MIT)
```

Brand icons are from [lobe-icons](https://github.com/lobehub/lobe-icons) (MIT).

## Releasing

Releases are signed, notarized, and published as a DMG to GitHub Releases by the
[`Release`](.github/workflows/release.yml) workflow whenever a `v*` tag is pushed:

```bash
git tag v1.0.0 && git push origin v1.0.0
```

`release.sh` does the same locally (build → `codesign` with a hardened runtime →
`notarytool` → `stapler` → DMG). It needs an Apple **Developer ID Application**
certificate and notarization credentials.

CI requires these repository **secrets** (Settings → Secrets and variables →
Actions):

| Secret | What it is |
|--------|------------|
| `MACOS_CERTIFICATE` | base64 of your Developer ID Application cert exported as `.p12` (`base64 -i cert.p12 \| pbcopy`) |
| `MACOS_CERTIFICATE_PWD` | password you set when exporting the `.p12` |
| `KEYCHAIN_PASSWORD` | any string — used for the throwaway CI keychain |
| `SIGNING_IDENTITY` | e.g. `Developer ID Application: Your Name (TEAMID)` |
| `APPLE_ID` | your Apple ID email (for notarization) |
| `APPLE_TEAM_ID` | your 10-character Developer Team ID |
| `APPLE_APP_PASSWORD` | an [app-specific password](https://support.apple.com/en-us/102654) |

Keep `CFBundleShortVersionString` in `App/Info.plist` in sync with the tag.

## License

MIT — see [LICENSE](LICENSE).

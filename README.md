# agent-limit

Terminal dashboard to monitor Claude Code and Codex usage limits.

## Install

### Via npm (requires Bun)

```bash
npm install -g agent-limit
```

### Standalone Binary (no dependencies)

Download from [GitHub Releases](https://github.com/AgentWorkforce/limit/releases):

```bash
# Apple Silicon
curl -L https://github.com/AgentWorkforce/limit/releases/latest/download/agent-limit-darwin-arm64 -o /usr/local/bin/agent-limit
chmod +x /usr/local/bin/agent-limit

# Intel Mac
curl -L https://github.com/AgentWorkforce/limit/releases/latest/download/agent-limit-darwin-x64 -o /usr/local/bin/agent-limit
chmod +x /usr/local/bin/agent-limit
```

## Quick Start

```bash
agent-limit usage
```

## CLI

| Command | Description |
|---------|-------------|
| `agent-limit usage` | Show usage dashboard |
| `agent-limit version` | Show version |
| `agent-limit help` | Show help message |

## Dashboard Controls

| Key | Action |
|-----|--------|
| `q` | Quit |
| `r` | Refresh |

## Features

- Real-time usage tracking for Claude Code and Codex
- Trajectory markers showing if you're ahead or behind your usage pace
- Auto-refresh every 60 seconds
- Color-coded usage indicators

## Supported Providers

| Provider | Status | Data Source |
|----------|--------|-------------|
| Claude Code | Full support | macOS Keychain + Anthropic API |
| Codex | Full support | `~/.codex/auth.json` + OpenAI API |

## Development

```bash
git clone https://github.com/AgentWorkforce/limit.git
cd monitor
bun install
```

Run in development mode with hot reload:

```bash
bun run dev
```

Run directly:

```bash
bun run start
```

> **Note:** In dev mode, use `q` to quit cleanly. If you Ctrl-C and see garbled output, run `reset` to restore your terminal.

### Building Standalone Binaries

Build binaries that don't require Bun:

```bash
# Build for all macOS architectures
bun run build

# Build for specific architecture
bun run build:arm64   # Apple Silicon
bun run build:x64     # Intel
```

Binaries are output to `dist/`.

## How It Works

agent-limit reads credentials from standard locations:

- **Claude Code**: macOS Keychain (`Claude Code-credentials`)
- **Codex**: `~/.codex/auth.json`

It then fetches usage data from each provider's API and displays it in a unified dashboard.

### Trajectory Indicator

Each progress bar shows a `|` marker indicating where your usage "should be" based on time elapsed in the reset period:

```
[███████░░░░|░░░░░░░░░] 30% ↓12%
            ^ you should be at 42%, but you're at 30% (12% under pace)
```

- `↓X%` (green) = under pace, you have headroom
- `↑X%` (red) = over pace, might hit limits early

## Requirements

- macOS (uses Keychain for credential storage)
- Active CLI authentication for providers you want to monitor

## License

MIT

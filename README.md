# agent-monitor

Terminal dashboard to monitor Claude Code, Codex, and Gemini CLI usage limits.

## Install

### Via npm (requires Bun)

```bash
npm install -g agent-monitor
```

### Standalone Binary (no dependencies)

Download from [GitHub Releases](https://github.com/AgentWorkforce/monitor/releases):

```bash
# Apple Silicon
curl -L https://github.com/AgentWorkforce/monitor/releases/latest/download/agent-monitor-darwin-arm64 -o /usr/local/bin/agent-monitor
chmod +x /usr/local/bin/agent-monitor

# Intel Mac
curl -L https://github.com/AgentWorkforce/monitor/releases/latest/download/agent-monitor-darwin-x64 -o /usr/local/bin/agent-monitor
chmod +x /usr/local/bin/agent-monitor
```

## Quick Start

```bash
agent-monitor usage
```

## CLI

| Command | Description |
|---------|-------------|
| `agent-monitor usage` | Show usage dashboard |
| `agent-monitor help` | Show help message |

## Dashboard Controls

| Key | Action |
|-----|--------|
| `q` | Quit |
| `r` | Refresh |

## Features

- Real-time usage tracking for Claude Code, Codex, and Gemini CLI
- Trajectory markers showing if you're ahead or behind your usage pace
- Auto-refresh every 60 seconds
- Color-coded usage indicators

## Supported Providers

| Provider | Status | Data Source |
|----------|--------|-------------|
| Claude Code | Full support | macOS Keychain + Anthropic API |
| Codex | Full support | `~/.codex/auth.json` + OpenAI API |
| Gemini CLI | Static limits | `~/.gemini/settings.json` |

## Development

```bash
git clone https://github.com/AgentWorkforce/monitor.git
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

agent-monitor reads credentials from standard locations:

- **Claude Code**: macOS Keychain (`Claude Code-credentials`)
- **Codex**: `~/.codex/auth.json`
- **Gemini**: `~/.gemini/settings.json`

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

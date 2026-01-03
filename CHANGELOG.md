# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2026-01-02

### Added

- Automatic OAuth token refresh for Claude Code credentials
- Proactive token refresh before expiration (5-minute buffer)
- Retry with refreshed token on 401 responses

## [0.4.1] - 2026-01-02

### Removed

- Gemini CLI provider support

## [0.4.0] - 2025-01-02

### Added

- Bun as npm dependency - no global Bun installation required
- Node.js wrapper script for npm distribution

### Fixed

- CLI now uses correct @opentui/core API (createCliRenderer)

### Changed

- Renamed package from `agent-monitor` to `agent-limit`

## [0.3.0] - 2025-01-02

### Added

- GitHub Actions workflow for automatic npm publishing on version bump
- Automatic GitHub release creation with release notes

## [0.2.0] - 2025-01-02

### Added

- CHANGELOG.md for tracking version history

### Changed

- Improved error handling for missing credentials

## [0.1.0] - 2025-01-02

### Added

- Initial release
- Terminal dashboard for monitoring AI agent usage limits
- Support for Claude Code usage tracking via macOS Keychain
- Support for Codex usage tracking via `~/.codex/auth.json`
- Support for Gemini CLI usage display via `~/.gemini/settings.json`
- Real-time progress bars with color-coded usage indicators
- Trajectory markers showing pace against reset period
- Auto-refresh every 60 seconds
- Keyboard controls: `q` to quit, `r` to refresh
- Standalone binary builds for macOS (arm64 and x64)
- npm package distribution

[Unreleased]: https://github.com/AgentWorkforce/limit/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/AgentWorkforce/limit/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/AgentWorkforce/limit/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/AgentWorkforce/limit/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/AgentWorkforce/limit/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/AgentWorkforce/limit/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/AgentWorkforce/limit/releases/tag/v0.1.0

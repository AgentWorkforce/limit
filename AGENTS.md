# Agent Instructions

Guidelines for AI agents working on this codebase.

## Version Management

When you complete a task that changes functionality:

1. **Bump the version** in `package.json` following [Semantic Versioning](https://semver.org/):
   - **MAJOR** (1.0.0): Breaking changes
   - **MINOR** (0.1.0): New features, backwards compatible
   - **PATCH** (0.0.1): Bug fixes, backwards compatible

2. **Update the changelog** in `CHANGELOG.md`:
   - Add entry under `## [X.Y.Z] - YYYY-MM-DD`
   - Use appropriate section: `Added`, `Changed`, `Fixed`, `Removed`
   - Update the version comparison links at the bottom

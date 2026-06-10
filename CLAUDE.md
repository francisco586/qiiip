# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This repository distributes a starter Claude Code configuration. There is no
application code, build system, or test suite.

## Structure

- `dist/claude-code/.claude/` — the distributable configuration:
  - `settings.json` — permissions allowlist (read-only commands only)
  - `commands/` — example slash commands (`/commit`, `/review`)
  - `agents/` — example subagent (`code-explorer`, read-only)
- `dist/claude-code/README.md` — installation and customization docs

## Installation (for consumers)

```sh
cp -r dist/claude-code/.claude your-project/
```

## Conventions

- Keep everything in `.claude/` generic — no project-specific paths or tools.
- Never allowlist destructive commands in `settings.json`.
- Update `dist/claude-code/README.md` whenever files are added to `.claude/`.

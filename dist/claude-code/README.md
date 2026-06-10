# Claude Code starter configuration

A distributable `.claude/` directory with sensible defaults for Claude Code:
pre-approved read-only permissions, example slash commands, and an example
subagent.

## Installation

Copy the `.claude` directory into the root of your project:

```sh
cp -r dist/claude-code/.claude your-project/
```

Then open Claude Code inside `your-project/` — the configuration is picked up
automatically.

## What's included

```
.claude/
├── settings.json        # Shared project settings (permissions allowlist)
├── commands/
│   ├── commit.md        # /commit — stage, commit, and summarize changes
│   └── review.md        # /review — review the working tree diff
└── agents/
    └── code-explorer.md # Read-only subagent for codebase exploration
```

### settings.json

Pre-approves common read-only commands (`git status`, `git diff`, `git log`,
`ls`, etc.) so Claude Code doesn't prompt for them. Nothing destructive is
allowlisted. Adjust to taste — see the
[settings documentation](https://code.claude.com/docs/en/settings).

### Slash commands

Markdown files in `.claude/commands/` become `/` commands. Use the two
included here as templates for your own.

### Subagents

Markdown files in `.claude/agents/` define subagents Claude Code can delegate
to. The included `code-explorer` is restricted to read-only tools, so it can
search the codebase but never modify it.

## Customizing

- Personal (non-committed) overrides go in `.claude/settings.local.json`.
- Project conventions and build/test instructions belong in a `CLAUDE.md` at
  the project root — run `/init` in Claude Code to generate one.

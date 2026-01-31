# notera

Minimal markdown note-taking CLI.

## Install

```bash
npm install -g notera-cli
```

## Usage

```bash
# Create a note (opens in $EDITOR)
notera new ideas "My brilliant idea" --tags "ai,tools"

# List all notes
notera ls

# Open a note (fuzzy match)
notera edit idea
```

## Config

Notes stored in `~/.notera/` by default.

```bash
export NOTERA_HOME=~/notes        # custom notes directory
export NOTERA_EDITOR="code -w"    # custom editor (default: $EDITOR)
```

## Structure

```
~/.notera/
├── ideas/
│   └── my-brilliant-idea.md
└── projects/
    └── some-project.md
```

Notes use YAML frontmatter:

```yaml
---
title: My brilliant idea
created: 2026-01-31T12:00:00.000Z
tags: [ai, tools]
---
```

## License

MIT

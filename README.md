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
notera ls --tag dev              # filter by tag
notera ls -c projects            # filter by category

# Open a note (fuzzy match)
notera edit idea

# Search note contents
notera search "TODO"

# Print note to terminal
notera cat idea
notera cat idea --raw            # include frontmatter

# Move note to different category
notera mv idea archive

# Delete a note
notera rm idea
notera rm idea --force           # delete all matches
```

## Config

Notes stored in `~/.notera/` by default.

### Environment variables

```bash
export NOTERA_HOME=~/notes        # custom notes directory
export NOTERA_EDITOR="code -w"    # custom editor (default: $EDITOR)
```

### Config file

Create `~/.notera.json` or `~/.config/notera/config.json`:

```json
{
  "home": "/path/to/notes",
  "editor": "nvim"
}
```

Priority: env vars > config file > defaults

## Structure

```
~/.notera/
├── ideas/
│   └── my-brilliant-idea.md
└── projects/
    └── some-project.md
```

Nested categories supported: `notera new projects/notera "Feature Ideas"`

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

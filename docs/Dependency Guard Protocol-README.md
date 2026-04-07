# Dependency Guard Protocol

**Stop your AI coding assistant from recommending outdated, vulnerable, or
deprecated packages.**

Every AI coding tool — Claude Code, Cursor, Copilot, Codex, Gemini CLI, and
others — has a knowledge cutoff date, typically 6–12 months behind today. That
means when your AI writes `pip install fastapi==0.104.0`, that version might be
outdated, insecure, or deprecated *right now*. You'd never know unless you
checked manually.

This protocol fixes that. It forces your AI agent to verify the current date,
look up the latest stable versions, check for security vulnerabilities, and use
the right versioning strategy — automatically, on every task.

---

## What's in This Repository

```
.
├── README.md                              ← You are here
├── AGENTS.md                              ← Project brain for AI agents (cross-tool)
├── dependency-guard-prompt.md             ← Drop-in prompt block for any LLM
├── start.sh                               ← One-command startup (macOS/Linux/WSL)
├── start.ps1                              ← One-command startup (Windows PowerShell)
├── stop.sh                                ← Graceful shutdown + port cleanup (macOS/Linux/WSL)
├── stop.ps1                               ← Graceful shutdown + port cleanup (Windows)
└── skills/
    └── dependency-guard/
        └── SKILL.md                       ← Detailed skill reference
```

**Core files + startup scripts.** You don't need all of them — pick the one(s) that
match how you work with AI. The guide below explains which to use and where.

---

## Quick Start (5 Minutes)

### If you just want this working NOW:

1. Copy `AGENTS.md` into your project root (next to your `README.md`)
2. Replace the `[bracketed placeholders]` with your project's actual commands
3. Done. Every major AI coding agent will read it automatically.

### If you want the full setup:

Follow the step-by-step guide below.

---

## Concepts: What Are These Files?

### AGENTS.md — The Project Brain

Think of `AGENTS.md` as a **README for AI agents**. Just like `README.md` tells
human developers how to work on your project, `AGENTS.md` tells AI agents the
same thing: how to build, how to test, what patterns to follow, and what
mistakes to avoid.

**Key facts:**
- It's plain Markdown. No special syntax, no schema, no tools to install.
- You put it in your project root, right next to `README.md`.
- AI agents read it automatically at the start of every session.
- It's an open standard backed by the Linux Foundation's Agentic AI Foundation.
- Adopted by 60,000+ open-source projects as of 2026.
- Works with Claude Code, Codex, Cursor, Copilot, Gemini CLI, Devin, Jules,
  Amp, VS Code, and any AAIF-compatible agent.

**You should have one in every repository.** It takes 15 minutes to customize
and will save you hours of repeating yourself to your AI assistant.

### SKILL.md — Specialized Knowledge for Specific Tasks

A skill is a **focused instruction set** for a particular type of work. While
`AGENTS.md` contains general project rules that apply to every task, a skill
contains deep expertise for one specific thing — like verifying dependency
versions, writing frontend components, or creating database migrations.

**Key facts:**
- Each skill lives in its own folder with a `SKILL.md` file inside.
- Skills are loaded on-demand, not all at once. This keeps AI context clean.
- The `SKILL.md` format is universal across AI coding tools.
- Your `AGENTS.md` points to your skills so the agent knows where to find them.

**Why separate files?** AI models have a limited "attention span" (called a
context window). If you dump every instruction into one file, the model starts
ignoring things. Skills let you give the agent deep expertise *only when it
needs it*, keeping everything else out of the way.

### The System Prompt Block — For Non-Code AI Interfaces

The `dependency-guard-prompt.md` file contains an XML-formatted prompt block
designed for AI interfaces that don't read files from your repository — like
ChatGPT, Claude.ai web chat, API calls, or custom AI applications.

You copy-paste the XML block into your system prompt, custom instructions, or
API `system` message. It works anywhere.

---

## Tool-Specific vs. Tool-Agnostic Paths

This is where beginners often get confused, so let's be very clear.

### The Problem

Every AI coding tool invented its own folder for instructions:

| Tool | Its Custom Folder | Read by Other Tools? |
|---|---|---|
| Claude Code | `.claude/skills/` | No — Claude Code only |
| Cursor | `.cursor/rules/` | No — Cursor only |
| Copilot | `.github/copilot-instructions.md` | No — Copilot only |
| Codex | `.codex/` | No — Codex only |

If you put your skills in `.claude/skills/`, they work great in Claude Code —
but Cursor, Copilot, and every other tool can't see them. You'd need to
duplicate your files into every tool's folder. That's a maintenance nightmare.

### The Solution

Use **tool-agnostic paths**. Put your skills in a plain `skills/` folder (no
dot-prefix, no vendor name):

```
skills/
└── dependency-guard/
    └── SKILL.md
```

Then reference this path in your `AGENTS.md`:

```markdown
| Task | Skill Location |
|---|---|
| Dependency verification | `skills/dependency-guard/SKILL.md` |
```

Since every major AI agent reads `AGENTS.md`, they all find the skill at the
same path. **One file, every tool.**

### But I Only Use Claude Code — Do I Need This?

You have two options:

**Option A: Agnostic path (recommended)**
```
skills/dependency-guard/SKILL.md
```
Works with Claude Code AND everything else. Future-proof. If you switch tools
or a teammate uses a different agent, it just works.

**Option B: Claude Code-specific path**
```
.claude/skills/dependency-guard/SKILL.md
```
Works with Claude Code only. Claude Code will auto-discover skills here without
needing an `AGENTS.md` reference. If you're 100% committed to Claude Code and
don't care about portability, this is slightly more convenient.

**Option C: Both (belt and suspenders)**
Use the agnostic path and symlink it into Claude Code's folder:
```bash
mkdir -p .claude/skills/dependency-guard
ln -s ../../../skills/dependency-guard/SKILL.md .claude/skills/dependency-guard/SKILL.md
```
Now both Claude Code's auto-discovery AND your `AGENTS.md` reference work. This
is what some teams with mixed tooling do.

### Quick Reference

| You Want... | Use This Path |
|---|---|
| Works everywhere (recommended) | `skills/[name]/SKILL.md` |
| Claude Code only | `.claude/skills/[name]/SKILL.md` |
| Cursor only | `.cursor/rules/[name].md` |
| Cross-tool + Claude auto-discovery | Agnostic path + symlink into `.claude/` |

---

## Step-by-Step Setup

### Step 1: Create Your Project Structure

```bash
# From your project root:
mkdir -p skills/dependency-guard
```

### Step 2: Add the Skill

Copy `skills/dependency-guard/SKILL.md` from this repository into your
project:

```bash
cp /path/to/this-repo/skills/dependency-guard/SKILL.md \
   ./skills/dependency-guard/SKILL.md
```

### Step 3: Add the AGENTS.md

Copy `AGENTS.md` from this repository into your project root:

```bash
cp /path/to/this-repo/AGENTS.md ./AGENTS.md
```

Then open it and replace all `[bracketed placeholders]` with your actual
project details — your build commands, test commands, language, framework, etc.

### Step 4: (Optional) Add the System Prompt Block

If you also use AI through web interfaces or APIs (ChatGPT, Claude.ai, etc.),
open `dependency-guard-prompt.md` and copy the XML block inside into your
system prompt or custom instructions.

### Step 5: (Optional) Claude Code Symlink

If you use Claude Code and want its auto-discovery feature:

```bash
mkdir -p .claude/skills/dependency-guard
ln -s ../../../skills/dependency-guard/SKILL.md \
   .claude/skills/dependency-guard/SKILL.md
```

### Step 6: Commit

```bash
git add AGENTS.md skills/
git commit -m "chore: add Dependency Guard protocol for AI agents"
```

### Step 7: Verify It Works

Start a new session with your AI coding agent and ask it to add a dependency.
You should see it:
1. Verify today's date
2. Search for the latest version of the package
3. Check for vulnerabilities
4. Use the right versioning strategy (bare names for scripts, pinned for production)

If it skips any of these steps, your setup is working but the model didn't
follow instructions — this happens occasionally. Remind it: "Follow the
Dependency Guard protocol in AGENTS.md."

---

## What the Protocol Actually Does

When your AI agent encounters any task involving dependencies, it follows
this workflow:

```
┌─────────────────────────────────────────────────────────┐
│  1. ANCHOR THE DATE                                     │
│     Verify today's real date via web search / clock     │
│     Store as {{TODAY}} for all subsequent lookups        │
├─────────────────────────────────────────────────────────┤
│  2. VERIFY EACH DEPENDENCY                              │
│     a. Search canonical registry for latest stable      │
│     b. Check maintenance status (stale > 12 months?)    │
│     c. Check CVE databases for vulnerabilities          │
│     d. Confirm compatibility with your stack            │
│     e. Recommend current best practices                 │
├─────────────────────────────────────────────────────────┤
│  3. APPLY CONTEXT-AWARE VERSIONING                      │
│                                                         │
│     Script / Tutorial?          Production Project?     │
│     ┌──────────────────┐       ┌──────────────────────┐ │
│     │ pip install pkg   │       │ pkg==1.2.3 (pinned) │ │
│     │ # latest: 1.2.3  │       │ + lock file          │ │
│     │ (bare names)      │       │ + Dependabot/Renovate│ │
│     └──────────────────┘       └──────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  4. OUTPUT WITH CITATIONS                               │
│     • State verified date                               │
│     • Cite registry source for each version             │
│     • Flag anything unverified with ⚠️                  │
│     • Add staleness warning on production manifests     │
└─────────────────────────────────────────────────────────┘
```

---

## FAQ

### Do I need to understand AI to use this?
No. You copy files into your project, fill in your build commands, and commit.
Your AI coding assistant reads them automatically.

### Will this slow down my AI agent?
No. The skill is loaded on-demand (progressive disclosure). It only activates
when the agent encounters a task involving dependencies. For all other tasks,
it's invisible.

### What if my AI agent ignores the instructions?
This happens occasionally with all AI tools. Two things help:
1. Keep your `AGENTS.md` under 200 lines (this one is 193).
2. Remind the agent explicitly: "Follow the Dependency Guard protocol."

### Can I add more skills?
Absolutely. Create a new folder under `skills/` with a `SKILL.md` inside,
then add a row to the skills table in your `AGENTS.md`. Some examples:

```
skills/
├── dependency-guard/SKILL.md    ← This protocol
├── code-review/SKILL.md            ← Your review checklist
├── database-migrations/SKILL.md    ← Migration conventions
└── api-design/SKILL.md             ← API design standards
```

### How is this different from .cursorrules or CLAUDE.md?
Those are tool-specific. `AGENTS.md` is the open standard. Think of it this way:
`.cursorrules` is like writing iOS-only code, `AGENTS.md` is like writing
cross-platform code. If you only use one tool, either works. If you use multiple
tools (or might switch later), `AGENTS.md` is the safer bet.

You can also have both — `AGENTS.md` for the cross-tool rules, and
`.cursorrules` / `CLAUDE.md` for tool-specific features that only exist in that
one tool.

### What if I use Claude Code and also Claude.ai web chat?
Use the `AGENTS.md` + `skills/` setup for Claude Code (it reads files from your
repo). For Claude.ai web chat, copy the XML block from
`dependency-guard-prompt.md` into your project's custom instructions or
paste it into the system prompt.

---

## Files in This Repository

| File | What It Is | Who It's For |
|---|---|---|
| `AGENTS.md` | Project-level agent instructions | Anyone using AI coding agents in a repo |
| `skills/dependency-guard/SKILL.md` | Deep reference for dependency verification | Loaded by agents when dependencies are involved |
| `dependency-guard-prompt.md` | XML prompt block for system prompts | Anyone using LLMs via web UI or API |
| `start.sh` | One-command startup (macOS/Linux/WSL) | All developers |
| `start.ps1` | One-command startup (Windows PowerShell) | Windows developers |
| `stop.sh` | Graceful shutdown + port cleanup (macOS/Linux/WSL) | All developers |
| `stop.ps1` | Graceful shutdown + port cleanup (Windows) | Windows developers |
| `README.md` | This guide | Humans |

---

## Startup & Shutdown Scripts

### What the scripts do

`start.sh` (or `start.ps1` on Windows) handles everything a beginner would
otherwise need to do manually:

1. **Detects your OS** — macOS, Linux (Ubuntu/Debian/Fedora/Arch), WSL, or Windows
2. **Detects your project type** — scans for `pyproject.toml`, `requirements.txt`,
   `package.json`, etc. and picks the right install strategy automatically
3. **Decides if a virtual environment is needed:**
   - Python project detected? → **Yes, always.** Python projects need isolated
     environments to avoid polluting your system. Uses `uv` (not `venv` or `conda`).
   - Node.js project detected? → **No.** Node uses `node_modules/` for isolation.
   - Full-stack (both)? → **Yes** for the Python part.
4. **Installs uv** if not already present (10-100x faster than pip, written in Rust)
5. **Installs the correct Python version** via uv (no pyenv needed)
6. **Creates and activates the virtual environment** with the right PATH
7. **Installs all dependencies** from the right source (`pyproject.toml`, `requirements.txt`, etc.)
8. **Detects your Node package manager** — respects existing lock files
   (`pnpm-lock.yaml` → `yarn.lock` → `bun.lock` → `package-lock.json`), but
   **defaults to pnpm** for new projects and auto-installs it if missing. If a
   `package-lock.json` exists, offers automatic migration to pnpm.
9. **Starts your application**

`stop.sh` (or `stop.ps1`) handles clean shutdown:

1. Finds all processes running on your app's port
2. Sends SIGTERM (graceful) → waits 5 seconds → SIGKILL if still alive
3. Checks for related processes on companion ports
4. Deactivates the virtual environment
5. Verifies the port is actually free

### Quick Start

```bash
# macOS / Linux / WSL
chmod +x start.sh stop.sh    # first time only
./start.sh                    # start everything
./stop.sh                     # stop everything
```

```powershell
# Windows PowerShell
.\start.ps1                   # start everything
.\stop.ps1                    # stop everything
```

### Configuration

Open `start.sh` (or `start.ps1`) and edit the four variables at the top:

```bash
PYTHON_VERSION="3.12"                    # Python version to use
APP_START_CMD="uvicorn main:app ..."     # Command that starts your app
APP_PORT=8000                            # Port your app runs on
APP_NAME="My Application"               # Display name in terminal
```

### stop.sh Options

```bash
./stop.sh                  # Graceful shutdown (reads config from start.sh)
./stop.sh --force          # Force kill everything on the port
./stop.sh --port 3000      # Kill processes on a specific port
./stop.sh -f -p 8080       # Force kill on port 8080
```

### Why uv Instead of venv or conda?

| Feature | uv | venv | conda |
|---|---|---|---|
| Speed | 10-100x faster than pip | Same as pip | Slow (solver is heavy) |
| Installs Python itself | Yes | No (need pyenv) | Yes |
| Written in | Rust | Python | Python/C |
| Lock file support | Yes (uv.lock) | No | Yes (environment.yml) |
| Disk usage | Efficient (global cache) | Duplicates everything | Very heavy |
| Cross-platform | macOS/Linux/Windows | macOS/Linux/Windows | macOS/Linux/Windows |
| Maintained by | Astral (creators of Ruff) | Python core team | Anaconda Inc. |
| Recommended in 2026 | Yes — industry default | Only for simple scripts | Only for data science legacy |

`uv` replaces five separate tools (`pip`, `pip-tools`, `virtualenv`, `pyenv`, `pipx`)
with a single binary. It's the recommended default for new Python projects in 2026.

### Why pnpm Instead of npm or yarn?

| Feature | pnpm | npm | yarn |
|---|---|---|---|
| Disk usage | Global store + hard links (1 copy) | Duplicates into every project | Duplicates (classic) or PnP |
| Install speed | Fastest | Slowest | Middle |
| Phantom dependencies | Blocked (strict `node_modules`) | Allowed (flat `node_modules`) | Allowed (classic) or blocked (PnP) |
| Monorepo support | Excellent (workspaces) | Basic | Good |
| Lock file | `pnpm-lock.yaml` | `package-lock.json` | `yarn.lock` |
| Recommended in 2026 | Yes — industry default | Legacy / simple projects | Only if already invested |

"Phantom dependencies" are packages you accidentally import without declaring
them in your `package.json`. npm's flat `node_modules` hides this bug — your code
works locally but breaks in production or on a teammate's machine. pnpm's strict
structure catches this immediately. This is a real security and reliability win.

---

## Credits

Created by **Gregory Kennedy** — ML & Fine-Tuning Engineer, AI Systems
Architect, Pluralsight Author, and self-described "AI-itarian."

Built with the philosophy that AI tools should serve humanity, not trip it up
with stale package versions.

---

## License

[Choose your license — MIT, Apache 2.0, etc.]

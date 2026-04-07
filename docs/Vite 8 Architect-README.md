# Vite 8 Architect

**Stop your AI coding agent from generating outdated Vite 5/6/7 configurations.**

Vite 8 is the biggest architectural change in Vite's history — it replaced its
entire internal bundler stack. If your AI assistant was trained before 2026, it
will generate broken configs with Babel, esbuild transforms, and separate CSS
tooling that Vite 8 no longer uses. This skill fixes that.

---

## The Problem

Ask any AI to "set up a React project with Vite" and you'll get something like:

```bash
npm install @babel/core @babel/preset-react    # ← WRONG: Vite 8 uses Oxc
npm install @vitejs/plugin-react-swc           # ← WRONG: SWC replaced by Oxc
npm install lightningcss                        # ← WRONG: bundled with Vite 8
```

```javascript
esbuild: { jsxFactory: 'React.createElement' } // ← WRONG: esbuild is disabled
```

This happens because the AI's training data contains Vite 5/6/7 patterns. Vite 8
is too new for most models to know about without explicit instructions.

## The Solution

This skill teaches AI agents the correct Vite 8 stack:

| Old (Vite 5/6/7) | New (Vite 8) |
|---|---|
| esbuild + Rollup (two bundlers) | Rolldown (one bundler, Rust) |
| Babel for JSX | Oxc for JSX (no Babel) |
| PostCSS + optional LightningCSS | LightningCSS (bundled) |
| `@vitejs/plugin-react` v4/v5 | `@vitejs/plugin-react` v6 |
| Dev/prod inconsistencies | Same bundler for both |

**Result:** 10-30x faster builds, zero Babel dependencies, no dev/prod mismatches.

---

## What's in This Package

```
vite8-architect/
├── SKILL.md                    ← Complete reference for AI agents
├── vite8-architect-prompt.md   ← Drop-in prompt block for any LLM
└── README.md                   ← This file
```

| File | What It Is | When to Use |
|---|---|---|
| `SKILL.md` | Full config reference, migration guide, benchmarks, red flags | AI coding agents (Claude Code, Cursor, etc.) |
| `vite8-architect-prompt.md` | Condensed XML prompt block | Web chat, API calls, system prompts |

---

## Quick Start

### With an AI Coding Agent

1. Copy into your skills directory:
   ```bash
   mkdir -p skills/vite8-architect
   cp SKILL.md skills/vite8-architect/SKILL.md
   ```

2. Add to your `AGENTS.md`:
   ```markdown
   | Task | Skill Location |
   |---|---|
   | Vite 8 configuration | `skills/vite8-architect/SKILL.md` |
   ```

3. Your agent will now generate correct Vite 8 configs instead of outdated patterns.

### With a Chat Interface

Copy the XML block from `vite8-architect-prompt.md` into your system prompt.

---

## What the Skill Covers

- **Reference `vite.config.js`** — canonical Vite 8 config with Rolldown, Oxc, LightningCSS
- **`package.json` template** — correct dependencies, no Babel packages
- **New Vite 8 features** — `forwardConsole`, `tsconfigPaths`, `devtools`, decorator metadata
- **Rolldown reference** — what it is, why it matters, plugin compatibility
- **Oxc reference** — what it replaces (esbuild + Babel), what it enables
- **Migration checklist** — step-by-step from Vite 5/6/7 to Vite 8
- **Performance benchmarks** — real-world build time reductions (Linear: 87%, Beehiiv: 64%)
- **Red flag diagnostic** — table of outdated patterns and their correct Vite 8 replacements
- **Anti-patterns** — nine things an AI should NEVER do when generating Vite config

---

## Performance

Real-world Vite 8 build improvements:

| Company | Before → After |
|---|---|
| Linear | 46s → 6s (87% faster) |
| Ramp | 57% faster |
| Mercedes-Benz.io | 38% faster |
| Beehiiv | 64% faster |

---

## Red Flag Quick Check

If your AI generates any of these, the config is wrong:

| You See This | It Should Be |
|---|---|
| `@babel/core` | Delete it — Oxc handles JSX |
| `@vitejs/plugin-react-swc` | `@vitejs/plugin-react` v6 |
| `.babelrc` | Delete the file |
| `esbuild: { ... }` | `esbuild: false` |
| Separate `lightningcss` install | Remove — it's bundled |

---

## Credits

Configuration reference compiled by **Gregory Kennedy** — ML & Fine-Tuning
Engineer, AI Systems Architect, Pluralsight Author, and self-described "AI-itarian."

Based on the Vite 8 announcement, Rolldown documentation, and Oxc project docs.

# Visual Narrator Skill

**Teach any AI coding agent to generate production-quality animated SVG diagrams
for technical documentation, training courses, and presentations.**

---

## What This Produces

Cinematic, sequenced SVG animations with:

- **Staggered reveals** — elements appear one after another, building a narrative
- **Glow effects** — neon-style colored glows on cards, nodes, and connections
- **Idle animations** — subtle floating, pulsing, and wobbling after the entrance
- **Sweep highlights** — white gradient sweeps across elements for polish
- **Dark theme aesthetic** — designed for dark backgrounds, GitHub READMEs, and slides

No JavaScript. No CSS animations. Pure SMIL — renders everywhere SVG is supported.

---

## Who This Is For

- **Technical trainers** creating courses for Pluralsight, Microsoft, Accenture
- **Documentation authors** who want animated visuals in README files
- **Presentation designers** building slide deck visuals
- **Engineers** who want their architecture diagrams to tell a story
- **Anyone** who has seen those beautiful animated SVG diagrams in open-source
  projects and wanted to produce their own

---

## What's in This Package

```
visual-diagram-narrator/
├── SKILL.md                         ← Complete design system for AI agents
├── visual-diagram-narrator-prompt.md  ← Drop-in prompt block for any LLM
└── README.md                        ← This file
```

| File | What It Is | When to Use |
|---|---|---|
| `SKILL.md` | Full design system with code examples, easing tables, diagram types, production checklist | AI coding agents (Claude Code, Cursor, Codex, etc.) |
| `visual-diagram-narrator-prompt.md` | Condensed XML prompt block | Web chat, API calls, system prompts |

---

## Quick Start

### Using with an AI Coding Agent

1. Copy `SKILL.md` into your skills directory:
   ```bash
   mkdir -p skills/visual-diagram-narrator
   cp SKILL.md skills/visual-diagram-narrator/SKILL.md
   ```

2. Reference it in your `AGENTS.md`:
   ```markdown
   | Task | Skill Location |
   |---|---|
   | Animated SVG diagrams | `skills/visual-diagram-narrator/SKILL.md` |
   ```

3. Ask your agent to create a diagram:
   ```
   Create an animated SVG diagram showing the 3-tier architecture
   of our application: Frontend → API → Database
   ```

### Using with a Chat Interface

Copy the XML block from `visual-diagram-narrator-prompt.md` into your
system prompt or custom instructions, then ask for diagrams normally.

---

## Diagram Types

The skill covers four diagram archetypes:

### Architecture / Stack
Stacked horizontal layers building bottom-to-top, each sliding in from a
different direction. Use for: tech stacks, layer diagrams, hierarchies.

### Concept / Flow
Left-to-right flow from source through a gate to branching categories and
leaf nodes. Use for: system overviews, feature trees, skill catalogs.

### Problem
Central frustrated figure surrounded by chaotic scattered elements.
Red-dominant palette. Use for: problem statements, "before" scenarios.

### Solution / Workflow
Sequential left-to-right phases with labeled stages and connecting arrows.
Use for: workflows, pipelines, "after" scenarios, step-by-step processes.

---

## Design System Summary

- **Canvas:** 800×600, transparent background, dark theme
- **Colors:** Indigo, Purple, Emerald, Amber, Cyan, Red (2-4 per diagram)
- **Fonts:** Inter (UI), JetBrains Mono (code)
- **Signature effect:** Per-color glow filters (feGaussianBlur + feFlood)
- **Timeline:** Entrance (0-3s) → Build (3-7s) → Reveal (7-10s) → Idle (10s+)
- **Key rule:** Stagger everything. No two elements share a start time.

---

## Example Prompt

> "Create an animated SVG diagram showing the Dependency Guard Protocol workflow.
> Four phases: Date Anchor → Verify Dependencies → Context-Aware Versioning → Output.
> Use the solution/workflow diagram type with emerald for success states and
> amber for warning states."

---

## Credits

Design system reverse-engineered from IndyDevDan's "The Library" project
SVG animations by **Gregory Kennedy** — ML & Fine-Tuning Engineer, AI Systems
Architect, Pluralsight Author, and self-described "AI-itarian."

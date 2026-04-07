# Interactive Simulation Architect

**Teach any AI coding agent to generate production-quality interactive HTML
visualizations — 3D molecular viewers, physics simulations, virtual labs,
procedural generators, and cinematic web experiences.**

---

## What This Produces

Single-file HTML applications with:

- **Dark sci-fi aesthetic** — gradient backgrounds, glassmorphic panels, neon glow effects
- **Real-time rendering** — Three.js / Canvas 2D with `requestAnimationFrame` loops
- **Interactive controls** — sliders, dropdowns, toggles, drag interactions — all styled
- **Educational value** — atom properties, physics formulas, real-time computed data
- **Zero dependencies** — one HTML file, open in browser, it works

No build tools. No frameworks. No npm install. Just a file.

---

## Five Visualization Archetypes

This skill covers five distinct types of interactive visualization, each extracted
from a production-quality reference implementation:

### 1. Molecular / Structural Viewer
3D atom-and-bond visualization with Three.js. Ball-and-stick or space-filling modes,
orbit controls, atom hover highlighting, element info panel with properties.
**Use for:** Chemistry education, drug design interfaces, material science demos.

### 2. Mechanical / Engineering Simulation
Canvas 2D cutaway view with interactive drag-to-actuate mechanism. Spring physics,
contact detection, state readouts, multiple switch/mode types.
**Use for:** Hardware education, product demos, engineering training materials.

### 3. Scientific Lab / Optics Simulation
Split-layout virtual lab with formula-driven simulation. Draggable objects on canvas,
real-time ray tracing, computed data panel, parameter sliders.
**Use for:** Physics education, optics training, virtual lab environments.

### 4. Procedural 3D Generator
Three.js + shaders for noise-based terrain generation. Multiple visualization modes,
real-time parameter adjustment, day/night cycle, atmospheric rendering.
**Use for:** Game dev prototyping, geography education, creative tools.

### 5. Cinematic Fan Page / Showcase
Full-viewport hero with parallax, glitch text effects, CRT scanlines, film grain,
character cards with hover micro-interactions, typewriter text reveals.
**Use for:** Product launches, fan sites, portfolio showcases, event pages.

---

## What's in This Package

```
interactive-simulation-architect/
├── SKILL.md                         ← Complete design system for AI agents
├── interactive-simulation-architect-prompt.md  ← Drop-in prompt block for any LLM
└── README.md                        ← This file
```

---

## Quick Start

### With an AI Coding Agent

1. Copy `SKILL.md` into your skills directory:
   ```bash
   mkdir -p skills/interactive-simulation-architect
   cp SKILL.md skills/interactive-simulation-architect/SKILL.md
   ```

2. Add to your `AGENTS.md`:
   ```markdown
   | Task | Skill Location |
   |---|---|
   | Interactive visualizations | `skills/interactive-simulation-architect/SKILL.md` |
   ```

3. Ask your agent:
   ```
   Create an interactive 3D molecular viewer showing water, methane, and benzene
   with ball-and-stick and space-filling modes, orbit controls, and atom hover info.
   ```

### With a Chat Interface

Copy the XML block from `interactive-simulation-architect-prompt.md` into your system prompt,
then describe what you want to visualize.

---

## Design System Summary

- **Theme:** Dark gradient (`#0a0f1a` → `#1a1f2e`), glassmorphic panels
- **Accent pair:** Cyan (`#00d4ff`) + Green (`#00ff88`) — signature look
- **Controls:** All styled with glow hover/active states, no bare HTML
- **Title:** Shimmer gradient text animation
- **Rendering:** Three.js for 3D, Canvas 2D for simulations, CSS for pages
- **Output:** Single self-contained HTML file, always

---

## Example Prompts

> "Build an interactive optics simulation with convex and concave lenses.
> Split layout — controls on the left, ray diagram on the right.
> Show the Gaussian imaging formula and compute values in real time."

> "Create a procedural planet generator with Perlin noise terrain, height/temperature
> color modes, and sliders for roughness, sea level, and rotation speed."

> "Make a Blade Runner-style fan page with a glitching neon hero, parallax cityscape,
> character cards for Deckard, K, and Joi, and a typewriter quote wall."

---

## Credits

Design system extracted from five GLM-5V-Turbo reference implementations,
codified as a reusable skill by **Gregory Kennedy** — ML & Fine-Tuning Engineer,
AI Systems Architect, Pluralsight Author, and self-described "AI-itarian."

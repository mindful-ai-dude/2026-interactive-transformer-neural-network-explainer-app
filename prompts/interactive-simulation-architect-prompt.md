# Interactive Simulation Architect — System Prompt Block

> **Purpose:** Drop this into any system prompt, AGENTS.md, or custom instructions
> to enable production-quality interactive HTML visualization generation.

---

```xml
<interactive_simulation_architect_protocol>
<mandate>
When asked to create an interactive visualization, simulation, virtual lab,
3D viewer, or immersive web experience, follow this design system exactly.
Every output is a SINGLE self-contained HTML file with all CSS and JS inlined.
No build tools, no frameworks, no external files beyond CDN-loaded libraries.
</mandate>

<dark_theme>
Background: linear-gradient(135deg, #0a0f1a, #1a1f2e, #0d1520)
Panel BG: rgba(15, 25, 40, 0.9) with backdrop-filter: blur(10px)
Panel border: 1px solid rgba(0, 212, 255, 0.2) with border-radius: 12px
Text primary: #e0e6ed | Text muted: #8899aa
Shadow: 0 8px 32px rgba(0, 0, 0, 0.3)
Panel inner highlight: inset 0 1px 0 rgba(255, 255, 255, 0.05)
</dark_theme>

<accent_colors>
Cyan (primary): #00d4ff — glow: rgba(0, 212, 255, 0.3)
Green (active): #00ff88 — glow: rgba(0, 255, 136, 0.3)
Magenta (alt): #ff0066 — glow: rgba(255, 0, 102, 0.3)
Amber (warm): #F59E0B — glow: rgba(245, 158, 11, 0.3)
Blue (scientific): #2080ff — glow: rgba(32, 128, 255, 0.3)
Default pairing: Cyan primary + Green secondary.
</accent_colors>

<controls_styling>
All interactive controls get the glassmorphic dark treatment:
- Selects/inputs: dark bg, cyan border, glow on hover/focus
- Buttons: gradient bg, uppercase, letter-spacing, -2px translateY on hover
- Active states: green border + green glow
- Toggle indicators: red dot → green dot with glow transition
- Sliders: thin cyan track, glowing cyan thumb
- Labels: 0.75rem, uppercase, letter-spacing: 2px, cyan color
All transitions: 0.3s ease. All interactive elements: cursor: pointer.
</controls_styling>

<title_effect>
Shimmer gradient text: linear-gradient(90deg, #00d4ff, #00ff88, #00d4ff)
background-size: 200% auto with background-clip: text
Animated via: animation: shimmer 3s linear infinite
Font: 2rem, weight 300, letter-spacing 4px, uppercase
</title_effect>

<technology_selection>
Three.js (CDN r128): 3D objects, molecular viewers, planetary bodies, orbit controls
Canvas 2D: Physics sims, optics, mechanical diagrams, 2D interactive elements
CSS + DOM: Scroll pages, card layouts, parallax, text effects
Always use requestAnimationFrame — never setInterval.
Always handle window resize.
</technology_selection>

<layout_patterns>
Pattern A — Full-screen canvas + floating panels (3D):
  Canvas: position fixed, full viewport, z-index 1
  UI: position fixed, z-index 10, pointer-events none (children auto)

Pattern B — Split layout (2D labs):
  Left 30%: controls + data panel
  Right 70%: Canvas area

Pattern C — Scroll sections (fan pages):
  Full-viewport hero + scrolling content sections
</layout_patterns>

<visualization_types>
MOLECULAR: atom spheres + bond cylinders, ball-stick/space-fill modes, hover info
MECHANICAL: cutaway view, drag interaction, spring physics, state readouts
SCIENTIFIC LAB: formula-driven, draggable objects, ray tracing, data panel
PROCEDURAL 3D: noise terrain, shading modes, parameter sliders, atmosphere
CINEMATIC PAGE: parallax hero, glitch text, character cards, typewriter reveals
</visualization_types>

<file_structure>
CRITICAL: Everything in ONE HTML file. No external CSS/JS files.
Structure: DOCTYPE → head (meta + style) → body (HTML + CDN scripts + script)
CDN-hosted Three.js and OrbitControls are the only allowed external references.
</file_structure>

<never_do>
- No multiple files — single HTML only
- No light/white backgrounds — always dark theme
- No unstyled controls — all get glassmorphic treatment
- No setInterval — always requestAnimationFrame
- No missing hover/glow effects on interactive elements
- No inline event handlers — use addEventListener
- No hardcoded canvas sizes — read from container
- No skipping resize handler
- No default browser fonts — always set font-family
- No missing overflow:hidden on body for full-screen layouts
</never_do>
</interactive_simulation_architect_protocol>
```

---

## Usage Notes

| Environment | Location |
|---|---|
| Claude Code | `AGENTS.md` or `skills/interactive-simulation-architect/SKILL.md` |
| Cursor | `.cursorrules` or `.cursor/rules/` |
| Claude.ai | System prompt or project instructions |
| Any agent | Prepend to system context |

**For the complete design system** with full CSS code blocks, layout diagrams,
five archetype references, and production checklist, use the detailed SKILL.md.

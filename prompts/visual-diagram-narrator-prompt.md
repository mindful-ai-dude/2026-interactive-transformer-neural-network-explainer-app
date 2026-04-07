# Visual Narrator — System Prompt Block

> **Purpose:** Drop this into any system prompt, AGENTS.md, or custom instructions
> to enable production-quality animated SVG diagram generation for documentation,
> training courses, and presentations.

---

```xml
<visual_diagram_narrator_protocol>
<mandate>
When asked to create an animated SVG diagram, follow this design system exactly.
These are pure SVG with SMIL animations — no JavaScript, no CSS animations.
They render in browsers, GitHub READMEs, markdown viewers, and slide decks.
</mandate>

<canvas>
- viewBox: "0 0 800 600" (standard) or "0 0 800 400" (compact)
- Background: transparent (designed for dark themes, use #0F172A for card fills)
- Always include xmlns="http://www.w3.org/2000/svg"
</canvas>

<color_palette>
| Name    | Hex     | Use                                      |
|---------|---------|------------------------------------------|
| Indigo  | #6366F1 | Primary brand, main elements             |
| Purple  | #8B5CF6 | Secondary, supporting elements           |
| Emerald | #10B981 | Success, active, growth                  |
| Amber   | #F59E0B | Warnings, highlights, access             |
| Cyan    | #06B6D4 | Info, orchestration, data flow           |
| Red     | #EF4444 | Problems, errors, danger                 |
| Text    | #E0E0E0 | Primary text                             |
| Muted   | #9CA3AF | Subtitles, descriptions                  |
| Border  | #4B5563 | Connection lines                         |
| Card BG | #0F172A | Card/node background                     |

Use 2-4 accent colors per diagram maximum. One color per concept.
</color_palette>

<typography>
Import Inter (400/600/700) and JetBrains Mono (400/500) via Google Fonts in a
style block. Use Inter for all UI text, JetBrains Mono for code/filenames.
Titles: 24-28px bold. Labels: 13-18px bold. Descriptions: 11-14px regular.
</typography>

<glow_filters>
Every accent color gets a glow filter in defs using this pattern:
  feGaussianBlur (stdDeviation 3-6) → feFlood (color, opacity 0.25-0.5)
  → feComposite → feMerge with SourceGraphic
Apply via filter="url(#glow-name)" on parent groups.
This is the SIGNATURE visual effect. Never skip it.
</glow_filters>

<animation_timeline>
Phase 1 (0-3s):   Primary elements appear with staggered 0.2-0.5s delays
Phase 2 (3-7s):   Connections, secondary elements, branching
Phase 3 (7-10s):  Titles, subtitles, decorative details
Phase 4 (10s+):   Passive idle loops (float ±2px, pulse opacity, wobble ±2°)

CRITICAL: Stagger every element. No two elements share the same begin time.
</animation_timeline>

<entry_animations>
- Fade in: opacity 0→1, dur 0.5-0.8s
- Slide in: x/y from offscreen, calcMode="spline" keySplines="0.16 1 0.3 1"
- Stroke draw: stroke-dasharray/offset, keySplines="0.4 0 0.2 1"
- Glow burst: expanding circle r=0→40 with fading opacity (for "unlock" moments)
- Line reveal: stroke-dashoffset animation on connection lines
ALL entry animations must have fill="freeze".
</entry_animations>

<idle_animations>
Begin at 10s+. Stagger starts by 0.3s. Vary durations (3.6s-4.6s).
- Float: translateY values="0,0;0,-2;0,0;0,2;0,0"
- Pulse: fill-opacity values="0.14;0.22;0.14"
- Glow pulse: stroke-opacity values="1;0.5;1"
All idle animations use repeatCount="indefinite".
Keep movements SUBTLE — ±2px translate, ±2° rotate maximum.
</idle_animations>

<structural_patterns>
- Double-rect: stroke rect (with glow filter) + fill rect (opacity 0.08-0.12)
- Number badges: circle + centered text for step indicators
- Arrow markers: polygon-based markers in defs
- Heavy XML comments as section dividers
- rx="8" minimum on all rectangles (no sharp corners)
- text-anchor="middle" for centered text
- Sweep highlight: white gradient + clipPath + translateX animation
</structural_patterns>

<diagram_types>
ARCHITECTURE: Stacked layers, bottom-to-top, each sliding in differently
CONCEPT/FLOW: Left-to-right, source → gate → categories → leaves
PROBLEM: Frustrated figure + chaotic scattered elements, red dominant
SOLUTION/WORKFLOW: Sequential left-to-right phases with labeled stages
</diagram_types>

<never_do>
- No JavaScript or CSS animations — SMIL only
- No simultaneous reveals — stagger everything
- No more than 4 accent colors per diagram
- No sharp corners — always rx on rects
- No default text styling — always set font properties
- No missing glow filters — they define the visual identity
- No repeatCount="indefinite" on entry animations
- No large idle movements — keep subtle (±2px, ±2°)
- No missing fill="freeze" on entry animations
- No background fill on SVG root — keep transparent
</never_do>
</visual_diagram_narrator_protocol>
```

---

## Usage Notes

**Where to place this prompt block:**

| Environment | Location |
|---|---|
| Claude Code | `AGENTS.md` at project root |
| Cursor | `.cursorrules` or `.cursor/rules/` |
| Claude.ai | System prompt or project instructions |
| OpenAI API | `system` message |
| Any agent | Prepend to system context |

**For the complete design system** with code examples, easing reference tables,
character figure patterns, and a full production checklist, use the detailed
SKILL.md at `skills/visual-diagram-narrator/SKILL.md`.

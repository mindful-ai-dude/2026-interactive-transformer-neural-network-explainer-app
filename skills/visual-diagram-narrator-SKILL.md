---
name: visual-diagram-narrator
description: >
  Generate production-quality animated SVG diagrams for technical documentation,
  training courses, README files, and presentations. Triggers on: "animated diagram",
  "SVG animation", "animated SVG", "documentation visual", "training diagram",
  "step-by-step diagram", "workflow animation", "architecture animation",
  "animated flowchart", "problem/solution diagram", "README animation", or any
  request for visual documentation with animation, callouts, or sequenced reveals.
  Also triggers when creating visuals for technical training content (Pluralsight,
  Microsoft, Accenture, etc.) or when the user asks for diagrams that "look like"
  or "animate like" reference SVGs.
---

# Visual Narrator

Generate cinematic, sequenced SVG animations for technical documentation. These
are pure SVG with no JavaScript — only SMIL animations — so they render natively
in browsers, GitHub READMEs, markdown viewers, and slide decks.

## Design System

### Canvas

- **viewBox:** `0 0 800 600` (standard) or `0 0 800 400` (compact/banner)
- **Background:** Transparent. All SVGs are designed for dark backgrounds (`#0F172A`).
  Use `#0F172A` as explicit fill on card/node backgrounds when needed.
- **Namespace:** Always include `xmlns="http://www.w3.org/2000/svg"`

### Color Palette

Every diagram uses a subset of these named semantic colors:

| Name | Hex | Semantic Use |
|---|---|---|
| Indigo | `#6366F1` | Primary brand, skills, main elements |
| Purple | `#8B5CF6` | Secondary, agents, supporting elements |
| Emerald | `#10B981` | Success, active, growth, skills items |
| Amber | `#F59E0B` | Warnings, access, prompts, highlights |
| Cyan | `#06B6D4` | Info, orchestration, data flow |
| Red | `#EF4444` | Problems, errors, danger, frustration |
| Text Light | `#E0E0E0` | Primary text on dark backgrounds |
| Text Muted | `#9CA3AF` | Secondary text, descriptions, subtitles |
| Border | `#4B5563` | Connection lines, dividers |
| Card Fill | `#0F172A` | Card/node background fill |

**Rule:** Each diagram uses 2-4 accent colors maximum. Never use all colors at once.
Assign one color per conceptual category and stay consistent throughout.

**Accent text colors** (lighter tints for readability on dark cards):
- Indigo accent: `#A5B4FC`
- Purple accent: `#C4B5FD`
- Emerald accent: `#6EE7B7`
- Amber accent: `#FCD34D`
- Cyan accent: `#67E8F9`

### Typography

Always import Inter and JetBrains Mono:

```xml
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap');
  text { font-family: 'Inter', system-ui, sans-serif; }
  .mono { font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace; }
</style>
```

| Use | Font | Weight | Size |
|---|---|---|---|
| Main title | Inter | 700 | 24-28px |
| Section label / node name | Inter | 700 | 13-18px |
| Description / subtitle | Inter | 400 | 11-14px |
| Code / file names | JetBrains Mono | 400-500 | 11px |
| Small labels / badges | Inter | 600-700 | 11-12px |

### Glow Filters

Every accent color gets a glow filter. This is the signature visual effect.

```xml
<filter id="glow-indigo" x="-30%" y="-30%" width="160%" height="160%">
  <feGaussianBlur stdDeviation="4" result="blur"/>
  <feFlood flood-color="#6366F1" flood-opacity="0.3"/>
  <feComposite in2="blur" operator="in"/>
  <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
```

Create one filter per accent color used. Apply via `filter="url(#glow-indigo)"` on
the parent `<g>` of each major element group.

- `stdDeviation`: 3-6 (higher = softer glow)
- `flood-opacity`: 0.25-0.5 (higher = more intense)

---

## Animation System

### Timeline Architecture

Every diagram follows a four-phase timeline:

| Phase | Time | Purpose |
|---|---|---|
| **Entrance** | 0s – 3s | Primary elements appear with staggered delays |
| **Build** | 3s – 7s | Connections, secondary elements, branching |
| **Reveal** | 7s – 10s | Titles, subtitles, decorative details |
| **Idle** | 10s+ | Passive looping animations (float, pulse, wobble) |

**Stagger rule:** Each element's `begin` delay is 0.2–0.5s after the previous
element. This creates the cinematic "build-up" feel. Never reveal everything at once.

### Entry Animation Patterns

#### 1. Fade In (simplest)
```xml
<g opacity="0">
  <animate attributeName="opacity" from="0" to="1"
    begin="0.5s" dur="0.6s" fill="freeze"/>
  <!-- content here -->
</g>
```

#### 2. Slide Up (from below)
```xml
<rect ... opacity="0">
  <animate attributeName="opacity" from="0" to="1"
    dur="0.6s" begin="0.2s" fill="freeze"/>
  <animate attributeName="y" from="620" to="420"
    dur="1.4s" begin="0.2s" fill="freeze"
    calcMode="spline" keySplines="0.16 1 0.3 1" keyTimes="0;1"/>
</rect>
```

#### 3. Slide from Left / Right
```xml
<animate attributeName="x" from="-550" to="150"
  dur="1.3s" begin="2.0s" fill="freeze"
  calcMode="spline" keySplines="0.16 1 0.3 1" keyTimes="0;1"/>
```

#### 4. Stroke Draw-In (for boxes and lines)
```xml
<rect ... fill="none" stroke="#6366F1" stroke-width="2"
  stroke-dasharray="480" stroke-dashoffset="480">
  <animate attributeName="stroke-dashoffset" values="480;0"
    dur="1.5s" fill="freeze"
    calcMode="spline" keySplines="0.4 0 0.2 1"/>
</rect>
```

Calculate `stroke-dasharray` value: `2*(width + height)` for rectangles,
`2 * PI * r` for circles, or approximate for paths.

#### 5. Radial Glow Burst (for unlock/activation moments)
```xml
<circle cx="300" cy="300" r="0" fill="none"
  stroke="#F59E0B" stroke-width="1" opacity="0">
  <animate attributeName="r" values="0;30;40" dur="0.8s"
    begin="2.5s" fill="freeze"/>
  <animate attributeName="opacity" values="0;0.6;0"
    dur="0.8s" begin="2.5s" fill="freeze"/>
</circle>
```

Use 2-3 concentric bursts with staggered timing for dramatic effect.

#### 6. Line Reveal (connections between nodes)
```xml
<line x1="220" y1="300" x2="400" y2="300"
  stroke="#4B5563" stroke-width="1.5"
  stroke-dasharray="180" stroke-dashoffset="180" opacity="0.6">
  <animate attributeName="stroke-dashoffset" values="180;0"
    dur="0.6s" begin="3s" fill="freeze"/>
</line>
```

### Passive Idle Animations (Phase 4, begin="10s+")

These loop indefinitely after the entrance sequence completes.

#### Float (gentle vertical bob)
```xml
<animateTransform attributeName="transform" type="translate"
  values="0,0;0,-2;0,0;0,2;0,0" dur="4s"
  begin="10s" repeatCount="indefinite"/>
```

**Stagger idle starts** by 0.3s per element to prevent synchronized bobbing.
**Vary durations** slightly (3.6s, 3.8s, 4.0s, 4.2s) for organic feel.

#### Pulse (opacity oscillation)
```xml
<animate attributeName="fill-opacity" values="0.14;0.22;0.14"
  dur="4s" begin="10s" repeatCount="indefinite"/>
```

#### Glow Pulse (stroke breathing)
```xml
<animate attributeName="stroke-opacity" values="1;0.5;1"
  dur="3s" begin="10s" repeatCount="indefinite"/>
```

#### Wobble (subtle rotation)
```xml
<animateTransform attributeName="transform" type="rotate"
  values="0 300 300;2 300 300;0 300 300;-2 300 300;0 300 300"
  dur="4s" begin="10s" repeatCount="indefinite"/>
```

### Sweep Highlight Effect

A white gradient that sweeps across elements for polish:

```xml
<defs>
  <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="white" stop-opacity="0"/>
    <stop offset="0.35" stop-color="white" stop-opacity="0"/>
    <stop offset="0.5" stop-color="white" stop-opacity="0.2"/>
    <stop offset="0.65" stop-color="white" stop-opacity="0"/>
    <stop offset="1" stop-color="white" stop-opacity="0"/>
  </linearGradient>
  <clipPath id="clipLayer"><rect .../></clipPath>
</defs>

<rect ... fill="url(#sweepGrad)" clip-path="url(#clipLayer)" opacity="0">
  <animate attributeName="opacity" from="0" to="1" dur="0.05s"
    begin="9s" fill="freeze"/>
  <animateTransform attributeName="transform" type="translate"
    from="-700,0" to="700,0" dur="0.8s" begin="9s" fill="freeze"
    calcMode="spline" keySplines="0.4 0 0.2 1"/>
</rect>
```

---

## Easing Reference

| Easing | keySplines | Use |
|---|---|---|
| Smooth decelerate | `0.4 0 0.2 1` | Most entry animations |
| Strong overshoot | `0.16 1 0.3 1` | Slide-in movements |
| Linear (default) | omit calcMode | Simple fades |

Always use `calcMode="spline"` with `keyTimes="0;1"` for custom easing.

---

## Structural Patterns

### The Double-Rect Technique (Cards / Nodes)

Every card uses two overlapping rectangles — one for the glowing stroke, one for
the translucent fill:

```xml
<rect x="60" y="260" width="160" height="80" rx="12"
  fill="none" stroke="#6366F1" stroke-width="2"
  filter="url(#glow-indigo)"/>
<rect x="60" y="260" width="160" height="80" rx="12"
  fill="#6366F1" opacity="0.1"/>
```

This creates the signature "glowing card on dark background" look.

### Number Badges (Step Indicators)

```xml
<g opacity="0">
  <animate attributeName="opacity" from="0" to="1"
    begin="1.5s" dur="0.3s" fill="freeze"/>
  <circle cx="80" cy="452" r="14" fill="none"
    stroke="#6366F1" stroke-width="1.5" stroke-opacity="0.5"/>
  <text x="80" y="457" font-size="12" font-weight="700"
    fill="#6366F1" text-anchor="middle">1</text>
</g>
```

### Arrow Markers (Flow Diagrams)

```xml
<defs>
  <marker id="arrow-gray" markerWidth="8" markerHeight="6"
    refX="8" refY="3" orient="auto">
    <polygon points="0,0 8,3 0,6" fill="#4B5563"/>
  </marker>
</defs>

<line ... marker-end="url(#arrow-gray)"/>
```

### Character Figures (Problem Diagrams)

For "problem" diagrams, use a simple stick-figure developer with expressive
features (X eyes for frustration, frown line, V-collar for clothing):

```xml
<!-- Head -->
<circle cx="100" cy="258" r="20" fill="#0F172A"
  stroke="#8B5CF6" stroke-width="2"/>
<!-- X eyes -->
<line x1="88" y1="252" x2="94" y2="258"
  stroke="#8B5CF6" stroke-width="1.8" stroke-linecap="round"/>
<line x1="94" y1="252" x2="88" y2="258"
  stroke="#8B5CF6" stroke-width="1.8" stroke-linecap="round"/>
<!-- Frown -->
<line x1="90" y1="268" x2="110" y2="268"
  stroke="#8B5CF6" stroke-width="1.5" stroke-linecap="round"/>
```

### XML Comments as Section Dividers

Use heavy comment blocks to separate sections. This helps readability and
makes the SVG self-documenting:

```xml
<!-- ============================================ -->
<!-- PHASE 1: BUILD (0-2s)                         -->
<!-- ============================================ -->
```

---

## Diagram Types

### 1. Architecture / Stack Diagram
- **Pattern:** Stacked horizontal layers (pyramid or equal), bottom-to-top
- **Entry:** Each layer slides in from a different direction, staggered 1.5-2s apart
- **Idle:** Layers float independently with staggered timing
- **Extras:** Pyramid edge lines (dashed), number badges, sweep highlights
- **Reference:** `03_agentic_stack.svg`

### 2. Concept / Meta-Skill Diagram
- **Pattern:** Left-to-right flow — source → gate/lock → categories → leaf nodes
- **Entry:** Left element draws in, connection lines reveal, then nodes cascade
- **Idle:** Leaf nodes float with slight offsets, lock wobbles
- **Extras:** Glow burst on the "unlock" moment, tree branching layout
- **Reference:** `10_meta_skill.svg`

### 3. Problem Diagram
- **Pattern:** Central frustrated figure surrounded by chaotic scattered elements
- **Entry:** Figure appears first, then elements fly in from random directions
- **Idle:** Elements drift erratically, red glow pulses
- **Color:** Red dominant with muted accents to convey frustration
- **Reference:** `26_problem_skill_sprawl.svg`, `32_problem_team_sharing.svg`

### 4. Solution / Workflow Diagram
- **Pattern:** Sequential left-to-right phases with labeled stages
- **Entry:** Each phase reveals in order with connection arrows between them
- **Idle:** Elements pulse gently, arrows have flowing dash animation
- **Extras:** Phase labels at top, step numbers, dotted flow lines
- **Reference:** `27_solution_library_workflow.svg`, `45_solution_full_workflow.svg`

---

## Production Checklist

Before delivering any animated SVG, verify:

- [ ] `viewBox="0 0 800 600"` with `width="800" height="600"`
- [ ] `xmlns="http://www.w3.org/2000/svg"` present
- [ ] Inter + JetBrains Mono fonts imported in `<style>`
- [ ] All glow filters defined in `<defs>` before use
- [ ] All `fill="freeze"` on entry animations (not `remove`)
- [ ] Staggered `begin` delays — no two elements share the same start time
- [ ] Idle animations start at `begin="10s"` or later
- [ ] Idle durations are slightly varied (not all 4s)
- [ ] Double-rect technique used for all cards/nodes
- [ ] Text uses `text-anchor="middle"` for centered elements
- [ ] `rx` on all rectangles (8-12px) — no sharp corners
- [ ] Heavy XML comments separating each section
- [ ] No JavaScript — pure SMIL animations only
- [ ] Colors from the palette only — no arbitrary hex values
- [ ] Sweep highlight on at least one key element (optional but premium)

---

## Anti-Patterns — NEVER Do These

- **NEVER** use JavaScript or CSS animations — SMIL only for maximum compatibility
- **NEVER** animate everything at once — stagger is the entire aesthetic
- **NEVER** use more than 4 accent colors in one diagram
- **NEVER** use sharp-cornered rectangles (always `rx="8"` minimum)
- **NEVER** use default SVG text styling — always set font-family, weight, size
- **NEVER** skip glow filters — they are the signature visual identity
- **NEVER** use `repeatCount="indefinite"` on entry animations (only on idle)
- **NEVER** make idle animations large or distracting — they are subtle (±2px, ±2°)
- **NEVER** forget `fill="freeze"` on one-shot animations
- **NEVER** use background fills on the SVG root — keep transparent for dark themes

---

## Naming Convention

Name SVG files with a two-digit prefix for ordering:

```
images/
├── 03_agentic_stack.svg
├── 10_meta_skill.svg
├── 26_problem_skill_sprawl.svg
├── 27_solution_library_workflow.svg
├── 32_problem_team_sharing.svg
└── 45_solution_full_workflow.svg
```

In README.md, reference them as:
```markdown
![The Agentic Stack](images/03_agentic_stack.svg)
```

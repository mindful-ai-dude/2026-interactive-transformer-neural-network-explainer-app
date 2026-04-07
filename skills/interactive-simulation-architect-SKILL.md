---
name: interactive-simulation-architect
description: >
  Generate production-quality interactive HTML visualizations for technical
  education, scientific simulation, and immersive web experiences. Triggers on:
  "interactive visualization", "3D visualization", "simulation", "virtual lab",
  "interactive demo", "scientific visualization", "physics simulation",
  "molecular viewer", "planet generator", "optics lab", "keyboard visualizer",
  "fan page", "immersive webpage", "Canvas animation", "Three.js", "WebGL",
  or any request for a self-contained interactive HTML application with real-time
  rendering, control panels, and educational/scientific content. Also triggers
  when creating demos, prototypes, or training materials that need interactive
  visual components.
---

# Interactive Simulation Architect

Generate self-contained, single-file HTML applications with real-time rendering,
interactive controls, and cinematic dark-theme aesthetics. These are production-grade
educational visualizations — not throwaway demos.

Every output is ONE HTML file. No build tools, no frameworks, no external dependencies
beyond CDN-loaded libraries. Open the file in a browser and it works.

---

## Design System

### Dark Theme Foundation

All visualizations use a dark sci-fi aesthetic with these base values:

| Element | Value |
|---|---|
| Background | `#0a0f1a` → `#1a1f2e` → `#0d1520` (gradient) |
| Card/Panel BG | `rgba(15, 25, 40, 0.9)` with `backdrop-filter: blur(10px)` |
| Panel border | `1px solid rgba(0, 212, 255, 0.2)` |
| Border radius | `12px` on panels, `8px` on controls |
| Text primary | `#e0e6ed` |
| Text muted | `#8899aa` or `#9CA3AF` |
| Shadow | `0 8px 32px rgba(0, 0, 0, 0.3)` |

```css
body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 50%, #0d1520 100%);
  min-height: 100vh;
  color: #e0e6ed;
  margin: 0;
  overflow: hidden;
}
```

### Accent Colors

Each visualization picks 1-2 accent colors. These are the approved palette:

| Name | Hex | Glow rgba | Use |
|---|---|---|---|
| Cyan | `#00d4ff` | `rgba(0, 212, 255, 0.3)` | Primary interactive, links, labels |
| Green | `#00ff88` | `rgba(0, 255, 136, 0.3)` | Active states, success, highlights |
| Magenta | `#ff0066` | `rgba(255, 0, 102, 0.3)` | Alt accent, danger, cinematic |
| Amber | `#F59E0B` | `rgba(245, 158, 11, 0.3)` | Warm accent, warnings |
| Blue | `#2080ff` | `rgba(32, 128, 255, 0.3)` | Scientific, data-focused |

**Default pairing:** Cyan primary + Green secondary. This is the signature look.

### Glassmorphic Panels

Every control panel and info card uses this pattern:

```css
.panel {
  background: rgba(15, 25, 40, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 15px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

The `inset` white highlight on top creates a subtle glass edge effect.

### Interactive Controls

#### Select Dropdowns
```css
select {
  width: 100%;
  padding: 10px 15px;
  background: rgba(0, 20, 40, 0.8);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  color: #e0e6ed;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}
select:hover { border-color: #00d4ff; box-shadow: 0 0 15px rgba(0, 212, 255, 0.2); }
select:focus { border-color: #00ff88; box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
```

#### Buttons
```css
.btn {
  padding: 10px 15px;
  background: linear-gradient(180deg, rgba(0, 60, 90, 0.8), rgba(0, 40, 60, 0.9));
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  color: #e0e6ed;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.btn:hover {
  border-color: #00d4ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 212, 255, 0.3);
}
.btn.active {
  background: linear-gradient(180deg, rgba(0, 212, 255, 0.4), rgba(0, 150, 200, 0.5));
  border-color: #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}
```

#### Toggle with Indicator Dot
```css
.toggle-btn .indicator {
  width: 12px; height: 12px; border-radius: 50%;
  background: #ff4444;
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
  transition: all 0.3s ease;
}
.toggle-btn.active .indicator {
  background: #00ff88;
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.7);
}
```

#### Sliders
```css
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: rgba(0, 212, 255, 0.2);
  border-radius: 2px;
  outline: none;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px; height: 16px;
  background: #00d4ff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}
```

### Control Panel Labels

```css
.control-group label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #00d4ff;
  margin-bottom: 10px;
}
```

### Title / Header

Shimmer gradient text for the main title:

```css
.header h1 {
  font-size: 2rem;
  font-weight: 300;
  letter-spacing: 4px;
  text-transform: uppercase;
  background: linear-gradient(90deg, #00d4ff, #00ff88, #00d4ff);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}
@keyframes shimmer {
  to { background-position: 200% center; }
}
```

---

## Page Layout Patterns

### Pattern A: Full-Screen Canvas + Floating Panels (3D visualizations)

```
┌──────────────────────────────────────────────────┐
│  ┌────────── TITLE (centered, floating) ────────┐│
│  └──────────────────────────────────────────────┘│
│  ┌─────────┐                      ┌────────────┐│
│  │ Controls │    FULL-SCREEN       │ Info Panel ││
│  │ (left)   │    CANVAS/WebGL      │ (right)    ││
│  │          │                      │            ││
│  └─────────┘                      └────────────┘│
│                ┌─── Stats Bar ───┐               │
└──────────────────────────────────────────────────┘
```

- Canvas is `position: fixed; top: 0; left: 0; width: 100%; height: 100%`
- All UI is `position: fixed; z-index: 10` with `pointer-events: none` on overlay,
  `pointer-events: auto` on children

### Pattern B: Split Layout (2D labs/simulations)

```
┌──────────────────────────────────────────────────┐
│  ┌────────── TITLE BAR (full width) ───────────┐ │
│  └──────────────────────────────────────────────┘│
│  ┌──────────────┐  ┌───────────────────────────┐│
│  │  Controls     │  │                           ││
│  │  (30% left)   │  │    Canvas Area            ││
│  │               │  │    (70% right)            ││
│  │  + Data Panel │  │                           ││
│  └──────────────┘  └───────────────────────────┘│
└──────────────────────────────────────────────────┘
```

### Pattern C: Scroll-based Sections (fan pages/showcases)

```
┌──────────────────────────────────────────────────┐
│  HERO (full viewport, parallax background)       │
├──────────────────────────────────────────────────┤
│  SECTION 1 (timeline, cards, etc.)               │
├──────────────────────────────────────────────────┤
│  SECTION 2 (character cards grid)                │
├──────────────────────────────────────────────────┤
│  SECTION N (quote wall, gallery, etc.)           │
└──────────────────────────────────────────────────┘
```

---

## Technology Selection

### When to Use Three.js (3D)
- Molecular structures, planetary bodies, 3D objects
- Needs orbit controls (rotate, zoom, pan)
- Shader effects, particle systems, lighting
- Load from CDN: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
- OrbitControls: load separately from Three.js examples CDN

### When to Use Canvas 2D
- Physics simulations, optics, mechanical diagrams
- 2D interactive elements (drag, click)
- Custom drawing with precise control
- No external dependencies needed

### When to Use CSS + DOM
- Scroll-based pages, card layouts, text-heavy content
- Parallax effects, hover interactions
- Typewriter reveals, glitch effects
- Combine with Canvas for background effects

### Animation Loop Pattern

Always use `requestAnimationFrame`:

```javascript
const clock = { start: performance.now() };
function animate() {
  requestAnimationFrame(animate);
  const elapsed = (performance.now() - clock.start) / 1000;
  // Update simulation state
  // Render frame
}
animate();
```

---

## Visualization Archetypes

### 1. Molecular / Structural Viewer (Three.js)
- Atom spheres with element-specific colors and radii
- Bond cylinders connecting atoms
- Ball-and-stick vs. space-filling display modes
- OrbitControls for rotation/zoom
- Atom hover highlighting with emissive glow
- Info panel showing element properties
- Legend showing atom types present
- Particle background with shader animation
- **Reference:** Molecular Structure Visualizer

### 2. Mechanical / Engineering Simulation (Canvas 2D)
- Cutaway/cross-section view of mechanism
- Interactive drag to actuate moving parts
- Spring physics, contact detection
- Real-time status readouts (distance, force, state)
- Multiple modes (e.g., Linear Red vs. Clicky Blue)
- Spark/glow effects on state transitions
- Press-test button for quick demo
- **Reference:** Mechanical Keyboard Switch Visualization

### 3. Scientific Lab / Optics Simulation (Canvas 2D)
- Split layout: controls (30%) + canvas (70%)
- Physics formulas driving the simulation (e.g., Gaussian lens formula)
- Draggable objects on the canvas
- Real-time ray tracing / light paths
- Data panel showing computed values
- Lens selection, parameter sliders
- Grid/axis system with measurements
- **Reference:** Geometric Optics Lab

### 4. Procedural 3D Generator (Three.js + Shaders)
- Perlin noise terrain/surface generation
- Multiple visualization modes (height map, temperature, humidity)
- Sliders for real-time parameter adjustment
- Day/night cycle with directional lighting
- Atmospheric rendering (glow rim, haze)
- Regenerate button for new random seeds
- **Reference:** Planet Generator

### 5. Cinematic Fan Page / Showcase (CSS + Canvas)
- Full-viewport hero with parallax
- Glitch/neon text effects (CSS animations)
- CRT scanlines, film grain overlays
- Character/feature cards with hover micro-interactions
- Typewriter text reveal on scroll
- Quote wall or timeline sections
- Atmospheric background (rain, particles, fog)
- **Reference:** Blade Runner Fan Page

---

## File Structure

Every visualization is a SINGLE self-contained HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Visualization Title]</title>
  <style>
    /* ALL CSS HERE — no external stylesheets */
  </style>
</head>
<body>
  <!-- HTML structure: canvas container + UI overlay panels -->

  <!-- CDN scripts (Three.js etc.) loaded here if needed -->
  <script>
    // ALL JavaScript here — no modules, no build tools
    // 1. Scene/canvas setup
    // 2. Data definitions (molecules, parameters, etc.)
    // 3. Rendering functions
    // 4. Interaction handlers
    // 5. Animation loop
    // 6. Initialize and start
  </script>
</body>
</html>
```

**NEVER split into multiple files.** The entire application lives in one HTML file.
CDN-hosted libraries (Three.js, OrbitControls) are the only external references.

---

## Production Checklist

Before delivering any visualization:

- [ ] Single HTML file — no external CSS/JS files
- [ ] Dark theme with `#0a0f1a` gradient background
- [ ] Glassmorphic panels with backdrop blur
- [ ] Cyan/green accent pair (or justified alternative)
- [ ] Shimmer gradient title
- [ ] All controls have hover/active glow states
- [ ] `requestAnimationFrame` loop (not `setInterval`)
- [ ] Responsive: `window.addEventListener('resize', ...)` handler
- [ ] Labels are uppercase with letter-spacing
- [ ] All transitions use `0.3s ease`
- [ ] Interactive elements have `cursor: pointer`
- [ ] Info panel updates in real-time on interaction
- [ ] No console errors on load
- [ ] Works in Chrome, Firefox, Safari
- [ ] File loads instantly from local filesystem (no CORS issues)

---

## Anti-Patterns — NEVER Do These

- **NEVER** split into multiple files — everything in one HTML file
- **NEVER** use light/white backgrounds — always dark theme
- **NEVER** use plain unstyled HTML controls — all controls get the dark glassmorphic treatment
- **NEVER** use `setInterval` for animation — always `requestAnimationFrame`
- **NEVER** skip the glow/hover effects on interactive elements
- **NEVER** use inline event handlers (`onclick="..."`) — use `addEventListener`
- **NEVER** hardcode canvas dimensions — always read from container/window
- **NEVER** skip the resize handler
- **NEVER** load external CSS files or JS modules (CDN scripts are OK)
- **NEVER** use default browser fonts — always set `font-family`
- **NEVER** forget the `overflow: hidden` on body for full-screen layouts

# Vite 8 Architect — System Prompt Block

> **Purpose:** Drop this into any system prompt, AGENTS.md, or custom instructions
> to prevent AI agents from generating outdated Vite 5/6/7 configurations. Vite 8
> replaced its entire internal architecture — your training data is wrong.

---

```xml
<vite8_architect_protocol>
<mandate>
When creating, modifying, or recommending ANY Vite configuration, use Vite 8
patterns exclusively. Vite 8 (early 2026) replaced its dual-bundler architecture
(esbuild + Rollup) with a unified Rust-based stack (Rolldown + Oxc). Your training
data almost certainly contains Vite 5/6/7 patterns that produce broken or
suboptimal builds. Do NOT generate Vite config from memory.
</mandate>

<current_versions>
Verified March 31, 2026 — re-verify live before using:
  Vite: 8.0.3 (Rolldown-powered)
  @vitejs/plugin-react: 6.0.1 (Oxc-based, no Babel)
  React: 19.2.4
  React DOM: 19.2.4
  Node.js required: 20.19+ or 22.12+
</current_versions>

<architecture_change>
BEFORE (Vite 5/6/7 — DO NOT USE):
  Dev: esbuild (transforms) + Rollup (bundling)
  Prod: Rollup (bundling) + esbuild (minification)
  CSS: PostCSS default + optional LightningCSS
  React: @vitejs/plugin-react v4/v5 (Babel-based)

AFTER (Vite 8 — USE THIS):
  Dev: Rolldown (bundling) + Oxc (transforms)
  Prod: Rolldown (bundling) + Oxc (transforms)
  CSS: LightningCSS (bundled, no install needed)
  React: @vitejs/plugin-react v6 (Oxc-based, no Babel)

Key: Same bundler for dev AND prod. No more inconsistencies.
10-30x faster builds. No Babel. No esbuild.
</architecture_change>

<reference_config>
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],           // v6 = Oxc, no Babel config needed
  build: {
    outDir: 'dist',
    cssMinify: 'lightningcss',  // Bundled, no install needed
    rollupOptions: {
      output: {
        manualChunks: { 'react-vendor': ['react', 'react-dom'] }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    forwardConsole: true         // NEW: browser logs in terminal
  },
  esbuild: false                 // Rolldown/Oxc handles transforms
})
</reference_config>

<new_features>
- forwardConsole: true — Browser console.log appears in terminal
- resolve: { tsconfigPaths: true } — Built-in TS path alias support
- devtools: true — Integrated Vite Devtools
- emitDecoratorMetadata — Built-in, no plugins needed
</new_features>

<package_json_template>
Dependencies: react, react-dom (^19.2.4)
DevDependencies: vite (^8.0.3), @vitejs/plugin-react (^6.0.1)
NO Babel packages. NO @babel/core. NO @babel/preset-react.
type: "module"
engines.node: ">=20.19.0"
</package_json_template>

<never_do>
- NEVER include Babel dependencies — Oxc handles JSX natively
- NEVER use @vitejs/plugin-react v4 or v5 — use v6
- NEVER configure esbuild transforms — set esbuild: false
- NEVER install LightningCSS separately — bundled with Vite 8
- NEVER use @vitejs/plugin-react-swc — Oxc replaces SWC
- NEVER generate config from training memory — Vite 8 is too new
- NEVER keep .babelrc or babel.config.js — delete them
- NEVER skip Node.js version check — requires 20.19+ or 22.12+
</never_do>

<red_flags>
If you see ANY of these, the config is outdated:
  @babel/core in package.json → Remove (Oxc handles JSX)
  @vitejs/plugin-react v4/v5 → Upgrade to v6
  @vitejs/plugin-react-swc → Replace with plugin-react v6
  .babelrc file → Delete
  esbuild: { ... } in config → Set esbuild: false
  Separate lightningcss install → Remove (bundled)
  Node.js < 20.19 → Upgrade
</red_flags>
</vite8_architect_protocol>
```

---

## Usage Notes

| Environment | Location |
|---|---|
| Claude Code | `AGENTS.md` or `skills/vite8-architect/SKILL.md` |
| Cursor | `.cursorrules` or `.cursor/rules/` |
| Claude.ai | System prompt or project instructions |
| Any agent | Prepend to system context |

**For the full design system** with migration guide, performance benchmarks,
Rolldown/Oxc reference tables, and deployment notes, use the detailed SKILL.md.

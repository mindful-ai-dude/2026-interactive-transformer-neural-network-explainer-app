---
name: vite8-architect
description: >
  Enforce correct Vite 8 configuration with Rolldown, Oxc, and LightningCSS when
  creating or modifying any Vite-based project. Triggers on: "Vite", "vite.config",
  "Vite 8", "Rolldown", "Oxc", "@vitejs/plugin-react", "vite build", "vite dev",
  "React project setup", "frontend build tool", "bundler config", or any task
  involving creating, scaffolding, or configuring a Vite-powered frontend project.
  Also triggers when upgrading from Vite 5/6/7 or when an LLM generates outdated
  Vite patterns (esbuild transforms, Babel plugins, separate Rollup config).
  Do NOT trigger for Webpack, Parcel, or non-Vite build configurations.
---

# Vite 8 Architect

Ensure AI agents generate correct Vite 8 configurations using Rolldown, Oxc, and
LightningCSS — not outdated Vite 5/6/7 patterns from training data.

## Why This Skill Exists

Vite 8 (released early 2026) is the biggest architectural change in Vite's history.
It replaces the dual-bundler approach (esbuild for dev + Rollup for production) with
a single unified Rust-based stack: Rolldown for bundling and Oxc for compilation.
Most LLMs were trained on Vite 5/6/7 patterns and will generate incorrect configs
that use esbuild transforms, Babel-based React plugins, or separate CSS tooling
that Vite 8 no longer needs.

**If you generate Vite config from training data, you will produce broken or
suboptimal builds.** Always reference this skill instead.

---

## Current Versions (Verified March 31, 2026)

| Package | Version | Notes |
|---|---|---|
| Vite | 8.0.3 | Rolldown-powered, 10-30x faster |
| @vitejs/plugin-react | 6.0.1 | Uses Oxc (no Babel) |
| React | 19.2.4 | Latest stable |
| React DOM | 19.2.4 | Latest stable |

**IMPORTANT:** These versions were verified as of March 31, 2026. Before using
them, follow the dependency-guard protocol — search for the latest versions live.

### Node.js Requirements

Vite 8 requires **Node.js 20.19+ or 22.12+** (needs `require(esm)` without flag).

---

## The Vite 8 Architecture (What Changed)

### Before (Vite 5/6/7) — DO NOT USE

```
Dev Server:  esbuild (transforms) + Rollup (bundling)
Production:  Rollup (bundling) + esbuild (minification)
CSS:         PostCSS (default) + optional LightningCSS
React:       @vitejs/plugin-react v4/v5 (Babel-based)
```

**Problems:** Two different bundlers meant dev/prod inconsistencies. Babel was
slow. CSS tooling required separate installation.

### After (Vite 8) — USE THIS

```
Dev Server:  Rolldown (bundling) + Oxc (transforms)
Production:  Rolldown (bundling) + Oxc (transforms)
CSS:         LightningCSS (bundled, no install needed)
React:       @vitejs/plugin-react v6 (Oxc-based, no Babel)
```

**Benefits:** One bundler for dev and prod (no inconsistencies). Oxc replaces
both esbuild and Babel. LightningCSS is included. 10-30x faster builds.

---

## Reference Configuration

This is the canonical `vite.config.js` for Vite 8:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],  // v6 uses Oxc — no Babel, no extra config

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssMinify: 'lightningcss',  // Bundled with Vite 8, no install needed
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom']
        }
      }
    }
  },

  server: {
    port: 3000,
    host: true,
    forwardConsole: true  // NEW: Browser console logs appear in terminal
  },

  esbuild: false  // Rolldown/Oxc handles all transformations
})
```

### Key Configuration Points

#### `esbuild: false`
Explicitly disables esbuild since Rolldown/Oxc now handles all transformations.
This is the single biggest signal that a config is Vite 8-aware.

#### `cssMinify: 'lightningcss'`
LightningCSS is bundled with Vite 8. No `npm install` needed. It provides better
CSS minification than the previous default.

#### `forwardConsole: true`
New Vite 8 feature — browser `console.log` calls appear in your terminal. Extremely
useful for debugging server-side rendered content and catching client-side errors
without opening browser devtools.

#### `plugins: [react()]`
`@vitejs/plugin-react` v6 uses Oxc internally. No Babel. No `@babel/plugin-*`
dependencies. No `.babelrc`. If you see Babel config in a Vite 8 project, it's wrong.

---

## New Vite 8 Features

### Browser Console Forwarding
```javascript
server: {
  forwardConsole: true
}
```

### Built-in TypeScript Path Aliases
```javascript
resolve: {
  tsconfigPaths: true  // Reads paths from tsconfig.json automatically
}
```

### emitDecoratorMetadata Support
Built-in — no external plugins needed for TypeScript decorators.

### Integrated Devtools
```javascript
devtools: true  // Enable Vite Devtools for performance debugging
```

---

## Rolldown Bundler Reference

Rolldown is the unified Rust-based bundler that replaced esbuild + Rollup:

| Aspect | Detail |
|---|---|
| Language | Rust |
| Creator | VoidZero team (same as Vite core) |
| Performance | 10-30x faster than Rollup |
| Plugin API | Rollup-compatible — most Rollup plugins work unchanged |
| Dev/Prod | Same bundler for both (no more inconsistencies) |
| Docs | https://rolldown.rs/ |

### Compatibility
- `rollupOptions` in `vite.config.js` still works — Rolldown accepts Rollup config
- Most Rollup plugins work without modification
- Vite 8 has a compatibility layer that auto-converts esbuild options

---

## Oxc Compiler Reference

Oxc replaces both esbuild (for transforms) and Babel (for React):

| Aspect | Detail |
|---|---|
| Language | Rust |
| Replaces | esbuild transforms + Babel |
| Features | JSX, TypeScript, tree-shaking with semantic analysis |
| Docs | https://oxc.rs/ |

---

## Performance Benchmarks

Real-world Vite 8 build time improvements:

| Company | Improvement |
|---|---|
| Linear | 46s → 6s (87% reduction) |
| Ramp | 57% build time reduction |
| Mercedes-Benz.io | Up to 38% reduction |
| Beehiiv | 64% build time reduction |

---

## Migration from Vite 5/6/7

Vite 8's compatibility layer handles most migrations automatically, but verify:

1. **Remove Babel dependencies** — `@babel/core`, `@babel/preset-react`,
   `@babel/plugin-*` are no longer needed
2. **Update `@vitejs/plugin-react`** to v6 — it uses Oxc, not Babel
3. **Remove separate LightningCSS install** — it's bundled now
4. **Set `esbuild: false`** in config (optional but explicit)
5. **Remove `.babelrc`** or `babel.config.js` files
6. **Test for plugin compatibility** — most Rollup plugins work, but verify

---

## Package.json Template

```json
{
  "name": "my-vite8-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "vite": "^8.0.3",
    "@vitejs/plugin-react": "^6.0.1"
  },
  "engines": {
    "node": ">=20.19.0"
  }
}
```

Notice: **No Babel packages.** No `@babel/core`, no `@babel/preset-react`.
The React plugin v6 handles JSX via Oxc natively.

---

## Deployment Notes

Vite 8's Rolldown output is standard static files:

1. Build: `vite build`
2. Output: `dist/`
3. Assets are hashed for cache-busting
4. Compatible with all static hosting (Hostinger, Vercel, Netlify, Cloudflare Pages)

---

## Anti-Patterns — NEVER Do These

- **NEVER** include Babel dependencies (`@babel/core`, `@babel/preset-react`) —
  Oxc handles JSX natively via `@vitejs/plugin-react` v6
- **NEVER** use `@vitejs/plugin-react` v4 or v5 — use v6 for Oxc support
- **NEVER** configure `esbuild` transforms — Rolldown/Oxc handles everything
- **NEVER** install LightningCSS separately — it's bundled with Vite 8
- **NEVER** use `@vitejs/plugin-react-swc` — Oxc replaces SWC in the Vite 8 stack
- **NEVER** generate Vite config from training-data memory — Vite 8 is too new,
  your training data will produce Vite 5/6/7 patterns
- **NEVER** assume Rollup plugins are incompatible — Rolldown uses the same API,
  most plugins work without changes
- **NEVER** use `.babelrc` or `babel.config.js` — these files should not exist
  in a Vite 8 project
- **NEVER** skip the Node.js version check — Vite 8 requires 20.19+ or 22.12+

---

## Quick Diagnostic

If you see ANY of these in a Vite project, the config is outdated:

| Red Flag | Correct Vite 8 Approach |
|---|---|
| `@babel/core` in package.json | Remove — Oxc handles JSX |
| `@vitejs/plugin-react` v4/v5 | Upgrade to v6 |
| `@vitejs/plugin-react-swc` | Replace with `@vitejs/plugin-react` v6 |
| `.babelrc` file exists | Delete it |
| `esbuild: { ... }` in config | Set `esbuild: false` |
| `postcss.config.js` for basic CSS | Use LightningCSS (bundled) |
| Separate lightningcss install | Remove — it's bundled with Vite 8 |
| Node.js < 20.19 | Upgrade Node.js |

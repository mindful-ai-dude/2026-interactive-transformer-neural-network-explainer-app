# AGENTS.md

> Cross-tool agent instructions. Works with Claude Code, Codex, Cursor, Copilot,
> Gemini CLI, Devin, Jules, Amp, VS Code, and any AAIF-compatible agent.

---

## Identity

- **Project:** Transformer Explainer
- **Language:** TypeScript 5.x / Svelte 5
- **Framework:** SvelteKit 2 + Svelte 5 + Vite 8
- **Package Manager:** pnpm

---

## Build & Run

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint & format
pnpm lint
pnpm format

# Type checking
pnpm check
```

---

## Project Structure

```
src/
  components/       # Svelte components (visualization, UI, popovers, textbook)
  components/common/   # Shared/reusable components (Arrow, Matrix, Slider, etc.)
  components/Popovers/ # Weight and operation popover components
  components/textbook/ # Textbook panel components
  components/article/  # Article section component
  routes/           # SvelteKit route pages (+page.svelte, +layout.svelte)
  store/            # Svelte writable stores for global state
  utils/            # Helper functions (data processing, animation, model)
  utils/model/      # Python scripts for ONNX model export (not runtime)
  constants/        # Example data and configuration constants
  types/            # TypeScript type declarations
  styles/           # Global SCSS styles and variables
static/             # Static assets (ONNX model chunks, images, favicon)
docs/               # Architecture docs, skill READMEs
skills/             # AI agent skill files (SKILL.md format)
prompts/            # AI agent prompt blocks
```

---

## Code Conventions

- All components use TypeScript with `lang="ts"` in `<script>` blocks
- Use `~` path alias for imports (maps to `./src`), never deep relative imports
- SCSS for component styles with `lang="scss"`, global variables in `src/styles/variables.scss`
- PascalCase for Svelte components, camelCase for functions and variables
- Tests use the `.test.ts` or `.svelte.test.ts` extension

Do NOT duplicate linter rules here. Run the lint command above and fix what it catches.

---

## Patterns to Follow

- Use Svelte 5 runes (`$state`, `$derived`, `$effect`) for component-local state
- Use `svelte/store` writable/derived stores for cross-component shared state
- Use D3.js for data-driven visualizations (Sankey diagrams, matrices)
- Use GSAP for complex animations and transitions
- Use `onMount` for browser-only initialization (model loading, observers)
- Use `$:` reactive declarations for derived computations in legacy Svelte 4 syntax (migration to runes ongoing)

## Patterns to Avoid

- No React patterns — this is a Svelte project
- No direct DOM manipulation outside D3/GSAP visualization code
- No hardcoded secrets — use environment variables
- No Babel plugins or esbuild config — Vite 8 uses Rolldown + Oxc
- No default exports except for Svelte components and route pages
- No importing `tailwindcss/resolveConfig` at runtime — extract needed values to constants

---

## Git Workflow

- Always create a feature branch before making changes: `git checkout -b feat/description`
- Write conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Never commit directly to `main`
- Never commit secrets, API keys, tokens, or `.env` files
- Run tests before committing. If tests fail, fix them before proceeding.

---

## Dependency Guard Protocol

**CRITICAL: This section is non-negotiable and overrides training-data knowledge.**

Before writing, recommending, or modifying ANY code that involves external
dependencies, libraries, frameworks, APIs, or tooling:

### 1. Anchor the Date
Verify today's actual date using any available tool (web search, system clock,
MCP tools, browser). Store as `{{TODAY}}`. If no real-time tool is available,
mark all version recommendations as `⚠️ UNVERIFIED`.

### 2. Verify Every Dependency
For each package you reference:
- **Search** the canonical registry (PyPI, npm, crates.io, etc.) for the latest
  stable release as of `{{TODAY}}`.
- **Check maintenance** — flag if no release in 12+ months, suggest alternatives.
- **Check vulnerabilities** — search CVE databases, GitHub Advisories, Snyk.
  Never recommend a version with a known HIGH/CRITICAL CVE.
- **Confirm compatibility** with this project's runtime and existing dependencies.
- **Apply current best practices** — if an approach has been superseded, say so.

### 3. Version Strategy (Context-Aware)

**For scripts, tutorials, and quick-start code:**
Use bare package names in install commands. The package manager resolves the
genuinely latest version at execution time. State the verified version in a comment.
```bash
# As of {{TODAY}}, latest stable: vite 8.0.x, svelte 5.55.x
pnpm add svelte
pnpm add -D vite @sveltejs/kit
```

**For this project (production):**
Pin exact versions in dependency manifests. Always use a lock file. Recommend
Dependabot or Renovate for automated version updates.
```json
// package.json — Verified {{TODAY}}
"devDependencies": {
  "vite": "^8.0.3",
  "svelte": "^5.55.1",
  "@sveltejs/kit": "^2.56.1"
}
// pnpm-lock.yaml committed to version control
```

### 4. Never Do These
- Never recommend a version from training-data memory without live verification.
- Never say "use the latest" without stating what the latest version IS.
- Never skip vulnerability checks for dev dependencies.
- Never assume a package still exists or hasn't been renamed/deprecated.
- Never hardcode a stale training-data version into an install command.

---

## Skills & Progressive Disclosure

When you need specialized instructions for a particular task type, read the
relevant skill file BEFORE starting work:

### Skills (Agent reads these)

| Task | Skill Location |
|---|---|
| Dependency verification | `skills/dependency-guard-SKILL.md` |
| Animated SVG diagrams | `skills/visual-diagram-narrator-SKILL.md` |
| Interactive HTML visualizations | `skills/interactive-simulation-architect-SKILL.md` |
| Vite 8 configuration | `skills/vite8-architect-SKILL.md` |

### Prompts (For web chat / API / system prompts)

| Skill | Prompt Location |
|---|---|
| Dependency verification | `prompts/dependency-guard-prompt.md` |
| Animated SVG diagrams | `prompts/visual-diagram-narrator-prompt.md` |
| Interactive HTML visualizations | `prompts/interactive-simulation-architect-prompt.md` |
| Vite 8 configuration | `prompts/vite8-architect-prompt.md` |

### Documentation (Human reference)

| Skill | README Location |
|---|---|
| Dependency verification | `docs/Dependency Guard Protocol-README.md` |
| Animated SVG diagrams | `docs/visual-diagram-narrator-README.md` |
| Interactive HTML visualizations | `docs/Interactive Simulation Architect-README.md` |
| Vite 8 configuration | `docs/Vite 8 Architect-README 3.md` |

Do NOT preload all skills into context. Read only what the current task requires.

---

## Environment & Infrastructure

- **Runtime:** Node.js 22 LTS (Vite 8 requires 20.19+ or 22.12+)
- **Build Tool:** Vite 8 (Rolldown + Oxc + LightningCSS)
- **Package Manager:** pnpm
- **CSS Framework:** TailwindCSS 3.4 + Flowbite-Svelte
- **Deployment:** GitHub Pages (via gh-pages, static adapter)
- **CI/CD:** GitHub Actions
- **Model:** GPT-2 ONNX (chunked, loaded via onnxruntime-web)
- **Secrets:** Loaded from environment variables, never committed

---

## Review Checklist

Before presenting any code change, verify:
- [ ] Tests pass (`pnpm test`)
- [ ] Linter passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Type checking passes (`pnpm check`)
- [ ] No secrets or credentials in the diff
- [ ] Dependency versions verified live (not from training data)
- [ ] Conventional commit message written
- [ ] Changes are on a feature branch, not `main`

---

## When You're Stuck

1. Search the codebase first (`grep -r`, `find`, glob patterns)
2. Read relevant docs in `docs/`
3. Check existing tests for usage patterns
4. Ask the user — don't guess at business logic

---

*This file is a living document. Update it whenever a code review reveals
a missing convention or a repeated mistake.*

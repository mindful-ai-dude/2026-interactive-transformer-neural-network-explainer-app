# Hostinger Cloud Deployer — System Prompt Block

> **Purpose:** Drop this into any system prompt, AGENTS.md, or custom instructions
> to ensure correct deployment of Vite 8 + React apps to Hostinger Cloud Startup.
> Hostinger's defaults use Vite 7 and Babel — this overrides them with our stack.

---

```xml
<hostinger_cloud_deployer_protocol>
<mandate>
When deploying any application to Hostinger Cloud Startup, use this configuration.
Hostinger's auto-detection and documentation default to Vite 7.x with Babel-based
React plugins. Our stack uses Vite 8 with Rolldown/Oxc. Always override Hostinger's
defaults with our versions. This is Cloud Startup ONLY — NOT VPS.
</mandate>

<platform>
Plan: Hostinger Cloud Startup (also works on Cloud Professional/Enterprise)
Node.js: 24.x (set via "engines" in package.json)
Deploy methods: GitHub integration (recommended) or .zip file upload
Build runner: Hostinger runs npm internally (even though we use pnpm locally)
Port: MUST use process.env.PORT || 3000 (never hardcode)
</platform>

<version_overrides>
Hostinger defaults are OUTDATED. Always use our Vite 8 stack:
  Vite: 8.0.3 (NOT 7.3.1)
  @vitejs/plugin-react: 6.0.1 (NOT 4.3.4 — Oxc, no Babel)
  React: 19.2.4 (NOT 19.2.0)
  React DOM: 19.2.4
  Express: 5.2.1
  Node.js: 24.x
Pin ALL versions exactly — no ^ or ~ for Hostinger production deploys.
Verify versions live via dependency-guard protocol before deploying.
</version_overrides>

<package_json>
Required fields for Hostinger:
  "type": "module"
  "main": "server/index.js"         — Hostinger reads this for entry point
  "engines": { "node": "24.x" }     — tells Hostinger which Node version
  "scripts.build": "vite build"     — Hostinger runs this during deploy
  "scripts.start": "node server/index.js" — Hostinger runs this after build
No Babel packages. No @babel/core. No @babel/preset-react.
</package_json>

<express_server>
Hostinger Cloud Startup requires an Express server at server/index.js:
  - Serve static files from dist/ (Vite build output)
  - SPA fallback: app.get('*') serves dist/index.html
  - Port: process.env.PORT || 3000 (CRITICAL — never hardcode)
</express_server>

<deploy_via_github>
1. hPanel → Websites → Add Website → Node.js Apps
2. Connect with GitHub → Authorize → Select repo
3. Verify build settings: build cmd = "npm run build", output = "dist",
   entry = "server/index.js"
4. Add environment variables BEFORE deploying
5. Click Deploy — auto-deploys on every git push afterward
</deploy_via_github>

<pnpm_npm_bridge>
We use pnpm locally, Hostinger runs npm internally. This works because:
  - package.json is package-manager-agnostic
  - Build scripts use "vite build" not "pnpm build"
  - Hostinger ignores pnpm-lock.yaml, generates its own package-lock.json
Always test with "pnpm build" locally before pushing.
</pnpm_npm_bridge>

<database_turso_cloud>
We use Turso Cloud (SQLite-compatible, free tier) instead of Hostinger's MySQL.
Package: @libsql/client (pure JS, no native compilation, works on Hostinger)
Install: pnpm add @libsql/client

Connection in server/db.js:
  import { createClient } from '@libsql/client';
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  export default db;

hPanel Environment Variables (add BEFORE deploying):
  TURSO_DATABASE_URL=libsql://your-db-yourorg.region.turso.io
  TURSO_AUTH_TOKEN=your-auth-token

CRITICAL rules:
  - NEVER prefix with VITE_ (exposes tokens to frontend browser bundle)
  - ALWAYS use parameterized queries: { sql: '...?', args: [value] }
  - Create ONE client instance at module level, reuse across all routes
  - Define API routes BEFORE static middleware and SPA wildcard fallback
  - Use db.batch([...], 'write') for multiple writes in one transaction
</database_turso_cloud>

<deployment_checklist>
Package and Build:
- All versions pinned (no ^ or ~)
- @libsql/client in dependencies (if using Turso)
- "build": "vite build" in scripts
- "start": "node server/index.js" in scripts
- "main": "server/index.js" set
- "engines": { "node": "24.x" } set
- No Babel packages, no .babelrc
- pnpm build succeeds locally
Server and Config:
- Server uses process.env.PORT || 3000
- API routes defined BEFORE static middleware and SPA fallback
- esbuild: false in vite.config.js
Database and Secrets:
- Turso database created at app.turso.tech
- Auth token generated and saved
- TURSO_DATABASE_URL added in hPanel
- TURSO_AUTH_TOKEN added in hPanel
- No .env files committed
- No VITE_ prefix on secret keys
</deployment_checklist>

<never_do>
- NEVER use ^ or ~ in Hostinger production package.json
- NEVER hardcode ports — always process.env.PORT || 3000
- NEVER commit .env files — use hPanel Environment Variables
- NEVER accept Hostinger's default Vite 7 — override with Vite 8
- NEVER include Babel dependencies — Vite 8 uses Oxc
- NEVER confuse Cloud Startup with VPS — completely different process
- NEVER use process.env for Vite frontend vars — use import.meta.env
- NEVER deploy without testing pnpm build locally first
- NEVER prefix database tokens with VITE_ — exposes them to browser
- NEVER hardcode Turso URLs or tokens in source code
- NEVER use string concatenation for SQL — use parameterized queries
- NEVER create new createClient() per request — reuse one instance
- NEVER define API routes AFTER the SPA wildcard fallback
</never_do>
</hostinger_cloud_deployer_protocol>
```

---

## Usage Notes

| Environment | Location |
|---|---|
| Claude Code | `AGENTS.md` or `skills/hostinger-cloud-deployer/SKILL.md` |
| Cursor | `.cursorrules` or `.cursor/rules/` |
| Claude.ai | System prompt or project instructions |
| Any agent | Prepend to system context |

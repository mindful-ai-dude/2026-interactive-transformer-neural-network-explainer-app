---
name: hostinger-cloud-deployer
description: >
  Guide deployment of React + Vite 8 applications to Hostinger Cloud Startup
  (NOT VPS). Triggers on: "deploy", "Hostinger", "Cloud Startup", "hPanel",
  "deployment", "go live", "push to production", "hosting", "build for production",
  "deploy to Hostinger", or any task involving deploying a frontend or full-stack
  Node.js application to Hostinger Cloud hosting. Also triggers when configuring
  package.json for Hostinger, setting up GitHub integration with Hostinger, or
  troubleshooting Hostinger deployment issues. Do NOT trigger for Hostinger VPS
  deployments (those require manual CLI configuration — separate skill).
---

# Hostinger Cloud Deployer

Deploy React + Vite 8 applications to Hostinger Cloud Startup correctly. This
skill bridges our Vite 8 stack with Hostinger's deployment platform, flagging
where Hostinger's default settings need adjustment for our architecture.

## Why This Skill Exists

Hostinger's official documentation and auto-detection defaults use Vite 7.x
with Babel-based React plugins. Our stack uses Vite 8 with Rolldown/Oxc.
Deploying without adjustments will either fail or produce suboptimal builds.
This skill ensures the deployment config matches our actual stack.

---

## Platform: Hostinger Cloud Startup

### Supported Plans

Node.js web applications work on these Hostinger plans:

- Business Web Hosting
- **Cloud Startup** ← our plan
- Cloud Professional
- Cloud Enterprise
- Cloud Enterprise Plus

**NOT VPS** — VPS plans require manual CLI configuration (separate skill).

### Supported Node.js Versions

18.x, 20.x, 22.x, 24.x

**Our requirement:** Node.js 22.x or 24.x (Vite 8 requires 20.19+ or 22.12+).

### Supported Frameworks

Hostinger auto-detects: React, Vue, Angular, Vite, Svelte, SvelteKit, Astro,
Express.js, Fastify. If detection fails, select **"Other"** and configure manually.

---

## Critical: Version Alignment

Hostinger's default templates use outdated versions. Always override with our stack:

| Component | Hostinger Default | Our Stack (Correct) |
|---|---|---|
| Vite | 7.3.1 | **8.0.3** (Rolldown + Oxc) |
| @vitejs/plugin-react | 4.3.4 (Babel) | **6.0.1** (Oxc, no Babel) |
| React | 19.2.0 | **19.2.4** |
| React DOM | 19.2.0 | **19.2.4** |
| Express | 5.2.1 | **5.2.1** (same) |
| Node.js | varies | **24.x** |
| Package Manager | npm | **pnpm** |

**IMPORTANT:** Always apply the dependency-guard protocol — verify these versions
live before deploying. The versions above were verified March 31, 2026.

---

## Production package.json for Hostinger

This is the canonical `package.json` for deploying to Hostinger Cloud Startup
with our Vite 8 stack:

```json
{
  "name": "your-app-name",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "server/index.js",
  "engines": {
    "node": "24.x"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server/index.js",
    "lint": "eslint ."
  },
  "dependencies": {
    "@libsql/client": "0.15.2",
    "express": "5.2.1",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "vite": "8.0.3",
    "@vitejs/plugin-react": "6.0.1"
  }
}
```

### Critical package.json Rules for Hostinger

1. **`"main": "server/index.js"`** — Hostinger uses this to find your server entry
   point. Must match your actual server file location.
2. **`"type": "module"`** — Required for ES module imports.
3. **`"engines": { "node": "24.x" }`** — Tells Hostinger which Node version to use.
4. **`"start": "node server/index.js"`** — Hostinger runs this after build.
5. **`"build": "vite build"`** — Hostinger runs this during deployment.
6. **No Babel packages** — Our stack uses Oxc via @vitejs/plugin-react v6.
7. **Pin exact versions** — No `^` or `~` for production deployments to Hostinger.
   This prevents Hostinger's npm install from pulling unexpected updates.

---

## Express Server for Hostinger

Hostinger Cloud Startup requires an Express server to serve your Vite build.
Create `server/index.js`:

```javascript
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@libsql/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// ── Turso Database Connection ─────────────────────────────────────
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ── API Routes (before static files) ──────────────────────────────
// Example: GET all items
app.get('/api/items', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM items ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Example: POST a new item
app.post('/api/items', async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await db.execute({
      sql: 'INSERT INTO items (name, description) VALUES (?, ?)',
      args: [name, description],
    });
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database insert failed' });
  }
});

// ── Serve static files from Vite build output ─────────────────────
app.use(express.static(join(__dirname, '..', 'dist')));

// ── SPA fallback — serve index.html for all non-API routes ────────
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
});

// ── Start server ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**IMPORTANT:** API routes MUST be defined BEFORE the static file middleware and
SPA fallback. Otherwise, `/api/items` would match the `*` wildcard and serve
`index.html` instead of your data.

### Port Binding — CRITICAL

Hostinger Cloud Startup manages port binding automatically. Your server MUST use:

```javascript
const PORT = process.env.PORT || 3000;
```

**NEVER hardcode a port.** Hostinger injects the correct port via `process.env.PORT`.

---

## Deployment Methods

### Method 1: GitHub Integration (Recommended)

1. Log into **hPanel** → **Websites** → **Add Website**
2. Select **Node.js Apps**
3. Click **Connect with GitHub** → Authorize access
4. Select your repository and branch
5. Hostinger auto-detects framework — verify build settings match:
   - **Build command:** `npm run build` (Hostinger runs npm, even if we use pnpm locally)
   - **Output directory:** `dist`
   - **Entry file:** `server/index.js`
6. Add **Environment Variables** if needed (API keys, database URLs)
7. Click **Deploy**

**Auto-deploy:** Every push to your connected branch triggers a new deployment.

**NOTE:** One hosting plan connects to one GitHub account. All Node.js sites on
that plan share the same GitHub account.

### Method 2: File Upload

1. Build locally: `pnpm build`
2. Create a `.zip` containing your entire project (including `dist/`, `server/`,
   `package.json`, and `node_modules/` if needed)
3. hPanel → **Websites** → **Add Website** → **Node.js Apps** → **Upload your files**
4. Upload the `.zip`
5. Configure build settings manually
6. Click **Deploy**

---

## File Structure After Deployment

### Frontend-only apps (our typical case)
Build files go to `public_html` — served directly.

### Backend apps (Express server)
Hostinger stores build files **outside** of `public_html`:

```
/home/{username}/domains/{domain}/
├── nodejs/          ← Build files + server (backend apps)
├── public_html/
│   └── .htaccess    ← Auto-generated, routes to nodejs/
```

The `.htaccess` is created automatically. If you get a 403 error after redeployment,
redeploy again to regenerate it.

---

## Database: Turso Cloud (Recommended)

Hostinger Cloud Startup includes managed MySQL/MariaDB, but for our stack we
use **Turso Cloud** — a SQLite-compatible cloud database with a generous free tier,
zero native compilation requirements, and an architecture perfect for Edge and
serverless workloads.

### Why Turso Over Hostinger's Built-in MySQL

| Aspect | Hostinger MySQL | Turso Cloud |
|---|---|---|
| Query language | SQL (MySQL dialect) | SQL (SQLite-compatible) |
| Setup | hPanel → Databases | app.turso.tech dashboard |
| Connection from Express | `mysql2` package (native addon) | `@libsql/client` (pure JS) |
| Native compilation needed | Yes (`mysql2` has C bindings) | No (pure JavaScript) |
| Free tier | Included with plan | 500 databases, 9 GB storage |
| Edge replicas | No | Yes (global read replicas) |
| Branching | No | Yes (copy-on-write branches) |
| Offline/embedded mode | No | Yes (local file + cloud sync) |

### Turso Cloud Setup

#### Step 1: Create a Database

1. Go to [app.turso.tech](https://app.turso.tech)
2. Sign up or log in (GitHub auth available)
3. Click **Create Database**
4. Name: `db1-hostinger` (or your preferred name)
5. Location: Choose the region closest to your Hostinger server
   (e.g., AWS EU West for European Hostinger plans)
6. Click **Create Database**

#### Step 2: Generate an Auth Token

1. In the Turso dashboard, click your database name
2. Under **Connect**, you'll see your **Database URL**:
   `libsql://db1-hostinger-yourorg.aws-eu-west-1.turso.io`
3. Click **+ Create Token**
4. Copy the token immediately — **you won't see it again**
5. Save both values securely

#### Step 3: Add to Hostinger Environment Variables

In hPanel → Your site → **Environment Variables**, add BEFORE deploying:

```
TURSO_DATABASE_URL=libsql://db1-hostinger-yourorg.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOi...your-token-here
```

**NEVER commit these values to your repository.** They go in hPanel only.

For local development, create a `.env` file (git-ignored):

```
TURSO_DATABASE_URL=libsql://db1-hostinger-yourorg.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOi...your-token-here
```

#### Step 4: Install the Client

```bash
pnpm add @libsql/client
```

This is the official Turso JavaScript client. It's **pure JavaScript** — no native
compilation, no C bindings, works on every platform including Hostinger's managed
build environment.

### Database Connection Pattern

Create a reusable database module at `server/db.js`:

```javascript
import { createClient } from '@libsql/client';

// Single database client instance — reuse across all routes
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default db;
```

Then import in your Express server or route files:

```javascript
import db from './db.js';
```

### Common Database Operations

#### Create a Table
```javascript
await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);
```

#### Insert a Row (Parameterized — prevents SQL injection)
```javascript
await db.execute({
  sql: 'INSERT INTO users (name, email) VALUES (?, ?)',
  args: ['Gregory', 'greg@example.com'],
});
```

#### Query Rows
```javascript
const result = await db.execute('SELECT * FROM users ORDER BY id DESC');
console.log(result.rows);
// [{ id: 1, name: 'Gregory', email: 'greg@example.com', created_at: '...' }]
```

#### Query with Parameters
```javascript
const result = await db.execute({
  sql: 'SELECT * FROM users WHERE email = ?',
  args: ['greg@example.com'],
});
const user = result.rows[0]; // Single row or undefined
```

#### Update a Row
```javascript
await db.execute({
  sql: 'UPDATE users SET name = ? WHERE id = ?',
  args: ['Gregory Kennedy', 1],
});
```

#### Delete a Row
```javascript
await db.execute({
  sql: 'DELETE FROM users WHERE id = ?',
  args: [1],
});
```

#### Batch Operations (Transaction)
```javascript
await db.batch([
  { sql: 'INSERT INTO users (name, email) VALUES (?, ?)', args: ['Alice', 'alice@example.com'] },
  { sql: 'INSERT INTO users (name, email) VALUES (?, ?)', args: ['Bob', 'bob@example.com'] },
], 'write');
```

### Database Initialization Pattern

Create a `server/db-init.js` file to run table creation on startup:

```javascript
import db from './db.js';

export async function initializeDatabase() {
  await db.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )`
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        user_id INTEGER REFERENCES users(id),
        created_at TEXT DEFAULT (datetime('now'))
      )`
    },
  ], 'write');

  console.log('Database tables initialized');
}
```

Call it at server startup in `server/index.js`:

```javascript
import { initializeDatabase } from './db-init.js';

// After app setup, before app.listen:
await initializeDatabase();
```

### Turso Free Tier Limits

| Resource | Free Tier Limit |
|---|---|
| Databases | 500 |
| Total storage | 9 GB |
| Rows read/month | 1 billion |
| Rows written/month | 25 million |
| Embedded replicas | Unlimited |
| Locations | 1 per database |

This is more than enough for client projects and small-to-medium production apps.

### Turso vs. Other Database Options on Cloud Startup

| Option | Best For | Tradeoffs |
|---|---|---|
| **Turso Cloud** (recommended) | Our stack, client projects, modern apps | External service (free tier generous) |
| **Hostinger MySQL** | Legacy PHP apps, WordPress | Native addon compilation risk, MySQL dialect |
| **better-sqlite3** (local file) | Tiny apps, prototypes | Data lives on Hostinger filesystem (no backup, lost on redeploy) |
| **External PostgreSQL** (Supabase, Neon) | Complex relational data | Another external service, heavier client library |

---

## Environment Variables

Add sensitive values in hPanel **before deploying**:

- hPanel → Your site → **Environment Variables**

### Required for Turso Database
```
TURSO_DATABASE_URL=libsql://your-db-name-yourorg.region.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### Other Common Variables
```
API_KEY=your-api-key
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG...
```

### Access in Code
- **Server-side (Express):** `process.env.TURSO_DATABASE_URL`
- **Client-side (Vite React):** `import.meta.env.VITE_PUBLIC_API_URL`

**CRITICAL:** Only variables prefixed with `VITE_` are exposed to the frontend.
Database tokens, API secrets, and auth keys must NEVER have the `VITE_` prefix —
they should only be accessible on the server side.

**NEVER commit `.env` files to your repository.**

---

## Hostinger vs. Local: Key Differences

| Aspect | Local Development | Hostinger Cloud Startup |
|---|---|---|
| Package manager | pnpm | npm (Hostinger runs npm internally) |
| Build command | `pnpm build` | `npm run build` (set in hPanel) |
| Port | 3000 (hardcoded OK) | `process.env.PORT` (MUST use) |
| Node version | Whatever you have | Set via `engines` in package.json |
| Environment vars | `.env` file | hPanel Environment Variables |
| Deploy trigger | Manual | Git push (auto) or file upload |

### The pnpm → npm Bridge

We use pnpm locally, but Hostinger runs npm internally. This works because:
- `package.json` is the same regardless of package manager
- `pnpm-lock.yaml` is ignored by Hostinger (it generates its own `package-lock.json`)
- Build commands in `scripts` are package-manager-agnostic (`vite build`, not `pnpm build`)

---

## Deployment Checklist

Before every deployment to Hostinger, verify:

### Package & Build
- [ ] All dependency versions are pinned (no `^` or `~`) in package.json
- [ ] `@libsql/client` is in dependencies (if using Turso)
- [ ] `"build": "vite build"` is in scripts
- [ ] `"start": "node server/index.js"` is in scripts
- [ ] `"main": "server/index.js"` points to actual server file
- [ ] `"engines": { "node": "24.x" }` is set
- [ ] `"type": "module"` is set
- [ ] No Babel packages in dependencies
- [ ] Build succeeds locally with `pnpm build` before pushing

### Server & Config
- [ ] Server uses `process.env.PORT || 3000` (never hardcoded)
- [ ] API routes defined BEFORE static file middleware and SPA fallback
- [ ] `vite.config.js` has `esbuild: false` (Vite 8)

### Database & Secrets
- [ ] Turso database created at app.turso.tech
- [ ] Auth token generated and saved securely
- [ ] `TURSO_DATABASE_URL` added in hPanel Environment Variables
- [ ] `TURSO_AUTH_TOKEN` added in hPanel Environment Variables
- [ ] No `.env` files committed to repo
- [ ] No `VITE_` prefix on secret keys (server-only variables)
- [ ] All other environment variables added in hPanel

---

## Troubleshooting

### Build fails on Hostinger
- Check the deployment log in hPanel → Deployments → View Log
- Verify Node.js version matches `engines` field
- Ensure all dependencies are in package.json (not just pnpm-lock.yaml)

### 403 Forbidden after deployment
- Redeploy to regenerate `.htaccess`
- Check that `public_html/.htaccess` routes to `nodejs/` directory

### App shows blank page
- Verify `dist/` contains `index.html` after build
- Check Express server serves from correct path (`join(__dirname, '..', 'dist')`)
- Verify SPA fallback route is configured

### Environment variables not working
- Variables must be added BEFORE deployment in hPanel
- Redeploy after adding new variables
- Access via `process.env.VARIABLE_NAME` (not `import.meta.env`)

### Hostinger auto-detects wrong framework
- Select **"Other"** in framework dropdown
- Manually set: Output directory = `dist`, Entry file = `server/index.js`

### Turso database connection fails
- Verify `TURSO_DATABASE_URL` starts with `libsql://` (not `https://`)
- Verify `TURSO_AUTH_TOKEN` is set and not expired
- Redeploy after adding/changing environment variables in hPanel
- Test the connection locally first with the same `.env` values
- Check Turso dashboard → your database → Activity to confirm it's receiving requests

### API routes return index.html instead of data
- API routes (`/api/*`) must be defined BEFORE `app.use(express.static(...))`
  and the `app.get('*', ...)` SPA fallback in your Express server
- If API routes are defined after the wildcard, Express matches `*` first

### "TURSO_DATABASE_URL is undefined" in logs
- Environment variables must be added in hPanel BEFORE deployment
- After adding variables, you MUST redeploy for them to take effect
- Double-check: no extra spaces or quotes around the values in hPanel

---

## Anti-Patterns — NEVER Do These

- **NEVER** use `^` or `~` in production package.json for Hostinger — pin exact versions
- **NEVER** hardcode ports — always use `process.env.PORT || 3000`
- **NEVER** commit `.env` files — use hPanel Environment Variables
- **NEVER** use Hostinger's default Vite version — override with Vite 8
- **NEVER** include `@babel/core` or Babel plugins — Vite 8 uses Oxc
- **NEVER** use `@vitejs/plugin-react` v4/v5 — use v6 for Oxc
- **NEVER** deploy without testing `pnpm build` locally first
- **NEVER** confuse Cloud Startup with VPS — different deployment process entirely
- **NEVER** use `process.env` for frontend variables — use `import.meta.env` for
  Vite client-side, `process.env` only for Express server-side
- **NEVER** prefix database tokens with `VITE_` — this exposes them to the frontend
  browser bundle where anyone can read them
- **NEVER** hardcode Turso URLs or tokens in source code — always use environment
  variables via `process.env`
- **NEVER** use string concatenation for SQL queries — always use parameterized
  queries (`?` args) to prevent SQL injection
- **NEVER** create a new `createClient()` instance per request — create one at
  module level and reuse it across all routes
- **NEVER** define API routes AFTER the SPA wildcard fallback — Express matches
  top-to-bottom, so `/api/*` must come before `app.get('*', ...)`

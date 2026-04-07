---
name: dependency-guard
description: >
  Enforce real-time date verification and dependency safety checks before ANY code task
  involving external packages, libraries, frameworks, APIs, or tooling. Triggers on: any code
  generation, dependency installation, project scaffolding, stack recommendation, version pinning,
  package.json / pnpm-lock.yaml / requirements.txt / Cargo.toml / pyproject.toml edits, "install", "pnpm add", "add package",
  "upgrade", "update dependencies", "create project", "scaffold", "boilerplate", "starter template",
  or any mention of a specific library/framework by name in a code context. Also triggers when
  refactoring, adding features, or planning architecture that introduces or modifies dependencies.
  Do NOT trigger for pure algorithmic questions, conceptual discussions, creative writing, or
  non-code tasks with no external dependency involvement.
---

# Dependency Guard: Version & Date Verification

Never trust your training data for package versions, API surfaces, or maintenance status.
Your weights are a snapshot — the ecosystem is a stream. Verify everything live.

## Why This Skill Exists

LLMs have a knowledge cutoff typically 6–12 months behind the current date. Package
ecosystems evolve daily: versions are released, APIs break, packages get deprecated,
CVEs are published, and entire libraries get superseded by better alternatives. Recommending
a version from training data risks shipping vulnerable, deprecated, or incompatible code.
This is a security, legal, and reliability concern — not a nice-to-have.

---

## Mandatory Workflow

Execute these steps IN ORDER before writing or recommending any code with dependencies.

### Step 1 — Anchor the Date

Establish today's real date using any available tool:

- **Web search** → query: `"today's date"` or `"current date"`
- **Web fetch** → hit a time API or any live page with a date header
- **Browser tool** → screenshot any page showing the current date
- **MCP tools** → Tavily search, Firecrawl, or any connected search MCP
- **System clock** → `date` command in bash if available

Store the result mentally as `{{TODAY}}` and use it in all subsequent searches.

**If NO real-time tool is available:**
- State this limitation to the user explicitly
- Mark every version recommendation with: `⚠️ UNVERIFIED`
- Advise the user to confirm all versions before production use

**Conflict resolution:** If your date lookup disagrees with the user's stated date,
trust the live lookup and inform the user of the discrepancy.

---

### Step 2 — Verify Each Dependency

For EVERY package, library, framework, SDK, or tool you reference:

#### 2a. Find the Latest Stable Version

- Search the **canonical registry** (PyPI, npm, crates.io, Maven Central, RubyGems,
  Go pkg.dev, NuGet, or the project's official GitHub Releases page)
- Use search queries like: `{package_name} latest version {current_year}`
- Do NOT rely on blog posts, tutorials, or Stack Overflow for version numbers
- Prefer official changelogs and release notes

#### 2b. Verify Maintenance Status

Check for signs the package is actively maintained:
- Last release date (flag if 12+ months stale)
- Last meaningful commit (not just bot/CI commits)
- Open issue count and response patterns
- Whether the README has a deprecation notice or "archived" badge

If unmaintained → suggest actively maintained alternatives with migration notes.

#### 2c. Check Security Vulnerabilities

- Search: `{package_name} CVE {current_year}` or `{package_name} vulnerability`
- Check GitHub Security Advisories, Snyk vulnerability database, or
  pnpm/npm/pip/cargo audit results
- If the recommended version has a HIGH or CRITICAL CVE → do NOT recommend it
- Find the patched version or a secure alternative

#### 2d. Confirm Compatibility

- Verify the version works with the user's runtime (Node version, Python version, etc.)
- Check peer dependency requirements
- If the user's codebase uses an older major version, document the upgrade path
  and breaking changes — don't silently use the old API

#### 2e. Apply Current Best Practices

- If a library has been replaced by a built-in language/framework feature, say so
- If a pattern has been officially deprecated by the framework, recommend the successor
- Don't perpetuate outdated approaches just because they still technically compile

---

### Step 3 — Format the Output (Context-Aware Versioning)

When presenting code or recommendations:

1. **State the verification date:** "Verified as of {{TODAY}}."

2. **Apply the correct version strategy based on context:**

#### For Scripts, Tutorials, and Quick-Start Code:
- Use **bare package names** in install commands (e.g., `pip install fastapi`,
  `pnpm add react`, `npm install react`). This lets the package manager resolve the genuinely latest
  stable version at the moment the user runs the command — eliminating the risk of
  LLM-pinned stale versions.
- State which version is current as of {{TODAY}} in a **comment or note** so the user
  knows what was verified, but do NOT hardcode it into the install command.
- Example:
  ```bash
  # As of {{TODAY}}, latest stable: fastapi 0.115.x, uvicorn 0.32.x
  pip install fastapi uvicorn
  ```

#### For Production Projects, CI/CD, and Team Codebases:
- **Pin exact versions** in dependency manifests (requirements.txt, package.json,
  pyproject.toml, Cargo.toml, etc.) using the version verified in Step 2a.
- **Always generate or recommend a lock file** (poetry.lock, package-lock.json,
  Cargo.lock, yarn.lock) for deterministic, reproducible builds.
- **Recommend automated update tooling** (Dependabot, Renovate, or equivalent)
  to keep pinned versions current via CI-tested PRs.
- Example:
  ```
  # requirements.txt — Verified {{TODAY}}
  fastapi==0.115.0
  uvicorn==0.32.1
  # Enable Dependabot or Renovate for automated version updates
  ```

#### If Unsure Which Context Applies:
- **ASK the user:** "Is this for a quick script/prototype, or a production project?"
- This determines whether to use bare names or pinned versions.

3. **Cite your source** for each version — link to the registry page or changelog.
4. **Flag unverified items** with: `⚠️ UNVERIFIED — confirm version before production use`
5. **Add a staleness warning** after any production dependency block:
   ```
   # Versions verified {{TODAY}}. Re-verify before production deployment.
   ```

---

## Anti-Patterns — NEVER Do These

- **NEVER** recommend a version from memory without live verification
- **NEVER** say "use the latest version" without specifying the actual version number
  (state it in a comment or note, even when using bare install commands)
- **NEVER** silently use an older version because it's more familiar from training
- **NEVER** assume a package still exists, is still canonical, or hasn't been renamed/forked
- **NEVER** skip vulnerability checks for dev dependencies (supply-chain attack vector)
- **NEVER** copy version numbers from cached search snippets without cross-referencing
  the canonical package registry
- **NEVER** recommend a deprecated CLI flag or API method alongside current code
- **NEVER** hardcode a version from training data into an install command for scripts
  or tutorials — use bare names so the package manager resolves the genuinely latest
  version at execution time
- **NEVER** leave a production dependency manifest without pinned versions AND a lock
  file — bare names in production cause irreproducible builds and "works on my machine"
  failures across teams and CI/CD environments
- **NEVER** assume context — if unclear whether the user needs script-style or
  production-style versioning, ASK before generating code

---

## Trigger Scope

### This skill ACTIVATES when:

- Writing or modifying any dependency manifest (requirements.txt, package.json,
  Cargo.toml, pyproject.toml, Gemfile, go.mod, pom.xml, build.gradle, etc.)
- Recommending `pip install`, `pnpm add`, `npm install`, `yarn add`, `cargo add`, `brew install`,
  `apt install`, or any package manager command
- Generating boilerplate, project scaffolding, or starter templates
- Suggesting a library, SDK, framework, or CLI tool by name in a code context
- Updating, refactoring, or adding features that introduce or change dependencies
- Providing architecture, stack, or tooling recommendations
- Reviewing code that uses external packages (verify the versions used are current)

### This skill does NOT activate when:

- Answering pure algorithm, math, or data structure questions (no external deps)
- Discussing design patterns, concepts, or theory in the abstract
- Creative writing, analysis, document creation, or any non-code task
- The user explicitly says they want a specific older version (honor their choice,
  but note if it has known vulnerabilities)

---

## Quick Reference — Common Registries

| Ecosystem | Canonical Registry | Search Pattern |
|---|---|---|
| Python | https://pypi.org/project/{name}/ | `{name} pypi latest` |
| JavaScript/Node | https://www.npmjs.com/package/{name} | `{name} npm latest version` |
| Rust | https://crates.io/crates/{name} | `{name} crates.io latest` |
| Go | https://pkg.go.dev/{module} | `{name} go module latest` |
| Java/Kotlin | https://central.sonatype.com/ | `{name} maven central latest` |
| Ruby | https://rubygems.org/gems/{name} | `{name} rubygems latest` |
| .NET | https://www.nuget.org/packages/{name} | `{name} nuget latest` |
| PHP | https://packagist.org/packages/{vendor}/{name} | `{name} packagist latest` |

## Quick Reference — Vulnerability Databases

| Source | URL |
|---|---|
| GitHub Advisory Database | https://github.com/advisories |
| National Vulnerability Database | https://nvd.nist.gov/ |
| Snyk Vulnerability DB | https://security.snyk.io/ |
| OSV (Open Source Vulnerabilities) | https://osv.dev/ |
| npm audit | `npm audit` (CLI) |
| pnpm audit | `pnpm audit` (CLI) |
| pip audit | `pip-audit` (CLI) |
| cargo audit | `cargo audit` (CLI) |

---

## Example Interactions

### Example A — Script / Tutorial Context

**User:** "Set up a new FastAPI project with SQLAlchemy and Redis."

**Correct agent behavior:**
1. Determine context → user said "set up" with no mention of production/CI/team → likely a quick-start. Ask if unsure, or default to script-style.
2. Search: `"today's date"` → confirms April 5, 2026
3. Search: `FastAPI latest version 2026` → finds 0.XX.X on PyPI
4. Search: `SQLAlchemy latest version 2026` → finds 2.X.X on PyPI
5. Search: `redis-py latest version 2026` → finds X.X.X on PyPI
6. Check: `FastAPI CVE 2026`, `SQLAlchemy CVE 2026`, `redis-py CVE 2026`
7. Verify compatibility between all three and the user's Python version
8. Write code with **bare install names** + version info in comments:
   ```bash
   # As of April 5, 2026 — latest stable: FastAPI 0.XX.X, SQLAlchemy 2.X.X, redis X.X.X
   pip install fastapi sqlalchemy redis uvicorn
   ```
9. Cite sources, note verified date

### Example B — Production Context

**User:** "Add Redis caching to our production FastAPI service. We use poetry and CI/CD."

**Correct agent behavior:**
1. Determine context → "production", "poetry", "CI/CD" → production-style pinning required
2. Execute Steps 2–6 from Example A (date anchor, version search, CVE check, compatibility)
3. Write code with **pinned versions** in pyproject.toml + lock file instructions:
   ```toml
   # pyproject.toml — Verified April 5, 2026
   [tool.poetry.dependencies]
   redis = "^X.X.X"
   ```
   ```bash
   poetry lock
   # Enable Dependabot or Renovate for automated version updates
   # Versions verified April 5, 2026. Re-verify before production deployment.
   ```
4. Cite sources, add staleness warning

### Incorrect Agent Behavior (Both Contexts)
- Using `fastapi==0.104.0` from training memory without live verification
- Assuming `aioredis` is still the right Redis client (it was merged into `redis-py`)
- Saying "install the latest version" without stating what that version actually is
- Pinning stale training-data versions into a tutorial install command
- Using bare names in a production requirements.txt with no lock file

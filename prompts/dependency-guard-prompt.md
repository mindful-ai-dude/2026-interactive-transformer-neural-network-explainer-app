# Optimized System Prompt: Dependency Guard — Version & Date Verification

> **Purpose:** Drop this block into any system prompt, AGENTS.md, or .cursorrules file to enforce real-time date verification and dependency safety checks before any code-touching task.

---

```xml
<dependency_guard_protocol>
<mandate>
Before writing, modifying, recommending, or planning ANY code that involves
external dependencies, libraries, frameworks, APIs, or tooling — you MUST
execute the Date Anchor and Dependency Verification steps below. No exceptions.
Skipping this protocol risks shipping code with deprecated APIs, vulnerable
packages, or broken pinned versions. This applies even when you "know" a version
from training data.
</mandate>

<why_this_matters>
Your training data has a knowledge cutoff. Package ecosystems move faster than
your weights update. A "current" version in your training may now be deprecated,
yanked, or carry a critical CVE. The only reliable source of truth is a live
lookup performed in the same session as the task.
</why_this_matters>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--  STEP 1 — DATE ANCHOR                                             -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<step_1_date_anchor>
Establish today's actual date using any available real-time tool:
  - Web search, web fetch, browser screenshot, MCP search tools,
    Tavily, Firecrawl, or system clock commands.
  - Store the result as {{TODAY}} and reference it in all subsequent queries.
  - If NO real-time tool is available, state this limitation explicitly to the
    user and proceed with maximum caution, flagging every version recommendation
    as "unverified — confirm before use."

Failure mode: If your date lookup returns a date that conflicts with the user's
stated date, trust the live lookup and inform the user of the discrepancy.
</step_1_date_anchor>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--  STEP 2 — DEPENDENCY VERIFICATION WORKFLOW                        -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<step_2_dependency_verification>
For EVERY dependency, library, framework, or tool you reference or recommend:

  2a. SEARCH for the latest STABLE release as of {{TODAY}}.
      - Use the canonical source: PyPI, npm, crates.io, Maven Central,
        official docs, GitHub releases — not blog posts or tutorials.
      - Prefer official documentation and changelogs over Stack Overflow
        answers or LLM-generated tutorials (which may also be stale).

  2b. VERIFY maintenance status.
      - Check: last commit date, open issue count trend, maintainer activity.
      - If the package has had no release or meaningful commit in 12+ months,
        flag it as potentially unmaintained and suggest actively maintained
        alternatives.

  2c. CHECK for known vulnerabilities.
      - Search CVE databases, GitHub Security Advisories, Snyk, or
        `pnpm audit` / `npm audit` / `pip audit` / `cargo audit` equivalents.
      - If a recommended version has a known HIGH or CRITICAL CVE,
        do NOT recommend it. Find the patched version or an alternative.

  2d. CONFIRM API compatibility.
      - Breaking changes between major versions are common. Verify that the
        version you recommend is compatible with the user's existing stack
        (runtime version, peer dependencies, OS).
      - If the user's codebase pins an older major version, note the upgrade
        path and breaking changes rather than silently using the old API.

  2e. RECOMMEND current best practices.
      - If an entire approach has been superseded (e.g., a library replaced
        by a built-in language feature, or a pattern deprecated by the
        framework), say so. Don't perpetuate outdated patterns just because
        they still technically work.
</step_2_dependency_verification>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--  STEP 3 — OUTPUT REQUIREMENTS                                     -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<step_3_output_requirements>
When presenting your recommendation or code:

  3a. STATE the verified date: "Verified as of {{TODAY}}."

  3b. APPLY CONTEXT-AWARE VERSION STRATEGY:

      SCRIPTS, TUTORIALS, AND QUICK-START CODE:
      - Use bare package names in install commands (e.g., `pip install fastapi`,
        `pnpm add react`, `npm install react`). This lets the package manager resolve to the
        genuinely latest stable version at the moment the user runs the command,
        avoiding stale LLM-pinned versions.
      - State which version is current as of {{TODAY}} in a comment or note
        so the user knows what was verified, but do NOT hardcode it into the
        install command.
      - Example:
          # As of {{TODAY}}, latest stable: fastapi 0.115.x, uvicorn 0.32.x
          pip install fastapi uvicorn

      PRODUCTION PROJECTS, CI/CD, AND TEAM CODEBASES:
      - PIN exact versions in dependency manifests (requirements.txt,
        package.json, pyproject.toml, Cargo.toml, etc.) using the latest
        stable version verified in Step 2a.
      - ALWAYS generate or recommend a lock file (poetry.lock,
        package-lock.json, Cargo.lock, yarn.lock, etc.) to ensure
        deterministic, reproducible builds across all environments.
      - RECOMMEND automated dependency update tooling (Dependabot, Renovate,
        or equivalent) to keep pinned versions current via CI-tested PRs.
      - Example:
          # requirements.txt — Verified {{TODAY}}
          fastapi==0.115.0
          uvicorn==0.32.1
          # Run: pip freeze > requirements.txt after install
          # Enable Dependabot or Renovate for automated version updates

      IF UNSURE which context applies, ASK the user:
      "Is this for a quick script/prototype, or a production project?
       This determines whether I pin exact versions or use bare names."

  3c. CITE your source for each version (link to PyPI page, npm page,
      official changelog, etc.).
  3d. FLAG any dependency where you could NOT perform a live lookup.
      Use the marker: ⚠️ UNVERIFIED — confirm version before production use.
  3e. INCLUDE a "Staleness Warning" after any production dependency block:
      # Versions verified {{TODAY}}. Re-verify before production deployment.
</step_3_output_requirements>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--  ANTI-PATTERNS — NEVER DO THESE                                   -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<anti_patterns>
- NEVER recommend a version from memory without live verification.
- NEVER say "use the latest version" without specifying what that version IS
  (state it in a comment or note, even when using bare install commands).
- NEVER silently downgrade a recommendation because an older version is
  "more familiar" from training data.
- NEVER assume a package still exists or is still the canonical choice.
  (Packages get renamed, forked, deprecated, or absorbed into frameworks.)
- NEVER skip vulnerability checks because "it's just a dev dependency."
  Supply-chain attacks target dev dependencies specifically.
- NEVER copy version numbers from tutorials, blog posts, or cached search
  snippets without cross-referencing the canonical package registry.
- NEVER hardcode a version from training data into an install command for
  scripts or tutorials — use bare names so the package manager resolves
  the genuinely latest version at execution time.
- NEVER leave a production dependency manifest without pinned versions and
  a lock file — bare names in production create irreproducible builds and
  "works on my machine" failures.
- NEVER assume context — if unclear whether the user needs script-style or
  production-style versioning, ASK before generating code.
</anti_patterns>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--  SCOPE                                                             -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<scope>
This protocol activates whenever:
- You write or modify a requirements.txt, package.json, Cargo.toml,
  pyproject.toml, Gemfile, go.mod, pom.xml, build.gradle, or any
  dependency manifest.
- You recommend installing a package via pip, pnpm, npm, yarn, cargo, brew,
  apt, or any package manager.
- You generate boilerplate, starter templates, or project scaffolding.
- You suggest a library, SDK, framework, or CLI tool by name.
- You update, refactor, or add features to an existing codebase that
  introduces or modifies dependencies.
- You provide architecture or stack recommendations.

This protocol does NOT apply to:
- Pure algorithmic or mathematical questions with no external dependencies.
- Conversations about concepts, theory, or design patterns in the abstract.
- Creative writing, analysis, or non-code tasks.
</scope>
</dependency_guard_protocol>
```

---

## Usage Notes

**Where to place this prompt block:**

| Environment | Location |
|---|---|
| Claude Code | `AGENTS.md` at project root, or `~/.claude/AGENTS.md` for global |
| Cursor | `.cursorrules` or `.cursor/rules/` directory |
| Windsurf | `.windsurfrules` |
| Cline / Roo Code | `.clinerules` or custom instructions |
| Claude.ai | System prompt or project instructions |
| OpenAI API | `system` message |
| Any MCP-equipped agent | Prepend to system context |

**Customization points:**
- Add your specific tech stack constraints inside `<scope>` to narrow focus.
- Add your preferred registries or security scanning tools in step 2c.
- Adjust the "12+ months" unmaintained threshold to match your risk tolerance.

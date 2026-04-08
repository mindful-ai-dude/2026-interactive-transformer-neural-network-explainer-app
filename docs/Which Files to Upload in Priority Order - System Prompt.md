## Part 1: Which Files to Upload in Priority Order

You have 9 file slots. Here's how I'd allocate them, ranked by what gives the LLM the most signal per slot:

| Slot | File | Why it earns its spot |
|---|---|---|
| 1 | **The video file or URL** | The whole point of the exercise |
| 2 | `prompts/video-tutorial-generator-prompt.md` | The orchestration prompt itself — paste this in the chat as your first message AND upload it as a reference file |
| 3 | `skills/dependency-guard/SKILL.md` | Full version-verification rules — most critical of the three skills |
| 4 | `skills/visual-diagram-narrator/SKILL.md` | Full SVG design system — colors, fonts, animation phases, archetypes |
| 5 | `skills/interactive-simulation-architect/SKILL.md` | Full HTML simulation design system |
| 6 | `AGENTS.md` | Project-level conventions and the three skills tables |
| 7 | `docs/video-tutorial-generator-README.md` | The "why" and "when" context, plus the LLM compatibility notes |
| 8 | *(reserved — see below)* | |
| 9 | *(reserved — see below)* | |

**Slots 8 and 9** I'd leave flexible depending on the video:

- **If the video is about a specific tool you have a skill for** (e.g., a Vite 8 tutorial), upload `skills/vite8-architect/SKILL.md` so the LLM applies that specialized knowledge
- **If the video is about Hostinger deployment**, upload `skills/hostinger-cloud-deployer/SKILL.md`
- **If neither applies**, upload one or two reference docs from `docs/` that match the video's domain
- **If the video is very long or complex**, use one of these slots for a custom "focus areas" note telling the LLM what you most want captured

**Important nuance:** the three skill files (slots 3-5) are non-negotiable for *any* tutorial generation run. The Vite8 and Hostinger skills only matter when the video covers those specific topics.

## Part 2: The Updated TOOLKIT INTEGRATION Section

You're right that the current language assumes file access. Here's the rewritten section that handles all three scenarios — files uploaded to web UI, files in project folders, or no file access at all. I'll update the prompt now:Now let me also update the "Toolkit Reference" section at the bottom of the prompt to reflect the three sources, and update the README with the upload guidance:Now update the README with the upload guidance section:Both files updated. Here's what changed:

**The prompt now has a three-source detection protocol** at the top of the TOOLKIT INTEGRATION section. Before generating anything, the LLM walks through three possible places to find the skill files:

1. **Source 1 — Files attached to the conversation.** The LLM checks for uploaded files by name (`skills/dependency-guard/SKILL.md`, etc.). This is your web UI scenario.
2. **Source 2 — Files in the project workspace.** For Claude Code, Cursor, or anything with filesystem access. The LLM reads them from the canonical paths.
3. **Source 3 — Embedded fallback specifications.** The condensed specs already in the prompt, used only as a last resort when neither attached nor workspace files are available.

**The detection rule is explicit:** *"Always check Sources 1 and 2 BEFORE falling back to Source 3."* Without that rule, an LLM might silently use the embedded fallback even when the user attached the full files — wasting your upload slots.

**The acknowledgment requirement** is the verification mechanism. Before generating Section 1, the LLM has to say one of these three things:

- *"Using attached skill files: dependency-guard, visual-diagram-narrator, interactive-simulation-architect, plus AGENTS.md."*
- *"Using workspace files from skills/ directory."*
- *"Using embedded fallback specifications. For best results, attach the full SKILL.md files..."*

This way you instantly know whether your uploads worked. If you attached six files and the LLM says "using embedded fallback," something went wrong with the upload and you can re-attach before approving Section 1.

**The README now has a "When the LLM has a file upload limit" section** with the same priority table I gave you above, so future users (and future you) don't have to re-derive which files matter most.

**Each skill's full description in the prompt** now ends with a pointer line like *"Full specifications: see `skills/dependency-guard/SKILL.md` if attached or present in workspace"* — so the LLM is constantly reminded that there's a richer authoritative version available beyond what's embedded.

**One small thing worth noting:** when you upload `prompts/video-tutorial-generator-prompt.md` itself as one of your nine files, you're giving the LLM two copies of the same content (one in chat, one as a file). That's intentional — some LLMs prioritize attached files over chat history, so having it in both places is belt-and-suspenders.
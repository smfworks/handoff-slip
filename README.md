# Handoff Slip

Fill **From / To / Goal / Done so far / Open risks / Next action** → get a shareable **agent-to-agent handoff slip** (PNG + copy text).

Contract is the bound. Receipt and Timeline are what happened. **Handoff Slip is the baton pass** — between agents, or across a human↔agent shift.

**Write the baton. Print the slip. Pass the work — do not redo it.**

[![MIT License](https://img.shields.io/badge/license-MIT-00D4FF?labelColor=0A0F1F)](LICENSE)

SMF Works viral kit:

1. **[Paste → Skill](https://github.com/smfworks/paste-to-skill)** — what to run
2. **[Skill Lint](https://github.com/smfworks/skill-lint)** — grade / fix
3. **[Agent Contract](https://github.com/smfworks/agent-contract)** — roles, success, stop
4. **[Tool Permit](https://github.com/smfworks/tool-permit)** — **GO / ALLOWLIST**
5. **[Constraint Card](https://github.com/smfworks/constraint-card)** — standing constitution
6. **[Refuse Card](https://github.com/smfworks/refuse-card)** — **NO / HOLD** twin
7. **Handoff Slip (this)** — the baton pass
8. **[Agent Receipt](https://github.com/smfworks/agent-receipt)** — what happened
9. **[Session Timeline](https://github.com/smfworks/session-timeline)** — the vertical log

Also in the kit: [Skill Card](https://github.com/smfworks/skill-card), [Prompt Diff](https://github.com/smfworks/prompt-diff), [Redact Before Share](https://github.com/smfworks/redact-before-share), [Context Budget](https://github.com/smfworks/context-budget), [Persona Card](https://github.com/smfworks/persona-card).

## Why a handoff slip?

Agent work fails at the seam. The next agent (or the human on the next shift) does not know what is already done, what is still dangerous, and what the single next action is. A card is small enough to screenshot and specific enough to argue with — research → writer vs debug → fixer vs review → human vs ops shift change.

It is a **lab artifact for communication**. It is **not a workflow runtime** and **not a legal instrument**. Pair it with an Agent Contract, an Agent Receipt, a Session Timeline, and a human. Judgment stays human.

The optional paste splitter is **heuristic** (headers: From, To, Goal, Done, Risks, Next). Approximate. Review the slip.

## Quickstart

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build
npm run preview
npm test
```

Node 20+ (22 recommended). Client-side only — no auth, no backend, no API keys, no secrets.

## Use it

1. Pick **Research → writer**, **Debug → fixer**, **Review → human**, or **Ops shift**, or write your own.
2. Name **From** and **To**. Write the **Goal**. Optional **session**, **date**, and **priority** (NORMAL / URGENT).
3. Add **Done so far** bullets and **Open risks**. Write one clear **Next action**. Or paste a note and split it.
4. **Download PNG**, **Copy share text**, or **Copy JSON**. **Load sample** fills research-to-writer. **Reset** clears the compositor.

Other tools can emit the JSON schema below and skip the builder.

## Samples

Shipped in [`public/samples/`](public/samples/):

| File | Baton |
| --- | --- |
| `research-to-writer.json` | Survey handed to a writer. Cite, don't send. |
| `debug-to-fixer.json` | Repro + failing test. Urgent, focused PR. |
| `review-to-human.json` | Comments only. Human decides merge. |
| `ops-shift-change.json` | Night ops → morning on-call. Watch disk. |

Load one in the app with `?sample=research-to-writer`.

## Input / output schema

Canonical JSON Schema: [`public/schema/handoff-slip.schema.json`](public/schema/handoff-slip.schema.json)

Minimal baton:

```json
{
  "from": "Literature scout",
  "to": "Brief writer",
  "goal": "Turn the survey into a one-pager.",
  "next": "Write the brief from the cited map."
}
```

Printed output (what the card represents):

| Field | Notes |
| --- | --- |
| `schema` | `smf.handoff-slip.v1` |
| `id` | `HS-xxxx` serial |
| `from` | Who is handing off |
| `to` | Who picks up |
| `goal` | What this work is for |
| `done` | Done-so-far bullets |
| `risks` | Open-risk bullets |
| `next` | Single next action |
| `session` | Optional window label |
| `date` | Optional date label |
| `priority` | `NORMAL` or `URGENT` |
| `issuedAt` | ISO-8601 UTC |
| `heuristic` | Always `true` — this is a demo printer |

Aliases accepted on ingest: `sender` / `receiver` / `objective` / `doneSoFar` / `progress` / `openRisks` / `nextAction`.

## Host a demo

Static files from `npm run build` (output: `dist/`). `vercel.json` rewrites unknown paths to `index.html` for SPA hosting.

Or Docker:

```bash
docker build -t handoff-slip .
docker run --rm -p 8080:80 handoff-slip
```

Then open [http://localhost:8080](http://localhost:8080).

## Stack

Vite + React + TypeScript. Slip serialization is client-side (no model, no keys). PNG export via `html-to-image`. Fonts: Inter, Space Grotesk, JetBrains Mono. Palette: navy `#0A0F1F`, cyan `#00D4FF`, GO green `#34D399`, ember `#EA580C`.

## Built by SMF Works

[SMF Works](https://smfworks.com) is a human-AI research lab. We publish what we learn, ship open agent tools, and install stacks on hardware you own.

Intelligence is abundant. Judgment is the product.

- Lab: [smfworks.com](https://smfworks.com)
- GitHub: [github.com/smfworks](https://github.com/smfworks)
- X: [@MichaelGannotti](https://x.com/MichaelGannotti)
- Twin: [Agent Contract](https://github.com/smfworks/agent-contract) — the bound
- Twin: [Agent Receipt](https://github.com/smfworks/agent-receipt) — what happened
- Twin: [Session Timeline](https://github.com/smfworks/session-timeline) — the log

MIT licensed. **Not a workflow runtime. Not a legal instrument.** This is a shareable baton card, not an audit, not a sandbox, and not a hosted agent.

## License

[MIT](LICENSE) © 2026 SMF Works

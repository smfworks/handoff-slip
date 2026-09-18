import type { SampleMeta } from "../types.ts";

export const SAMPLES: SampleMeta[] = [
  {
    id: "research-to-writer",
    file: "/samples/research-to-writer.json",
    label: "Research → writer",
    blurb: "Survey to one-pager · session",
    draft: {
      from: "Literature scout",
      to: "Brief writer",
      goal: "Turn the repo survey into a one-page brief a human can ship.",
      done: [
        "Mapped the four public APIs and their auth surfaces",
        "Cited sources with paths; flagged two stale docs",
        "Listed open questions instead of inventing answers",
      ],
      risks: [
        "Rate-limit notes in README may be outdated",
        "One cited paper is paywalled — do not paraphrase as if read",
      ],
      next: "Write the one-pager from the cited map; leave send to the human.",
      session: "this session",
      date: "2026-09-18",
      priority: "NORMAL",
    },
  },
  {
    id: "debug-to-fixer",
    file: "/samples/debug-to-fixer.json",
    label: "Debug → fixer",
    blurb: "Repro handed off · urgent",
    draft: {
      from: "Debug agent",
      to: "Fixer agent",
      goal: "Patch the failing export path without widening scope.",
      done: [
        "Reproduced the PNG export hang on empty next-action",
        "Traced it to a null frame class during html-to-image",
        "Added a failing unit around the empty-state guard",
      ],
      risks: [
        "Fix may regress the ?shot=card screenshot path",
        "Do not touch the paste splitter in the same PR",
      ],
      next: "Guard the export frame, add a test, open a focused PR.",
      session: "this session",
      date: "",
      priority: "URGENT",
    },
  },
  {
    id: "review-to-human",
    file: "/samples/review-to-human.json",
    label: "Review → human",
    blurb: "Comments only · human merges",
    draft: {
      from: "Review bot",
      to: "Staff engineer",
      goal: "Human decides merge. Comments only — no push, no approve-as-human.",
      done: [
        "Commented on every changed file or marked explicit LGTM",
        "Called two blockers with file and line",
        "Posted a short risk summary on the PR",
      ],
      risks: [
        "CI secrets appear in one fixture — needs a human look",
        "Suggested refactor would rewrite history if applied blindly",
      ],
      next: "Read the two blockers, then merge or send back. Agent stops here.",
      session: "this PR",
      date: "2026-09-18",
      priority: "NORMAL",
    },
  },
  {
    id: "ops-shift-change",
    file: "/samples/ops-shift-change.json",
    label: "Ops shift",
    blurb: "Night → morning · urgent",
    draft: {
      from: "Night ops agent",
      to: "Morning on-call",
      goal: "Keep the lab stack green through the shift change; no deploys after 02:00.",
      done: [
        "Restarted the hung preview box; logs rotated",
        "Queued two non-urgent alerts for daylight",
        "Confirmed kill-switch is off and egress allowlist unchanged",
      ],
      risks: [
        "Disk on spark-3 is at 81% — will page if it crosses 85",
        "A vendor status page still shows degraded DNS",
      ],
      next: "Watch disk on spark-3; do not deploy until the human is on.",
      session: "night → morning",
      date: "2026-09-18",
      priority: "URGENT",
    },
  },
];

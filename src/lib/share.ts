import type { HandoffSlipDoc } from "../types.ts";

const SHARE_URL = "https://github.com/smfworks/handoff-slip";

export function formatStampTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${dd} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()} · ${hh}:${mm} UTC`;
}

export function formatShareText(slip: HandoffSlipDoc): string {
  const done = slip.done.map((line) => `• ${line}`).join("\n");
  const risks = slip.risks.map((line) => `• ${line}`).join("\n");
  const meta = [
    slip.session ? `Session: ${slip.session}` : "",
    slip.date ? `Date: ${slip.date}` : "",
  ].filter(Boolean);
  const lines = [
    "HANDOFF SLIP",
    `${slip.from || "—"} → ${slip.to || "—"}`,
    `Priority: ${slip.priority}`,
    ...meta,
    "",
    "Goal",
    slip.goal || "(none)",
    "",
    "Done so far",
    done || "• (none)",
    "",
    "Open risks",
    risks || "• (none)",
    "",
    "Next action",
    slip.next || "(none)",
    "",
    "Pass the baton. Do not redo the work.",
    "Handoff Slip · SMF Works",
    SHARE_URL,
  ];
  return lines
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");
}

export function formatCompactStats(slip: HandoffSlipDoc): string {
  const session = slip.session || slip.date || "open";
  return `${slip.priority} · ${slip.done.length} done · ${slip.risks.length} risks · ${session}`;
}

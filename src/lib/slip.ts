import {
  EMPTY_DRAFT,
  MAX_BULLET_LENGTH,
  MAX_BULLETS,
  MAX_NEXT_LENGTH,
  SLIP_SCHEMA,
  type HandoffDraft,
  type HandoffSlipDoc,
  type Priority,
} from "../types.ts";
import type { SplitResult } from "./split.ts";

export function normalizeBullet(raw: string): string | null {
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text) return null;
  if (text.length > MAX_BULLET_LENGTH) return text.slice(0, MAX_BULLET_LENGTH).trim();
  return text;
}

export function uniqueBullets(raw: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const bullet = normalizeBullet(item);
    if (!bullet) continue;
    const key = bullet.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(bullet);
    if (out.length >= MAX_BULLETS) break;
  }
  return out;
}

export function addBullet(list: readonly string[], raw: string): string[] {
  const bullet = normalizeBullet(raw);
  if (!bullet) return [...list];
  const key = bullet.toLowerCase();
  if (list.some((item) => item.toLowerCase() === key)) return [...list];
  if (list.length >= MAX_BULLETS) return [...list];
  return [...list, bullet];
}

export function removeBullet(list: readonly string[], raw: string): string[] {
  const bullet = normalizeBullet(raw);
  if (!bullet) return [...list];
  const key = bullet.toLowerCase();
  return list.filter((item) => item.toLowerCase() !== key);
}

export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function slipId(seed: string): string {
  const hex = fnv1a(seed).toString(16).toUpperCase().padStart(8, "0");
  return `HS-${hex.slice(0, 4)}`;
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "handoff";
}

export function normalizePriority(raw: string | null | undefined): Priority {
  const value = (raw ?? "").trim().toUpperCase();
  return value === "URGENT" ? "URGENT" : "NORMAL";
}

export function serializeSlip(
  draft: HandoffDraft,
  issuedAt: Date = new Date(),
): HandoffSlipDoc {
  const from = draft.from.trim();
  const to = draft.to.trim();
  const goal = draft.goal.trim();
  const next = draft.next.trim().slice(0, MAX_NEXT_LENGTH);
  const session = draft.session.trim();
  const date = draft.date.trim();
  const priority = normalizePriority(draft.priority);
  const done = uniqueBullets(draft.done);
  const risks = uniqueBullets(draft.risks);
  const issued = issuedAt.toISOString();
  const seed = [from, to, goal, next, session, date, priority, done.join(","), risks.join(",")].join(
    "|",
  );

  return {
    schema: SLIP_SCHEMA,
    id: slipId(seed),
    from,
    to,
    goal,
    done,
    risks,
    next,
    session,
    date,
    priority,
    issuedAt: issued,
    heuristic: true,
  };
}

export function slipToJson(slip: HandoffSlipDoc): string {
  return `${JSON.stringify(slip, null, 2)}\n`;
}

export function canExport(slip: HandoffSlipDoc): boolean {
  return Boolean(slip.from && slip.to && slip.goal && slip.next);
}

export function cloneDraft(draft: HandoffDraft = EMPTY_DRAFT): HandoffDraft {
  return {
    ...draft,
    done: [...draft.done],
    risks: [...draft.risks],
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function readString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

export function parseSlipObject(value: unknown): HandoffDraft | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  const from = readString(record, ["from", "sender"]);
  const to = readString(record, ["to", "receiver"]);
  const goal = readString(record, ["goal", "objective"]);
  const next = readString(record, ["next", "nextAction"]);
  const session = readString(record, ["session", "window"]);
  const date = readString(record, ["date", "when"]);
  const done = asStringArray(record.done ?? record.doneSoFar ?? record.progress);
  const risks = asStringArray(record.risks ?? record.openRisks ?? record.watchouts);
  const priority = normalizePriority(readString(record, ["priority", "urgency"]));

  if (!from && !to && !goal && !next && done.length === 0 && risks.length === 0) {
    return null;
  }

  return {
    from: from.trim(),
    to: to.trim(),
    goal: goal.trim(),
    done: uniqueBullets(done),
    risks: uniqueBullets(risks),
    next: next.trim(),
    session: session.trim(),
    date: date.trim(),
    priority,
  };
}

export function applySplit(draft: HandoffDraft, incoming: SplitResult): HandoffDraft {
  return {
    from: incoming.from || draft.from,
    to: incoming.to || draft.to,
    goal: incoming.goal || draft.goal,
    done: incoming.done.length ? uniqueBullets(incoming.done) : draft.done,
    risks: incoming.risks.length ? uniqueBullets(incoming.risks) : draft.risks,
    next: incoming.next || draft.next,
    session: incoming.session || draft.session,
    date: incoming.date || draft.date,
    priority: incoming.priority ?? draft.priority,
  };
}

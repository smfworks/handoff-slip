import { uniqueBullets } from "./slip.ts";
import type { Priority } from "../types.ts";

export type SplitField =
  | "from"
  | "to"
  | "goal"
  | "done"
  | "risks"
  | "next"
  | "session"
  | "date"
  | "priority";

export interface SplitResult {
  from: string;
  to: string;
  goal: string;
  done: string[];
  risks: string[];
  next: string;
  session: string;
  date: string;
  priority: Priority | null;
  /** Lines that landed in a bucket only because a section header was active. */
  guessed: number;
}

const HEADER_FROM = /^(from|sender|handing\s*off)\s*:?\s*$/i;
const HEADER_TO = /^(to|receiver|handoff\s*to|for)\s*:?\s*$/i;
const HEADER_GOAL = /^(goal|objective|mission)\s*:?\s*$/i;
const HEADER_DONE = /^(done(?:\s*so\s*far)?|progress|completed|already\s*done)\s*:?\s*$/i;
const HEADER_RISKS = /^(open\s*risks?|risks?|watchouts?|open\s*issues?)\s*:?\s*$/i;
const HEADER_NEXT = /^(next(?:\s*action)?|baton|do\s*next)\s*:?\s*$/i;
const HEADER_SESSION = /^(session|window)\s*:?\s*$/i;
const HEADER_DATE = /^(date|when|day)\s*:?\s*$/i;
const HEADER_PRIORITY = /^(priority|urgency)\s*:?\s*$/i;

const INLINE_FROM = /^(from|sender)\s*:\s*(.+)$/i;
const INLINE_TO = /^(to|receiver)\s*:\s*(.+)$/i;
const INLINE_GOAL = /^(goal|objective)\s*:\s*(.+)$/i;
const INLINE_DONE = /^(done(?:\s*so\s*far)?|progress)\s*:\s*(.+)$/i;
const INLINE_RISKS = /^(open\s*risks?|risks?)\s*:\s*(.+)$/i;
const INLINE_NEXT = /^(next(?:\s*action)?)\s*:\s*(.+)$/i;
const INLINE_SESSION = /^(session)\s*:\s*(.+)$/i;
const INLINE_DATE = /^(date|when)\s*:\s*(.+)$/i;
const INLINE_PRIORITY = /^(priority|urgency)\s*:\s*(.+)$/i;

function stripDecor(line: string): string {
  return line
    .replace(/^\s*[-*•>]+\s*/, "")
    .replace(/^\s*\d+[.)]\s+/, "")
    .trim();
}

function headerField(line: string): SplitField | null {
  if (HEADER_FROM.test(line)) return "from";
  if (HEADER_TO.test(line)) return "to";
  if (HEADER_GOAL.test(line)) return "goal";
  if (HEADER_DONE.test(line)) return "done";
  if (HEADER_RISKS.test(line)) return "risks";
  if (HEADER_NEXT.test(line)) return "next";
  if (HEADER_SESSION.test(line)) return "session";
  if (HEADER_DATE.test(line)) return "date";
  if (HEADER_PRIORITY.test(line)) return "priority";
  return null;
}

function parsePriority(raw: string): Priority | null {
  const value = raw.trim().toUpperCase();
  if (value === "URGENT" || value === "P0" || value === "HIGH") return "URGENT";
  if (value === "NORMAL" || value === "P1" || value === "P2" || value === "LOW") return "NORMAL";
  return null;
}

function firstMatch(line: string, pattern: RegExp): string | null {
  const match = line.match(pattern);
  const rest = match?.[2]?.trim();
  return rest ? rest : null;
}

function inlineField(line: string): { field: SplitField; value: string } | null {
  const from = firstMatch(line, INLINE_FROM);
  if (from) return { field: "from", value: from };
  const to = firstMatch(line, INLINE_TO);
  if (to) return { field: "to", value: to };
  const goal = firstMatch(line, INLINE_GOAL);
  if (goal) return { field: "goal", value: goal };
  const done = firstMatch(line, INLINE_DONE);
  if (done) return { field: "done", value: done };
  const risks = firstMatch(line, INLINE_RISKS);
  if (risks) return { field: "risks", value: risks };
  const next = firstMatch(line, INLINE_NEXT);
  if (next) return { field: "next", value: next };
  const session = firstMatch(line, INLINE_SESSION);
  if (session) return { field: "session", value: session };
  const date = firstMatch(line, INLINE_DATE);
  if (date) return { field: "date", value: date };
  const priority = firstMatch(line, INLINE_PRIORITY);
  if (priority) return { field: "priority", value: priority };
  return null;
}

function setScalar(target: { current: string }, value: string): void {
  target.current = target.current ? `${target.current} ${value}` : value;
}

/**
 * Heuristically split pasted free text into handoff fields.
 * Headers: From, To, Goal, Done, Risks, Next, Session, Date, Priority.
 * Approximate — not a parser. Review the card.
 */
export function splitPaste(raw: string): SplitResult {
  const from = { current: "" };
  const to = { current: "" };
  const goal = { current: "" };
  const next = { current: "" };
  const session = { current: "" };
  const date = { current: "" };
  const done: string[] = [];
  const risks: string[] = [];
  let priority: Priority | null = null;
  let current: SplitField | null = null;
  let guessed = 0;

  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  for (const original of lines) {
    const trimmed = original.trim();
    if (!trimmed) continue;

    const inline = inlineField(trimmed);
    if (inline) {
      current = inline.field;
      applyValue(inline.field, inline.value);
      continue;
    }

    const headerOnly = headerField(stripDecor(trimmed.replace(/:\s*$/, "")));
    if (headerOnly) {
      current = headerOnly;
      continue;
    }

    const line = stripDecor(trimmed);
    if (!line) continue;

    if (!current) {
      guessed += 1;
      done.push(line);
      continue;
    }

    if (current !== "done" && current !== "risks") {
      guessed += 1;
    }
    applyValue(current, line);
  }

  function applyValue(field: SplitField, value: string): void {
    if (field === "from") setScalar(from, value);
    else if (field === "to") setScalar(to, value);
    else if (field === "goal") setScalar(goal, value);
    else if (field === "next") setScalar(next, value);
    else if (field === "session") setScalar(session, value);
    else if (field === "date") setScalar(date, value);
    else if (field === "done") done.push(value);
    else if (field === "risks") risks.push(value);
    else if (field === "priority") priority = parsePriority(value) ?? priority;
  }

  return {
    from: from.current.trim(),
    to: to.current.trim(),
    goal: goal.current.trim(),
    done: uniqueBullets(done),
    risks: uniqueBullets(risks),
    next: next.current.trim(),
    session: session.current.trim(),
    date: date.current.trim(),
    priority,
    guessed,
  };
}

export function splitHasContent(result: SplitResult): boolean {
  return Boolean(
    result.from ||
      result.to ||
      result.goal ||
      result.next ||
      result.session ||
      result.date ||
      result.priority ||
      result.done.length ||
      result.risks.length,
  );
}

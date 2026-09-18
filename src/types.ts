export type Priority = "NORMAL" | "URGENT";
export type BulletBucket = "done" | "risks";

export interface HandoffDraft {
  from: string;
  to: string;
  goal: string;
  done: string[];
  risks: string[];
  next: string;
  session: string;
  date: string;
  priority: Priority;
}

export interface HandoffSlipDoc {
  schema: "smf.handoff-slip.v1";
  id: string;
  from: string;
  to: string;
  goal: string;
  done: string[];
  risks: string[];
  next: string;
  session: string;
  date: string;
  priority: Priority;
  issuedAt: string;
  heuristic: true;
}

export interface SampleMeta {
  id: string;
  file: string;
  label: string;
  blurb: string;
  draft: HandoffDraft;
}

export const SLIP_SCHEMA = "smf.handoff-slip.v1" as const;

export const EMPTY_DRAFT: HandoffDraft = {
  from: "",
  to: "",
  goal: "",
  done: [],
  risks: [],
  next: "",
  session: "",
  date: "",
  priority: "NORMAL",
};

export const MAX_BULLET_LENGTH = 160;
export const MAX_BULLETS = 8;
export const MAX_NEXT_LENGTH = 220;

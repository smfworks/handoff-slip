import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { splitHasContent, splitPaste } from "./split.ts";

describe("splitPaste", () => {
  it("splits header blocks into from / to / goal / done / risks / next", () => {
    const text = `
From:
Literature scout

To:
Brief writer

Goal:
Ship a one-pager

Done so far:
- Mapped the APIs
- Cited sources

Open risks:
- Stale rate limits

Next action:
Write the brief
`;
    const result = splitPaste(text);
    assert.equal(result.from, "Literature scout");
    assert.equal(result.to, "Brief writer");
    assert.equal(result.goal, "Ship a one-pager");
    assert.deepEqual(result.done, ["Mapped the APIs", "Cited sources"]);
    assert.deepEqual(result.risks, ["Stale rate limits"]);
    assert.equal(result.next, "Write the brief");
    assert.equal(splitHasContent(result), true);
  });

  it("reads inline From: / To: / Goal: / Next: lines", () => {
    const result = splitPaste(
      "From: Debug agent\nTo: Fixer agent\nGoal: Patch the hang\nNext: Guard the export frame",
    );
    assert.equal(result.from, "Debug agent");
    assert.equal(result.to, "Fixer agent");
    assert.equal(result.goal, "Patch the hang");
    assert.equal(result.next, "Guard the export frame");
  });

  it("parses priority and session, strips bullets and numbers", () => {
    const result = splitPaste(
      "Priority: URGENT\nSession: night → morning\nDone:\n1. Restarted the box\n* Queued two alerts\nRisks:\n- Disk at 81%",
    );
    assert.equal(result.priority, "URGENT");
    assert.equal(result.session, "night → morning");
    assert.deepEqual(result.done, ["Restarted the box", "Queued two alerts"]);
    assert.deepEqual(result.risks, ["Disk at 81%"]);
  });

  it("returns empty fields for blank input", () => {
    const result = splitPaste("   \n\n");
    assert.equal(result.from, "");
    assert.equal(result.to, "");
    assert.equal(result.goal, "");
    assert.equal(result.next, "");
    assert.deepEqual(result.done, []);
    assert.deepEqual(result.risks, []);
    assert.equal(result.priority, null);
    assert.equal(splitHasContent(result), false);
  });
});

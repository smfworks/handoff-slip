import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { SAMPLES } from "../data/samples.ts";
import { EMPTY_DRAFT, SLIP_SCHEMA } from "../types.ts";
import { canExport, parseSlipObject, serializeSlip, slipId, slugify } from "./slip.ts";

const sampleDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../public/samples");
const frozen = new Date("2026-09-18T18:40:00.000Z");

function loadPublicSample(id: string): unknown {
  return JSON.parse(readFileSync(join(sampleDir, `${id}.json`), "utf8"));
}

describe("serializeSlip", () => {
  it("emits a stable v1 handoff", () => {
    const slip = serializeSlip(SAMPLES[0].draft, frozen);
    assert.equal(slip.schema, SLIP_SCHEMA);
    assert.match(slip.id, /^HS-[0-9A-F]{4}$/);
    assert.equal(slip.issuedAt, frozen.toISOString());
    assert.equal(slip.heuristic, true);
    assert.equal(canExport(slip), true);
  });

  it("does not export until from, to, goal, and next are filled", () => {
    assert.equal(canExport(serializeSlip(EMPTY_DRAFT, frozen)), false);
    assert.equal(canExport(serializeSlip({ ...SAMPLES[0].draft, next: "" }, frozen)), false);
    assert.equal(canExport(serializeSlip({ ...SAMPLES[0].draft, from: "" }, frozen)), false);
  });
});

describe("public samples", () => {
  for (const sample of SAMPLES) {
    it(`${sample.id} JSON matches the in-app draft`, () => {
      const file = loadPublicSample(sample.id);
      const fromFile = parseSlipObject(file);
      assert.ok(fromFile, `failed to parse ${sample.id}.json`);
      const expected = serializeSlip(sample.draft, frozen);
      const actual = serializeSlip(fromFile, frozen);
      assert.equal(actual.from, expected.from);
      assert.equal(actual.to, expected.to);
      assert.equal(actual.goal, expected.goal);
      assert.equal(actual.next, expected.next);
      assert.deepEqual(actual.done, expected.done);
      assert.deepEqual(actual.risks, expected.risks);
      assert.equal(actual.priority, expected.priority);
      assert.equal(canExport(actual), true);
    });
  }
});

describe("helpers", () => {
  it("builds a stable HS id and slug", () => {
    assert.equal(slipId("same"), slipId("same"));
    assert.notEqual(slipId("same"), slipId("other"));
    assert.match(slipId("same"), /^HS-[0-9A-F]{4}$/);
    assert.equal(slugify("Research to writer"), "research-to-writer");
    assert.equal(slugify("   "), "handoff");
  });
});

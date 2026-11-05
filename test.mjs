import assert from "node:assert/strict";
import { scan, clean, summarize, hex, position } from "./index.mjs";

const sample = "a\u200Bb\u00A0c\u201Dd\u200B";
const findings = scan(sample);

assert.ok(findings.length >= 2, "expected at least two findings");
assert.ok(findings.some((row) => row.codePoint === 0x200b), "zero-width space found");
assert.ok(findings.some((row) => row.codePoint === 0x00a0), "non-breaking space found");
assert.equal(clean(sample).includes("\u200B"), false, "zero-width removed");
assert.equal(clean(sample).includes("\u00A0"), false, "non-breaking space normalized");
assert.ok(clean(sample).includes(" "), "normalized to a regular space");

const typographic = clean("\u201Chi\u201D \u2014 ok\u2026", { typographic: true });
assert.equal(typographic, "\"hi\" - ok...", "typographic normalization");

const mixed = scan("\u201Chi\u201D", { typographic: true });
assert.ok(mixed.some((row) => row.codePoint === 0x201c), "smart quote detected when requested");
assert.equal(scan("\u201Chi\u201D").length, 0, "smart quotes ignored by default");

const fullwidth = clean("\uFF08ok\uFF09", { typographic: true });
assert.equal(fullwidth, "(ok)", "full-width punctuation normalized");

assert.equal(hex(0x200b), "U+200B");
assert.deepEqual(position("one\ntwo", 4), { line: 2, column: 1 });
assert.deepEqual(summarize(scan(sample)), { total: 3, codePoints: 2 });

console.log("strip-invisible: all tests passed");

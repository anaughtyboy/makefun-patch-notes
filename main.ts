import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// One line: a software patch note for a bug in human biology,
// in the terse register of a real release note.
const LINE =
  "v3.2.1: fixed a bug where the brain replayed your most embarrassing moment from 2009 every night at 3:00 AM.";

function fail(message: string): never {
  throw new Error(`patch-notes entry: ${message}`);
}

// The gate wants 1-160 characters, a single line, not only whitespace.
if (LINE.length < 1 || LINE.length > 160) {
  fail(`line is ${LINE.length} characters, must be 1-160`);
}
if (LINE.includes("\n") || LINE.includes("\r")) {
  fail("line must be a single line");
}
if (LINE.trim().length === 0) {
  fail("line must not be only whitespace");
}
if (LINE !== LINE.trim()) {
  fail("line must not have leading or trailing whitespace");
}
// Control characters (other than the newlines already rejected) would
// not survive the gate's UTF-8 text check, so refuse them up front.
for (const ch of LINE) {
  if (ch.charCodeAt(0) < 32) {
    fail(`line contains a control character (U+${ch.charCodeAt(0).toString(16).padStart(4, "0")})`);
  }
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, "entry.txt");
writeFileSync(outputPath, LINE, "utf8");

// Read it back and confirm the file matches the line byte for byte.
const roundTrip = readFileSync(outputPath, "utf8");
if (roundTrip !== LINE) {
  fail("read-back mismatch: entry.txt does not match the line byte for byte");
}

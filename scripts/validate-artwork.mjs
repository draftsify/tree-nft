#!/usr/bin/env node
/**
 * Refuses to let a collection proceed with missing or broken artwork.
 *
 * Checks every expected file exists, is a real PNG, is not a zero-byte or
 * near-empty placeholder, and reports duplicates by content hash so an
 * accidental copy is caught before it is minted rather than after.
 *
 *   node scripts/validate-artwork.mjs
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const DIR = "artwork/base";
const SUPPLY = 1000;
const MIN_BYTES = 20_000; // a real render; a blank or error image is far smaller
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function name(n) {
  return `${String(n).padStart(4, "0")}.png`;
}

async function main() {
  let present;
  try {
    present = new Set(await readdir(DIR));
  } catch {
    console.error(`Missing ${DIR}/. Nothing to validate yet.`);
    process.exit(1);
  }

  const missing = [];
  const tooSmall = [];
  const notPng = [];
  const hashes = new Map();

  for (let n = 1; n <= SUPPLY; n++) {
    const file = name(n);
    if (!present.has(file)) {
      missing.push(file);
      continue;
    }
    const full = path.join(DIR, file);
    const { size } = await stat(full);
    if (size < MIN_BYTES) tooSmall.push(`${file} (${size} bytes)`);

    const buf = await readFile(full);
    if (!buf.subarray(0, 8).equals(PNG_MAGIC)) notPng.push(file);

    const hash = createHash("sha256").update(buf).digest("hex");
    if (!hashes.has(hash)) hashes.set(hash, []);
    hashes.get(hash).push(file);
  }

  const extra = [...present].filter(
    (f) => f.endsWith(".png") && !/^\d{4}\.png$/.test(f),
  );
  const duplicates = [...hashes.values()].filter((files) => files.length > 1);

  const report = (label, items, limit = 12) => {
    if (items.length === 0) return;
    console.error(`\n${label}: ${items.length}`);
    for (const item of items.slice(0, limit)) console.error(`  ${item}`);
    if (items.length > limit) console.error(`  … and ${items.length - limit} more`);
  };

  report("Missing", missing);
  report("Not a PNG", notPng);
  report(`Under ${MIN_BYTES} bytes`, tooSmall);
  report("Unexpected filenames", extra);
  report(
    "Identical content",
    duplicates.map((files) => files.join(" = ")),
  );

  const failed =
    missing.length || notPng.length || tooSmall.length || duplicates.length;

  if (failed) {
    console.error(
      `\nFAILED. ${SUPPLY - missing.length}/${SUPPLY} present. Fix the above before generating metadata.\n`,
    );
    process.exit(1);
  }

  console.log(`OK — ${SUPPLY}/${SUPPLY} artworks present, all distinct PNGs.`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

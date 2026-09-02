#!/usr/bin/env node
/**
 * Computes the provenance hash committed at deployment.
 *
 * The hash covers the trait file and every master it draws on, so once it is
 * written into the contract nobody can quietly reassign a token to a different
 * species, silhouette or season, and nobody can swap a master for a different
 * photograph. Recomputing it later is how anyone checks that.
 *
 *   node scripts/provenance.mjs
 */

import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const MASTERS = "public/masters";

async function main() {
  const trees = await readFile("data/trees.json", "utf8");
  const treesHash = createHash("sha256").update(trees).digest("hex");

  // Masters in a fixed order, each by content, so a re-export changes the hash.
  const files = (await readdir(MASTERS)).filter((f) => f.endsWith(".webp")).sort();
  const lines = [];
  for (const file of files) {
    const bytes = await readFile(path.join(MASTERS, file));
    lines.push(`${file} ${createHash("sha256").update(bytes).digest("hex")}`);
  }

  const manifest = [`trees.json ${treesHash}`, ...lines].join("\n");
  const provenance = createHash("sha256").update(manifest).digest("hex");

  console.log(manifest);
  console.log("");
  console.log(`masters: ${files.length}`);
  console.log(`PROVENANCE_HASH=0x${provenance}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

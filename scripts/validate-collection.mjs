#!/usr/bin/env node
/**
 * Checks the collection is renderable before anything is deployed.
 *
 * The artwork is composed from eighteen masters rather than stored as four
 * thousand files, so what has to be verified is different: every master a
 * token asks for must exist and be a real image, every trait must map to a
 * known transform, and the trait distribution must still match the supply
 * table published on the site.
 *
 *   node scripts/validate-collection.mjs
 */

import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const MASTERS = "public/masters";
const MIN_BYTES = 20_000;

const SPECIES_SUPPLY = { oak: 320, pine: 240, maple: 190, sakura: 140, redwood: 80, baobab: 30 };
const RARITY_SUPPLY = { Common: 600, Uncommon: 250, Rare: 100, Epic: 40, Legendary: 10 };
const VARIANTS = 3;

const FORESTS = ["Highland", "Coastal", "Riverbank", "Ridge", "Valley Floor"];
const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
const CANOPIES = ["Dense", "Open", "Layered", "Windswept", "Twin Crown"];
const TRUNKS = ["Straight", "Leaning", "Split", "Burl", "Hollow"];
const EFFECTS = ["None", "Morning Light", "Rain", "Frost", "Fireflies"];

const problems = [];
const note = (m) => problems.push(m);

async function main() {
  const raw = JSON.parse(await readFile("data/trees.json", "utf8"));
  const trees = raw.trees;

  if (trees.length !== raw.supply) {
    note(`trees.json holds ${trees.length} entries but declares supply ${raw.supply}`);
  }

  // every master a token could ask for
  const wanted = new Set();
  for (const t of trees) wanted.add(`${t.species}-${t.variant}.webp`);
  for (const file of [...wanted].sort()) {
    const full = path.join(MASTERS, file);
    try {
      const { size } = await stat(full);
      if (size < MIN_BYTES) note(`${file} is only ${size} bytes`);
    } catch {
      note(`missing master ${file}`);
    }
  }

  // every trait maps to a transform the renderer knows
  const known = { forest: FORESTS, season: SEASONS, canopy: CANOPIES, trunk: TRUNKS, effect: EFFECTS };
  const seen = new Set();
  for (const t of trees) {
    for (const [key, allowed] of Object.entries(known)) {
      if (!allowed.includes(t[key])) {
        const k = `${key}:${t[key]}`;
        if (!seen.has(k)) {
          seen.add(k);
          note(`unknown ${key} value "${t[key]}" (first seen on token ${t.number})`);
        }
      }
    }
    if (!(t.species in SPECIES_SUPPLY)) note(`unknown species "${t.species}" on token ${t.number}`);
    if (t.variant < 0 || t.variant >= VARIANTS) note(`variant ${t.variant} out of range on token ${t.number}`);
  }

  // the distribution still matches what the site promises
  const bySpecies = {};
  const byRarity = {};
  const numbers = new Set();
  for (const t of trees) {
    bySpecies[t.species] = (bySpecies[t.species] ?? 0) + 1;
    byRarity[t.rarity] = (byRarity[t.rarity] ?? 0) + 1;
    if (numbers.has(t.number)) note(`duplicate token number ${t.number}`);
    numbers.add(t.number);
  }
  for (const [k, expected] of Object.entries(SPECIES_SUPPLY)) {
    if (bySpecies[k] !== expected) note(`${k}: ${bySpecies[k] ?? 0} tokens, site says ${expected}`);
  }
  for (const [k, expected] of Object.entries(RARITY_SUPPLY)) {
    if (byRarity[k] !== expected) note(`${k}: ${byRarity[k] ?? 0} tokens, site says ${expected}`);
  }
  for (let n = 1; n <= trees.length; n++) {
    if (!numbers.has(n)) note(`token number ${n} is missing`);
  }

  if (problems.length) {
    console.error(`\nFAILED — ${problems.length} problem${problems.length === 1 ? "" : "s"}:\n`);
    for (const p of problems.slice(0, 20)) console.error(`  ${p}`);
    if (problems.length > 20) console.error(`  … and ${problems.length - 20} more`);
    console.error("");
    process.exit(1);
  }

  console.log(`OK — ${trees.length} tokens, ${wanted.size} masters, distribution matches.`);
  console.log("  species  ", bySpecies);
  console.log("  rarity   ", byRarity);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

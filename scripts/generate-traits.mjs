#!/usr/bin/env node
/**
 * Writes data/trees.json: one deterministic trait set per token.
 *
 * The allocation table below is fixed rather than sampled, because the supply
 * figures published on the site are a promise. Sampling would land near them;
 * this lands on them, and the script asserts as much before writing.
 *
 *   node scripts/generate-traits.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const SUPPLY = 1000;
/** Photographed silhouettes available per species. */
const VARIANTS = 3;
// Every trait in data/trees.json falls out of this string. Changing it
// reshuffles all 1,000 tokens, so it stays as written whatever the
// collection is called.
const SEED = "tree-genesis-forest-v1";

/**
 * How many of each species sits in each rarity tier.
 *
 * Constrained by the rules the site states: Baobab is never issued below Epic,
 * Redwood never below Rare, and the two of them are the only Legendaries.
 * Column totals are the rarity supplies, row totals the species supplies.
 */
const ALLOCATION = {
  //          Common Uncommon Rare Epic Legendary
  oak: [226, 94, 0, 0, 0], // 320
  pine: [169, 71, 0, 0, 0], // 240
  maple: [124, 52, 14, 0, 0], // 190
  sakura: [81, 33, 20, 6, 0], // 140
  redwood: [0, 0, 66, 10, 4], // 80
  baobab: [0, 0, 0, 24, 6], // 30
};

const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
const RARITY_SUPPLY = [600, 250, 100, 40, 10];
const SPECIES_SUPPLY = { oak: 320, pine: 240, maple: 190, sakura: 140, redwood: 80, baobab: 30 };

const REGION = {
  oak: "Temperate Europe",
  pine: "Boreal North",
  maple: "North America",
  sakura: "East Asia",
  redwood: "Pacific Coast",
  baobab: "Sub-Saharan Africa",
};

/** Secondary traits, sampled. Weights are deliberate, not uniform. */
const TRAITS = {
  Forest: [
    ["Highland", 26], ["Coastal", 22], ["Riverbank", 22], ["Ridge", 18], ["Valley Floor", 12],
  ],
  Season: [["Spring", 30], ["Summer", 30], ["Autumn", 25], ["Winter", 15]],
  Canopy: [
    ["Dense", 34], ["Open", 26], ["Layered", 20], ["Windswept", 14], ["Twin Crown", 6],
  ],
  Trunk: [["Straight", 34], ["Leaning", 24], ["Split", 20], ["Burl", 15], ["Hollow", 7]],
  Effect: [
    ["None", 62], ["Morning Light", 16], ["Rain", 11], ["Frost", 8], ["Fireflies", 3],
  ],
};

/* ── deterministic randomness ─────────────────────────── */

/** A counter-mode hash stream: same seed, same sequence, on any machine. */
function rng(seed) {
  let counter = 0;
  let pool = Buffer.alloc(0);
  let offset = 0;
  return () => {
    if (offset + 4 > pool.length) {
      pool = createHash("sha256").update(`${seed}:${counter++}`).digest();
      offset = 0;
    }
    const value = pool.readUInt32BE(offset);
    offset += 4;
    return value / 0x1_0000_0000;
  };
}

function weighted(random, table) {
  const total = table.reduce((sum, [, w]) => sum + w, 0);
  let roll = random() * total;
  for (const [value, weight] of table) {
    roll -= weight;
    if (roll < 0) return value;
  }
  return table[table.length - 1][0];
}

/** Fisher–Yates, driven by the same stream. */
function shuffle(random, items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ── build ────────────────────────────────────────────── */

function assertAllocation() {
  const speciesTotals = Object.fromEntries(
    Object.entries(ALLOCATION).map(([s, row]) => [s, row.reduce((a, b) => a + b, 0)]),
  );
  for (const [species, expected] of Object.entries(SPECIES_SUPPLY)) {
    if (speciesTotals[species] !== expected) {
      throw new Error(
        `${species}: allocation totals ${speciesTotals[species]}, supply says ${expected}`,
      );
    }
  }
  for (let i = 0; i < RARITIES.length; i++) {
    const column = Object.values(ALLOCATION).reduce((sum, row) => sum + row[i], 0);
    if (column !== RARITY_SUPPLY[i]) {
      throw new Error(
        `${RARITIES[i]}: allocation totals ${column}, supply says ${RARITY_SUPPLY[i]}`,
      );
    }
  }
  const grand = Object.values(SPECIES_SUPPLY).reduce((a, b) => a + b, 0);
  if (grand !== SUPPLY) throw new Error(`allocation totals ${grand}, expected ${SUPPLY}`);
}

async function main() {
  assertAllocation();
  const random = rng(SEED);

  // One entry per token, then shuffled, so rarity is not clustered by index.
  const pairs = [];
  for (const [species, row] of Object.entries(ALLOCATION)) {
    row.forEach((count, i) => {
      for (let n = 0; n < count; n++) pairs.push({ species, rarity: RARITIES[i] });
    });
  }

  const trees = shuffle(random, pairs).map((pair, i) => {
    const number = i + 1;
    return {
      // 1-based token number, matching artwork/base/NNNN.png
      number,
      name: `Tree #${String(number).padStart(4, "0")}`,
      species: pair.species,
      // Which photographed silhouette of that species this token uses.
      variant: Math.floor(random() * VARIANTS),
      rarity: pair.rarity,
      region: REGION[pair.species],
      forest: weighted(random, TRAITS.Forest),
      season: weighted(random, TRAITS.Season),
      canopy: weighted(random, TRAITS.Canopy),
      trunk: weighted(random, TRAITS.Trunk),
      effect: weighted(random, TRAITS.Effect),
    };
  });

  await mkdir("data", { recursive: true });
  const payload = {
    seed: SEED,
    supply: SUPPLY,
    generatedAt: new Date().toISOString().slice(0, 10),
    trees,
  };
  await writeFile("data/trees.json", JSON.stringify(payload, null, 2) + "\n");

  // A short report, so the distribution can be eyeballed against the site.
  const bySpecies = {};
  const byRarity = {};
  for (const t of trees) {
    bySpecies[t.species] = (bySpecies[t.species] ?? 0) + 1;
    byRarity[t.rarity] = (byRarity[t.rarity] ?? 0) + 1;
  }
  console.log(`Wrote data/trees.json — ${trees.length} tokens`);
  console.log("  species  ", bySpecies);
  console.log("  rarity   ", byRarity);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

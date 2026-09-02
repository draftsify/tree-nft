import treesData from "@/../data/trees.json";

/**
 * How a token's traits become an image.
 *
 * The collection is composed, not hand-drawn: eighteen photographed specimen
 * trees (six species, three silhouettes each) are the only source material, and
 * every token is one of those under a deterministic set of transforms taken
 * from its traits. That is what lets the published supply table be exact —
 * traits are decided first, the picture follows.
 *
 * Rendering happens on request rather than as four thousand committed files.
 * The output is immutable for a given token and stage, so it is cached
 * forever by the CDN and each image is composed at most once.
 */

export type Tree = {
  number: number;
  name: string;
  species: string;
  variant: number;
  rarity: string;
  region: string;
  forest: string;
  season: string;
  canopy: string;
  trunk: string;
  effect: string;
};

export const TREES_DATA = treesData as { seed: string; supply: number; trees: Tree[] };
export const SUPPLY = TREES_DATA.supply;

/** 0-based artwork index, as the contract computes it. */
export function treeByIndex(index: number): Tree | null {
  if (!Number.isInteger(index) || index < 0 || index >= SUPPLY) return null;
  return TREES_DATA.trees[index] ?? null;
}

export function masterFile(tree: Tree) {
  return `${tree.species}-${tree.variant}.webp`;
}

/* ── the transforms ───────────────────────────────────── */

/** Ground colour behind the tree, chosen by where the tree is said to grow. */
export const FOREST_GROUND: Record<string, string> = {
  Highland: "#e9ece7",
  Coastal: "#e6ecee",
  Riverbank: "#e8ece9",
  Ridge: "#efece6",
  "Valley Floor": "#eceae2",
};

type Grade = { hue: number; saturation: number; brightness: number };

/** Season regrades the foliage. Winter also drains it. */
const DECIDUOUS_SEASON: Record<string, Grade> = {
  Spring: { hue: 8, saturation: 1.08, brightness: 1.04 },
  Summer: { hue: 0, saturation: 1.0, brightness: 1.0 },
  Autumn: { hue: -34, saturation: 1.22, brightness: 0.98 },
  Winter: { hue: 6, saturation: 0.55, brightness: 1.02 },
};

/**
 * Conifers keep their needles, so autumn barely touches them and winter only
 * cools them. Applying the deciduous curve turned pines pink, which is the
 * kind of detail that gives a composed collection away.
 */
const EVERGREEN_SEASON: Record<string, Grade> = {
  Spring: { hue: 4, saturation: 1.04, brightness: 1.03 },
  Summer: { hue: 0, saturation: 1.0, brightness: 1.0 },
  Autumn: { hue: -4, saturation: 0.96, brightness: 0.97 },
  Winter: { hue: 10, saturation: 0.82, brightness: 1.01 },
};

const EVERGREEN = new Set(["pine", "redwood"]);

export function seasonGrade(tree: Tree): Grade {
  const table = EVERGREEN.has(tree.species) ? EVERGREEN_SEASON : DECIDUOUS_SEASON;
  return table[tree.season] ?? table.Summer;
}

/** A wash over the whole frame. Kept to light, not particles. */
export const EFFECT_WASH: Record<
  string,
  { colour: string; opacity: number } | null
> = {
  None: null,
  "Morning Light": { colour: "#ffd9a0", opacity: 0.16 },
  Rain: { colour: "#9fb4c4", opacity: 0.14 },
  Frost: { colour: "#cfe2ef", opacity: 0.2 },
  Fireflies: { colour: "#ffe9a8", opacity: 0.12 },
};

/**
 * How much of the frame the tree fills at each stage.
 *
 * Stage is collection-wide and set by the contract's `stage()`, so all four
 * renders exist from the start and the one served changes as donations
 * accumulate.
 */
export const STAGE_SCALE = [0.34, 0.52, 0.74, 0.94];

export const STAGE_LABEL = ["Seed", "Sapling", "Young Tree", "Mature Tree"];

/** Canopy and trunk nudge the framing, so two same-species tokens differ. */
export function framing(tree: Tree) {
  const canopyLift: Record<string, number> = {
    Dense: 0,
    Open: 0.01,
    Layered: -0.01,
    Windswept: 0.02,
    "Twin Crown": -0.02,
  };
  const trunkShift: Record<string, number> = {
    Straight: 0,
    Leaning: 0.025,
    Split: -0.02,
    Burl: 0.012,
    Hollow: -0.03,
  };
  return {
    /** Horizontal offset as a fraction of frame width. */
    dx: trunkShift[tree.trunk] ?? 0,
    /** Vertical offset as a fraction of frame height. */
    dy: canopyLift[tree.canopy] ?? 0,
  };
}

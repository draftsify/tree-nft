/**
 * The application's data layer, currently unbacked.
 *
 * Nothing here reads a chain or a backend. The ledger is deliberately empty:
 * no donation has been made, no partner agreement is signed and no token has
 * been minted, so every figure the interface would otherwise assert is zero.
 * The shapes are the ones an indexer will fill.
 *
 * `TREES` is the exception. It is a preview of the trait system rather than a
 * record of anything, so every entry sits at the Seed stage: the artwork can be
 * reviewed without the grid implying that tokens exist.
 */

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export type StageId = "seed" | "sapling" | "young" | "mature";

export type SpeciesId =
  | "oak"
  | "pine"
  | "maple"
  | "sakura"
  | "redwood"
  | "baobab";

export type ImpactStatus =
  | "pending"
  | "funded"
  | "allocated"
  | "planted"
  | "verified";

/* ── taxonomy ─────────────────────────────────────────── */

export const STAGES: {
  id: StageId;
  label: string;
  blurb: string;
  /** Milestone that unlocks this stage. Nothing unlocks on a timer. */
  unlock: string;
}[] = [
  {
    id: "seed",
    label: "Seed",
    blurb: "The token has been issued. Its share of the mint is held in the reforestation address and has not been sent.",
    unlock: "Mint confirmed",
  },
  {
    id: "sapling",
    label: "Sapling",
    blurb: "The reforestation share has been sent to a partner organisation. The transaction hash is published on the impact page.",
    unlock: "Donation transaction settled",
  },
  {
    id: "young",
    label: "Young Tree",
    blurb: "The partner has assigned the batch to a named planting site and confirmed the season in writing.",
    unlock: "Allocation confirmed",
  },
  {
    id: "mature",
    label: "Mature Tree",
    blurb: "The partner has filed a dated planting report. It is attached to the batch and to every token it covers.",
    unlock: "Planting report verified",
  },
];

export const RARITIES: {
  id: Rarity;
  /** Share of the 10,000-token Genesis supply. */
  share: number;
  supply: number;
  tint: string;
  text: string;
}[] = [
  { id: "Common", share: 0.6, supply: 6000, tint: "#eceadf", text: "#4a4f46" },
  { id: "Uncommon", share: 0.25, supply: 2500, tint: "#dfe6d9", text: "#3f5138" },
  { id: "Rare", share: 0.1, supply: 1000, tint: "#cfdfe6", text: "#2f4c58" },
  { id: "Epic", share: 0.04, supply: 400, tint: "#e2d8ea", text: "#4c3a5c" },
  { id: "Legendary", share: 0.01, supply: 100, tint: "#efe0c8", text: "#6b4f1f" },
];

export const SPECIES: {
  id: SpeciesId;
  name: string;
  latin: string;
  supply: number;
  region: string;
  note: string;
}[] = [
  {
    id: "oak",
    name: "Oak",
    latin: "Quercus robur",
    supply: 3200,
    region: "Temperate Europe",
    note: "The base form, in clear green glass. Broad canopy and the largest supply in the collection.",
  },
  {
    id: "pine",
    name: "Pine",
    latin: "Pinus sylvestris",
    supply: 2400,
    region: "Boreal North",
    note: "Teal glass, narrower crown. Associated with the boreal planting sites.",
  },
  {
    id: "maple",
    name: "Maple",
    latin: "Acer saccharum",
    supply: 1900,
    region: "North America",
    note: "Rose glass. The only species whose canopy colour varies with the Season trait.",
  },
  {
    id: "sakura",
    name: "Sakura",
    latin: "Prunus serrulata",
    supply: 1400,
    region: "East Asia",
    note: "Pink blossom glass. Supply is set below Maple to reflect the shorter flowering window.",
  },
  {
    id: "redwood",
    name: "Redwood",
    latin: "Sequoia sempervirens",
    supply: 800,
    region: "Pacific Coast",
    note: "Copper glass, dense crown. Issued only at Rare and above.",
  },
  {
    id: "baobab",
    name: "Baobab",
    latin: "Adansonia digitata",
    supply: 300,
    region: "Sub-Saharan Africa",
    note: "Amber glass, and the smallest supply in the collection. Issued only at Epic and Legendary.",
  },
];

export const TRAIT_GROUPS: { name: string; values: string[] }[] = [
  { name: "Forest", values: ["Highland", "Coastal", "Riverbank", "Ridge", "Valley Floor"] },
  { name: "Region", values: ["Temperate", "Boreal", "Tropical", "Mediterranean", "Highland"] },
  { name: "Season", values: ["Spring", "Summer", "Autumn", "Winter"] },
  { name: "Background", values: ["Paper", "Mist", "Overcast", "Dusk", "Clear"] },
  { name: "Canopy", values: ["Dense", "Open", "Layered", "Windswept", "Twin Crown"] },
  { name: "Trunk", values: ["Straight", "Leaning", "Split", "Burl", "Hollow"] },
  { name: "Effect", values: ["None", "Morning Light", "Rain", "Frost", "Fireflies"] },
];

/* ── collection ───────────────────────────────────────── */

/** Mint price, shared by the token rows and the MINT block below. */
const MINT_PRICE_ETH = 0.0016;

export type Tree = {
  id: number;
  tokenId: string;
  species: SpeciesId;
  rarity: Rarity;
  stage: StageId;
  forest: string;
  region: string;
  season: string;
  canopy: string;
  trunk: string;
  effect: string;
  genesis: boolean;
  /** Set once a partner confirms cost per tree. Null until then. */
  treesFunded: number | null;
  /** Null until the token is minted. */
  owner: string | null;
  /** Null until the token is minted. */
  mintedAt: string | null;
  status: ImpactStatus;
  priceEth: number;
};

const FORESTS = ["Highland", "Coastal", "Riverbank", "Ridge", "Valley Floor"];
const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
const CANOPIES = ["Dense", "Open", "Layered", "Windswept", "Twin Crown"];
const TRUNKS = ["Straight", "Leaning", "Split", "Burl", "Hollow"];
const EFFECTS = ["None", "None", "Morning Light", "Rain", "Frost", "Fireflies"];
/** Deterministic pseudo-random so server and client render the same grid. */
function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick<T>(r: () => number, arr: T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

function rarityFor(r: number): Rarity {
  if (r < 0.01) return "Legendary";
  if (r < 0.05) return "Epic";
  if (r < 0.15) return "Rare";
  if (r < 0.4) return "Uncommon";
  return "Common";
}

function speciesFor(rarity: Rarity, r: () => number): SpeciesId {
  if (rarity === "Legendary") return pick(r, ["baobab", "redwood"] as SpeciesId[]);
  if (rarity === "Epic") return pick(r, ["baobab", "redwood", "sakura"] as SpeciesId[]);
  if (rarity === "Rare") return pick(r, ["redwood", "sakura", "maple"] as SpeciesId[]);
  return pick(r, ["oak", "pine", "maple", "sakura"] as SpeciesId[]);
}

function makeTree(id: number): Tree {
  const r = rng(id + 1000);
  const rarity = rarityFor(r());
  const species = speciesFor(rarity, r);
  return {
    id,
    tokenId: String(id).padStart(5, "0"),
    species,
    rarity,
    // Nothing has been funded, so nothing has advanced past the first stage.
    stage: "seed",
    mintedAt: null,
    forest: pick(r, FORESTS),
    region: SPECIES.find((s) => s.id === species)!.region,
    season: pick(r, SEASONS),
    canopy: pick(r, CANOPIES),
    trunk: pick(r, TRUNKS),
    effect: pick(r, EFFECTS),
    genesis: true,
    treesFunded: null,
    owner: null,
    status: "pending",
    priceEth: MINT_PRICE_ETH,
  };
}

/**
 * A preview of the trait system, not a list of minted tokens. Rendered wherever
 * the artwork needs to be shown, always alongside a label saying so.
 */
export const TREES: Tree[] = Array.from({ length: 48 }, (_, i) => makeTree(i + 1));

/** Sample ids used to lay out the holder screen. Nobody holds anything yet. */
export const MY_TREE_IDS: number[] = [];

export function treeById(id: number): Tree {
  return TREES.find((t) => t.id === id) ?? makeTree(id);
}

export function speciesImage(id: SpeciesId, size: "sm" | "lg" = "sm") {
  return `/species/${id}${size === "lg" ? "-lg" : ""}.webp`;
}

/* ── impact ledger ────────────────────────────────────── */

export type Donation = {
  id: string;
  date: string;
  amountUsd: number;
  asset: string;
  amountAsset: string;
  txHash: string;
  chain: string;
  partner: string;
  projectId: string;
  region: string;
  status: ImpactStatus;
  treesFunded: number | null;
  verifiedAt: string | null;
};

export const DONATIONS: Donation[] = [];

export type Project = {
  id: string;
  name: string;
  country: string;
  region: string;
  status: ImpactStatus;
  hectares: number;
  species: string[];
  window: string;
};

export const PROJECTS: Project[] = [];

/**
 * Roll-ups for the impact page. Every figure is derived from the ledger above,
 * so the page reports zero for as long as the ledger is empty rather than
 * carrying a number that has to be remembered and cleared later.
 */
export const IMPACT = {
  minted: 0,
  supply: 10000,
  donatedUsd: DONATIONS.reduce((a, d) => a + d.amountUsd, 0),
  donatedEth: 0,
  treesFunded: DONATIONS.reduce((a, d) => a + (d.treesFunded ?? 0), 0),
  projects: PROJECTS.length,
  countries: new Set(PROJECTS.map((p) => p.country)).size,
  transactions: DONATIONS.length,
  holders: 0,
};

/* ── mint economics (draft) ───────────────────────────── */

export const MINT = {
  chain: "Robinhood Chain",
  standard: "ERC-721",
  priceEth: 0.0016,
  priceUsdApprox: 5,
  supply: 10000,
  perWallet: 5,
  /** Revenue split. Draft figures — set on-chain before launch. */
  split: [
    { label: "Reforestation partner", pct: 60, note: "Sent to partner organisations in batches. Each transaction hash is published." },
    { label: "Artwork & metadata", pct: 18, note: "Artwork production, trait generation and permanent metadata storage." },
    { label: "Operations", pct: 14, note: "Contract audit, gas, hosting and the verification process." },
    { label: "Treasury", pct: 8, note: "Multisig reserve held against future collections." },
  ],
  metadata: "Arweave, referenced by an on-chain pointer that resolves without our servers.",
};

export const FAQ: { q: string; a: string }[] = [
  {
    q: "How many trees does one mint fund?",
    a: "We have not set that figure. It will be published once a partner organisation confirms cost per tree in writing, and it will then be recorded in each token's metadata. What is already fixed is the mechanism: 60% of every mint is sent to reforestation partners, and each donation transaction hash is published on the impact page.",
  },
  {
    q: "Is a Tree token an investment?",
    a: "No. It is a collectible with a funding record attached. It pays no yield, carries no revenue share and confers no rights over the project. If you resell it, the price is set by the buyer and may be lower than the mint price.",
  },
  {
    q: "What causes a token to change stage?",
    a: "A verified milestone, not elapsed time. A token is issued as a Seed. It becomes a Sapling when the donation covering it settles on-chain, a Young Tree when the partner assigns that batch to a named site, and a Mature Tree when a dated planting report is filed. Each transition writes a new metadata version and the previous version remains readable.",
  },
  {
    q: "What happens to the funding record if the token is sold?",
    a: "It stays with the token. Ownership is a single field; the funding record is an append-only log keyed to the token id. The buyer inherits the full history, including the mint, every donation hash and every verification date.",
  },
  {
    q: "Which chain, and which standard?",
    a: "The collection is deployed on Robinhood Chain as an ERC-721. The standard is chosen because it is read by every major marketplace and indexer, so tokens can be traded without a venue of our own. Fees on the chain are low enough to write a new metadata version at each milestone rather than batching updates to reduce cost.",
  },
  {
    q: "Can metadata change after minting?",
    a: "Stage and impact fields are updatable by design, since that is how the evolution system works. Species, rarity and traits are frozen at mint, and the freeze is enforced by the contract rather than by policy. Every update is versioned, so the state of a token at any earlier point can be read back.",
  },
  {
    q: "What is the Genesis Forest?",
    a: "The first collection: 10,000 numbered tokens, each carrying a Genesis marker. It funds the first planting seasons and establishes the standard later collections will follow. The marker records that a token came from the first collection and carries no entitlement.",
  },
  {
    q: "What is the current status of the project?",
    a: "The interface is complete and is what you are looking at. No contract is deployed, no mint is live, no donation has been made and no partnership agreement is signed. Every figure shown on this site is placeholder data.",
  },
];

export const JOURNAL: { tag: string; date: string; title: string; read: string }[] = [
  { tag: "Method", date: "Aug 22, 2026", title: "How we assess a reforestation partner", read: "6 min" },
  { tag: "Field", date: "Jul 30, 2026", title: "What we require in a planting report", read: "9 min" },
  { tag: "Design", date: "Jun 11, 2026", title: "Building the trait system", read: "4 min" },
];

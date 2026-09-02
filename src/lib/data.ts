/**
 * Static demo data for the Tree UI.
 *
 * Nothing here touches a chain or a backend — every value is a placeholder so
 * the interface can be reviewed before the contract, the charity agreement and
 * the indexer exist. Anything that would become a public claim (trees funded,
 * donation totals, planting confirmations) is marked `provisional` so the UI
 * can label it honestly instead of stating it as fact.
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
  mintedAt: string;
  forest: string;
  region: string;
  season: string;
  canopy: string;
  trunk: string;
  effect: string;
  genesis: boolean;
  /** Trees the mint is expected to fund. Provisional until the partner confirms. */
  treesFunded: number;
  owner: string;
  status: ImpactStatus;
  priceEth: number;
};

const FORESTS = ["Highland", "Coastal", "Riverbank", "Ridge", "Valley Floor"];
const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
const CANOPIES = ["Dense", "Open", "Layered", "Windswept", "Twin Crown"];
const TRUNKS = ["Straight", "Leaning", "Split", "Burl", "Hollow"];
const EFFECTS = ["None", "None", "Morning Light", "Rain", "Frost", "Fireflies"];
const STATUSES: ImpactStatus[] = ["pending", "funded", "allocated", "planted", "verified"];
const STAGE_FOR_STATUS: Record<ImpactStatus, StageId> = {
  pending: "seed",
  funded: "sapling",
  allocated: "young",
  planted: "young",
  verified: "mature",
};

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
  const status = STATUSES[Math.floor(r() * STATUSES.length)];
  const month = 1 + Math.floor(r() * 9);
  return {
    id,
    tokenId: String(id).padStart(5, "0"),
    species,
    rarity,
    stage: STAGE_FOR_STATUS[status],
    mintedAt: `2026-${String(month).padStart(2, "0")}-${String(1 + Math.floor(r() * 27)).padStart(2, "0")}`,
    forest: pick(r, FORESTS),
    region: SPECIES.find((s) => s.id === species)!.region,
    season: pick(r, SEASONS),
    canopy: pick(r, CANOPIES),
    trunk: pick(r, TRUNKS),
    effect: pick(r, EFFECTS),
    genesis: true,
    treesFunded: 3,
    owner: `0x${(id * 7919).toString(16).padStart(4, "0")}…${(id * 31).toString(16).padStart(4, "0")}`,
    status,
    priceEth: MINT_PRICE_ETH,
  };
}

export const TREES: Tree[] = Array.from({ length: 48 }, (_, i) => makeTree(i + 1));

/** The wallet-connected demo user's holdings. */
export const MY_TREE_IDS = [4, 12, 27];

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

export const DONATIONS: Donation[] = [
  {
    id: "D-0007",
    date: "2026-08-18",
    amountUsd: 1250,
    asset: "ETH",
    amountAsset: "0.391 ETH",
    txHash: "0x7f2a91c4e8b3d5670a1f4e29c8b7d3a5610fe8c24b93d7a5e10c8f42b7d93a561",
    chain: "Base",
    partner: "Pending partner agreement",
    projectId: "PRJ-04",
    region: "Cascade Range, Oregon",
    status: "allocated",
    treesFunded: null,
    verifiedAt: null,
  },
  {
    id: "D-0006",
    date: "2026-07-02",
    amountUsd: 950,
    asset: "ETH",
    amountAsset: "0.297 ETH",
    txHash: "0x3c8d15af92b7e4c60d8a3f57192bce4d7a06f38c15be92d7a4c60f8b3d15ae927",
    chain: "Base",
    partner: "Pending partner agreement",
    projectId: "PRJ-03",
    region: "Atlantic Forest, Brazil",
    status: "planted",
    treesFunded: 910,
    verifiedAt: "2026-08-24",
  },
  {
    id: "D-0005",
    date: "2026-05-29",
    amountUsd: 750,
    asset: "ETH",
    amountAsset: "0.234 ETH",
    txHash: "0x91be47d3a08c5f26e94b17d3a6c085f27e14bd93a6c05f8e274bd13a96c05fe28",
    chain: "Base",
    partner: "Pending partner agreement",
    projectId: "PRJ-02",
    region: "Scottish Highlands",
    status: "verified",
    treesFunded: 720,
    verifiedAt: "2026-07-11",
  },
  {
    id: "D-0004",
    date: "2026-04-14",
    amountUsd: 550,
    asset: "ETH",
    amountAsset: "0.172 ETH",
    txHash: "0x2d6f83b19ac47e50d2f68a3b91c47e60d5f2a89b31c470ed5f2a68b93c17e40d5",
    chain: "Base",
    partner: "Pending partner agreement",
    projectId: "PRJ-01",
    region: "Kenya Highlands",
    status: "verified",
    treesFunded: 535,
    verifiedAt: "2026-06-02",
  },
  {
    id: "D-0003",
    date: "2026-03-06",
    amountUsd: 352,
    asset: "ETH",
    amountAsset: "0.110 ETH",
    txHash: "0x5a1c94e7d2b8036f5a1c94e7d2b8036f5a1c94e7d2b8036f5a1c94e7d2b8036f5",
    chain: "Base",
    partner: "Pending partner agreement",
    projectId: "PRJ-01",
    region: "Kenya Highlands",
    status: "verified",
    treesFunded: 340,
    verifiedAt: "2026-04-28",
  },
];

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

export const PROJECTS: Project[] = [
  { id: "PRJ-01", name: "Kijabe Watershed", country: "Kenya", region: "Kenya Highlands", status: "verified", hectares: 46, species: ["Cedar", "Podo"], window: "Mar–Jun 2026" },
  { id: "PRJ-02", name: "Caledonian Regrowth", country: "Scotland", region: "Scottish Highlands", status: "verified", hectares: 31, species: ["Scots Pine", "Birch"], window: "Apr–Jul 2026" },
  { id: "PRJ-03", name: "Serra do Mar Corridor", country: "Brazil", region: "Atlantic Forest", status: "planted", hectares: 58, species: ["Jequitibá", "Ipê"], window: "Jun–Aug 2026" },
  { id: "PRJ-04", name: "Cascade Burn Recovery", country: "United States", region: "Cascade Range", status: "allocated", hectares: 72, species: ["Douglas Fir", "Ponderosa"], window: "Sep–Nov 2026" },
  { id: "PRJ-05", name: "Mekong Delta Mangroves", country: "Vietnam", region: "Mekong Delta", status: "pending", hectares: 24, species: ["Rhizophora"], window: "Q4 2026" },
  { id: "PRJ-06", name: "Sierra Norte Cloud Forest", country: "Mexico", region: "Oaxaca", status: "pending", hectares: 19, species: ["Oyamel", "Oak"], window: "Q1 2027" },
  { id: "PRJ-07", name: "Białowieża Buffer", country: "Poland", region: "Podlaskie", status: "pending", hectares: 27, species: ["Hornbeam", "Spruce"], window: "Q1 2027" },
  { id: "PRJ-08", name: "Tasman Gully Restoration", country: "New Zealand", region: "South Island", status: "pending", hectares: 15, species: ["Kahikatea", "Rimu"], window: "Q2 2027" },
];

/** Roll-ups the /impact page shows. Provisional until the ledger is live. */
export const IMPACT = {
  minted: 1284,
  supply: 10000,
  donatedUsd: DONATIONS.reduce((a, d) => a + d.amountUsd, 0),
  donatedEth: 1.204,
  treesFunded: DONATIONS.reduce((a, d) => a + (d.treesFunded ?? 0), 0),
  projects: PROJECTS.length,
  countries: new Set(PROJECTS.map((p) => p.country)).size,
  transactions: DONATIONS.length,
  holders: 611,
};

/* ── mint economics (draft) ───────────────────────────── */

export const MINT = {
  chain: "Base",
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
    q: "Why Base and ERC-721?",
    a: "ERC-721 is read by every major marketplace, so tokens can be traded without a venue of our own. Base keeps minting and metadata updates cheap enough to write a new version at each milestone rather than batching updates to reduce cost.",
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

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
  /** What unlocks this stage. Read from the contract, never granted. */
  unlock: string;
}[] = [
  {
    id: "seed",
    label: "Seed",
    blurb: "The collection has begun. Every mint has already sent its reforestation share, but the total is still under the first threshold.",
    unlock: "From the first mint",
  },
  {
    id: "sapling",
    label: "Sapling",
    blurb: "The collection has donated a tenth of what a full sell-out would give. Every token advances together.",
    unlock: "0.96 ETH donated · about 1,000 mints",
  },
  {
    id: "young",
    label: "Young Tree",
    blurb: "Two fifths of the full donation is in. The canopy fills out for every holder at the same moment.",
    unlock: "3.84 ETH donated · about 4,000 mints",
  },
  {
    id: "mature",
    label: "Mature Tree",
    blurb: "Four fifths of the full donation is in. The final form, reached only if the collection nearly sells out.",
    unlock: "7.68 ETH donated · about 8,000 mints",
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

/**
 * Where the reforestation share goes.
 *
 * One Tree Planted publishes a crypto donation address and accepts donations
 * from anyone. That is the relationship: we send to a public address. It is not
 * a partnership, a sponsorship or an endorsement, and nothing here should be
 * read as One Tree Planted having reviewed or approved this project.
 */
export const PARTNER = {
  name: "One Tree Planted",
  url: "https://onetreeplanted.org",
  /** Where the organisation publishes the address below. */
  donateUrl: "https://onetreeplanted.org/pages/donate-crypto",
  /** Check against donateUrl before deploying: the contract bakes it in. */
  address: "0x62233D5483515A79ac06CEcEbac7D399fDF8a99b",
  relationship: "Public donation address. No agreement, sponsorship or endorsement.",
};

export const MINT = {
  chain: "Robinhood Chain",
  standard: "ERC-721",
  priceEth: 0.0016,
  priceUsdApprox: 5,
  supply: 10000,
  perWallet: 5,
  /** Revenue split. Draft figures — set on-chain before launch. */
  split: [
    { label: "Reforestation", pct: 60, note: "Leaves for One Tree Planted's donation address inside the minting transaction." },
    { label: "Artwork & metadata", pct: 18, note: "Artwork production, trait generation and permanent metadata storage." },
    { label: "Operations", pct: 14, note: "Contract audit, gas, hosting and the verification process." },
    { label: "Treasury", pct: 8, note: "Multisig reserve held against future collections." },
  ],
  metadata: "Arweave, referenced by an on-chain pointer that resolves without our servers.",
};

export const FAQ: { q: string; a: string }[] = [
  {
    q: "How many trees does one mint fund?",
    a: "We do not state a number. The donations are anonymous, so One Tree Planted has no way to attribute planting back to us and we would only be repeating its published averages as though they were our own result. What is fixed and checkable is the mechanism: 60% of every mint leaves for its donation address inside the minting transaction, and the contract's totalDonated is the running total.",
  },
  {
    q: "Is a Tree token an investment?",
    a: "No. It is a collectible with a funding record attached. It pays no yield, carries no revenue share and confers no rights over the project. If you resell it, the price is set by the buyer and may be lower than the mint price.",
  },
  {
    q: "What causes a token to change stage?",
    a: "The amount the collection has donated, and nothing else. stage() on the contract compares cumulative donations against three thresholds fixed at deployment and returns a number from 1 to 4. There is no setter: no key, including ours, can advance a token, and no report from anyone is required. Every token shares the collection's stage, so the forest grows together rather than token by token.",
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
    a: "The stage segment of a token's URI follows stage(), so the artwork changes as the collection donates more. Species, rarity and traits are frozen at mint and enforced by the contract. The metadata pointer itself can be frozen permanently by calling freezeMetadata(), after which not even the owner can repoint it.",
  },
  {
    q: "Is One Tree Planted a partner in this project?",
    a: "No. One Tree Planted publishes a crypto donation address at onetreeplanted.org/pages/donate-crypto that anyone can send to, and that is what the contract does with the reforestation share. The organisation has not reviewed, approved or endorsed this project, and receives nothing from us beyond the donation itself. If that ever changes it will be stated here, dated.",
  },
  {
    q: "What is the Genesis Forest?",
    a: "The first collection: 10,000 numbered tokens, each carrying a Genesis marker. It funds the first planting seasons and establishes the standard later collections will follow. The marker records that a token came from the first collection and carries no entitlement.",
  },
  {
    q: "What is the current status of the project?",
    a: "The interface is complete and is what you are looking at. No contract is deployed, no mint is live and no donation has been made. Donations will go to One Tree Planted's public donation address; no agreement with the organisation exists, and none is needed to donate to it.",
  },
];

export const JOURNAL: { tag: string; date: string; title: string; read: string }[] = [
  { tag: "Method", date: "Aug 22, 2026", title: "How we assess a reforestation partner", read: "6 min" },
  { tag: "Field", date: "Jul 30, 2026", title: "What we require in a planting report", read: "9 min" },
  { tag: "Design", date: "Jun 11, 2026", title: "Building the trait system", read: "4 min" },
];

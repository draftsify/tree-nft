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

import treesData from "@/../data/trees.json";

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
    unlock: "0.036 ETH donated · about 100 mints",
  },
  {
    id: "young",
    label: "Young Tree",
    blurb: "Two fifths of the full donation is in. The canopy fills out for every holder at the same moment.",
    unlock: "0.144 ETH donated · about 400 mints",
  },
  {
    id: "mature",
    label: "Mature Tree",
    blurb: "Four fifths of the full donation is in. The final form, reached only if the collection nearly sells out.",
    unlock: "0.288 ETH donated · about 800 mints",
  },
];

export const RARITIES: {
  id: Rarity;
  /** Share of the 1,000-token Genesis supply. */
  share: number;
  supply: number;
  tint: string;
  text: string;
}[] = [
  { id: "Common", share: 0.6, supply: 600, tint: "#eceadf", text: "#4a4f46" },
  { id: "Uncommon", share: 0.25, supply: 250, tint: "#dfe6d9", text: "#3f5138" },
  { id: "Rare", share: 0.1, supply: 100, tint: "#cfdfe6", text: "#2f4c58" },
  { id: "Epic", share: 0.04, supply: 40, tint: "#e2d8ea", text: "#4c3a5c" },
  { id: "Legendary", share: 0.01, supply: 10, tint: "#efe0c8", text: "#6b4f1f" },
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
    supply: 320,
    region: "Temperate Europe",
    note: "The base form. A broad low crown on a short gnarled trunk, and the largest supply in the collection.",
  },
  {
    id: "pine",
    name: "Pine",
    latin: "Pinus sylvestris",
    supply: 240,
    region: "Boreal North",
    note: "A tall bare trunk with the crown held high. Drawn for the boreal sites.",
  },
  {
    id: "maple",
    name: "Maple",
    latin: "Acer saccharum",
    supply: 190,
    region: "North America",
    note: "Autumn colour. The only species whose canopy shifts with the Season trait.",
  },
  {
    id: "sakura",
    name: "Sakura",
    latin: "Prunus serrulata",
    supply: 140,
    region: "East Asia",
    note: "Blossom rather than leaf. Supply sits below Maple to reflect the short flowering window.",
  },
  {
    id: "redwood",
    name: "Redwood",
    latin: "Sequoia sempervirens",
    supply: 80,
    region: "Pacific Coast",
    note: "A monumental columnar trunk that fills the frame. Issued only at Rare and above.",
  },
  {
    id: "baobab",
    name: "Baobab",
    latin: "Adansonia digitata",
    supply: 30,
    region: "Sub-Saharan Africa",
    note: "A swollen barrel trunk and bare root-like branches. The smallest supply, Epic and Legendary only.",
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
const MINT_PRICE_ETH = 0.0006;

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

/**
 * The collection, read from `data/trees.json`.
 *
 * That file is the one place traits are decided. The artwork route composes
 * from it, the metadata route serves from it, and the interface reads from it
 * here, so a token cannot show one species in its attributes and another in
 * its picture.
 */
const source = treesData as {
  supply: number;
  trees: {
    number: number;
    species: string;
    rarity: string;
    region: string;
    forest: string;
    season: string;
    canopy: string;
    trunk: string;
    effect: string;
    genesis: boolean;
  }[];
};

function toTree(row: (typeof source.trees)[number]): Tree {
  return {
    id: row.number,
    tokenId: String(row.number).padStart(5, "0"),
    species: row.species as SpeciesId,
    rarity: row.rarity as Rarity,
    // Nothing has been funded, so nothing has advanced past the first stage.
    stage: "seed",
    forest: row.forest,
    region: row.region,
    season: row.season,
    canopy: row.canopy,
    trunk: row.trunk,
    effect: row.effect,
    genesis: row.genesis,
    treesFunded: null,
    owner: null,
    mintedAt: null,
    status: "pending",
    priceEth: MINT_PRICE_ETH,
  };
}

export const ALL_TREES: Tree[] = source.trees.map(toTree);

/**
 * What the collection page renders. The full thousand exist and are reachable
 * by id; the grid shows a slice so the page is not sixty megabytes of
 * on-demand renders.
 */
export const TREES: Tree[] = ALL_TREES.slice(0, 60);

/** Sample ids used to lay out the holder screen. Nobody holds anything yet. */
export const MY_TREE_IDS: number[] = [];

export function treeById(id: number): Tree | null {
  return ALL_TREES[id - 1] ?? null;
}

export function speciesImage(id: SpeciesId, size: "sm" | "lg" = "sm") {
  return `/species/${id}${size === "lg" ? "-lg" : ""}.webp`;
}

/**
 * The composed artwork for a token, at a stage. Same URL the metadata gives a
 * marketplace, so the site and OpenSea show the same picture.
 */
export function tokenImage(tokenNumber: number, stage = 1) {
  return `/api/nft/${tokenNumber - 1}/${stage}.png`;
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
  supply: 1000,
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
  priceEth: MINT_PRICE_ETH,
  priceUsdApprox: 2,
  supply: 1000,
  perWallet: 5,
  /** Revenue split. Draft figures — set on-chain before launch. */
  split: [
    { label: "Reforestation", pct: 60, note: "Leaves for One Tree Planted's donation address inside the minting transaction." },
    { label: "Artwork & metadata", pct: 18, note: "Artwork production, trait generation and permanent metadata storage." },
    { label: "Operations", pct: 14, note: "Contract audit, gas, hosting and the verification process." },
    { label: "Treasury", pct: 8, note: "Multisig reserve held against future collections." },
  ],
  metadata: "Served from this site and composed on request from eighteen photographed masters. Deterministic per token and stage, so an image is built once and cached.",
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
    a: "The first collection: 1,000 numbered tokens, each carrying a Genesis marker. It establishes the standard later collections will follow. The marker records that a token came from the first collection and carries no entitlement.",
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

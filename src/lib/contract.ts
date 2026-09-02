import { createPublicClient, http, type Address } from "viem";
import { robinhoodChain } from "./chain";

/**
 * The deployed collection.
 *
 * Absent NEXT_PUBLIC_CONTRACT_ADDRESS the app has no chain to read, and every
 * consumer falls back to its pre-launch state rather than inventing numbers.
 */
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "") as Address | "";

export const isDeployed = CONTRACT_ADDRESS !== "";

/**
 * The reforestation reserve, which is a contract rather than a wallet.
 *
 * Everything it does emits an event, so the route on the impact page is read
 * from the chain rather than typed in by us. Absent the address the page says
 * so instead of showing an empty ledger as if it meant nothing had happened.
 */
export const RESERVE_ADDRESS = (process.env.NEXT_PUBLIC_RESERVE_ADDRESS ??
  "") as Address | "";

export const hasReserve = RESERVE_ADDRESS !== "";

/** Only what the interface actually calls, so the bundle carries no more. */
export const TREE_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [{ name: "quantity", type: "uint256" }],
    outputs: [],
  },
  { type: "function", name: "mintPrice", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "paymentToken", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "mintOpen", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "remaining", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "MAX_SUPPLY", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "MAX_PER_WALLET", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "DONATION_BPS", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalDonated", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "stage", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "toNextStage", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "donationRecipient", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "event",
    name: "Minted",
    inputs: [
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "pricePaid", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Donated",
    inputs: [
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "cumulative", type: "uint256", indexed: false },
    ],
  },
] as const;

/** The reserve's surface: two running totals and the two events. */
export const RESERVE_ABI = [
  { type: "function", name: "totalSwapped", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalBridged", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "pendingTokens", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "pendingEth", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "charity", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  {
    type: "event",
    name: "Swapped",
    inputs: [
      { name: "caller", type: "address", indexed: true },
      { name: "tokensSold", type: "uint256", indexed: false },
      { name: "ethReceived", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Bridged",
    inputs: [
      { name: "caller", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "withdrawalId", type: "uint256", indexed: false },
      { name: "destination", type: "address", indexed: false },
    ],
  },
] as const;

/** Only the two ERC-20 calls the mint flow needs. */
export const ERC20_ABI = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const publicClient = createPublicClient({
  chain: robinhoodChain,
  transport: http(),
});

/** Collection state, read from the chain in one multicall. */
export type ChainState = {
  totalSupply: number;
  maxSupply: number;
  remaining: number;
  perWallet: number;
  mintOpen: boolean;
  /** In payment-token units. */
  mintPrice: bigint;
  paymentToken: Address;
  /** wei */
  totalDonated: bigint;
  /** wei still needed to reach the next stage, 0 at stage 4 */
  toNextStage: bigint;
  stage: number;
};

/** One step of the route, as the chain recorded it. */
export type RouteEvent = {
  kind: "swap" | "bridge";
  hash: string;
  block: bigint;
  /** Tokens sold for a swap, ETH sent for a bridge. */
  amountIn: bigint;
  /** ETH received for a swap, undefined for a bridge. */
  amountOut?: bigint;
  destination?: Address;
};

/**
 * The route, read from the reserve's logs.
 *
 * Nothing here is entered by hand. A swap or a bridge appears because it
 * happened, with the hash of the transaction that did it, and cannot appear
 * otherwise.
 */
export async function readRouteEvents(): Promise<RouteEvent[]> {
  if (!hasReserve) return [];

  const address = RESERVE_ADDRESS as Address;
  const [swaps, bridges] = await Promise.all([
    publicClient.getContractEvents({ address, abi: RESERVE_ABI, eventName: "Swapped", fromBlock: BigInt(0) }),
    publicClient.getContractEvents({ address, abi: RESERVE_ABI, eventName: "Bridged", fromBlock: BigInt(0) }),
  ]);

  const rows: RouteEvent[] = [
    ...swaps.map((l) => ({
      kind: "swap" as const,
      hash: l.transactionHash!,
      block: l.blockNumber!,
      amountIn: l.args.tokensSold!,
      amountOut: l.args.ethReceived!,
    })),
    ...bridges.map((l) => ({
      kind: "bridge" as const,
      hash: l.transactionHash!,
      block: l.blockNumber!,
      amountIn: l.args.amount!,
      destination: l.args.destination as Address,
    })),
  ];

  // Newest first, which is how a ledger is read.
  return rows.sort((a, b) => Number(b.block - a.block));
}

export type ReserveState = {
  totalSwapped: bigint;
  totalBridged: bigint;
  pendingTokens: bigint;
  pendingEth: bigint;
};

export async function readReserveState(): Promise<ReserveState | null> {
  if (!hasReserve) return null;

  const contract = { address: RESERVE_ADDRESS as Address, abi: RESERVE_ABI } as const;
  const [totalSwapped, totalBridged, pendingTokens, pendingEth] =
    await publicClient.multicall({
      allowFailure: false,
      contracts: [
        { ...contract, functionName: "totalSwapped" },
        { ...contract, functionName: "totalBridged" },
        { ...contract, functionName: "pendingTokens" },
        { ...contract, functionName: "pendingEth" },
      ],
    });

  return { totalSwapped, totalBridged, pendingTokens, pendingEth };
}

export async function readChainState(): Promise<ChainState | null> {
  if (!isDeployed) return null;

  const contract = { address: CONTRACT_ADDRESS as Address, abi: TREE_ABI } as const;

  const [
    totalSupply,
    maxSupply,
    remaining,
    perWallet,
    mintOpen,
    mintPrice,
    paymentToken,
    totalDonated,
    toNextStage,
    stage,
  ] = await publicClient.multicall({
    allowFailure: false,
    contracts: [
      { ...contract, functionName: "totalSupply" },
      { ...contract, functionName: "MAX_SUPPLY" },
      { ...contract, functionName: "remaining" },
      { ...contract, functionName: "MAX_PER_WALLET" },
      { ...contract, functionName: "mintOpen" },
      { ...contract, functionName: "mintPrice" },
      { ...contract, functionName: "paymentToken" },
      { ...contract, functionName: "totalDonated" },
      { ...contract, functionName: "toNextStage" },
      { ...contract, functionName: "stage" },
    ],
  });

  return {
    totalSupply: Number(totalSupply),
    maxSupply: Number(maxSupply),
    remaining: Number(remaining),
    perWallet: Number(perWallet),
    mintOpen,
    mintPrice,
    paymentToken: paymentToken as Address,
    totalDonated,
    toNextStage,
    stage: Number(stage),
  };
}

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

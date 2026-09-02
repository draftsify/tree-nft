import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  getContract,
  type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

/**
 * Local only. Opens the mint against the local node and walks one wallet
 * through the full approve -> mint path, which is the step that cannot be
 * exercised on a real network until $TREE exists.
 */
const RPC = process.env.RPC_URL ?? "http://127.0.0.1:8546";
const TREE = process.env.TREE_ADDRESS as `0x${string}`;
const TOKEN = process.env.PAYMENT_TOKEN as `0x${string}`;
const BASE_URI = process.env.BASE_URI ?? "http://localhost:3002/api/metadata/";

const OWNER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const BUYER_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

const local: Chain = {
  id: 4663,
  name: "Local Robinhood",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
};

const TREE_ABI = [
  { type: "function", name: "setBaseURI", stateMutability: "nonpayable", inputs: [{ type: "string" }], outputs: [] },
  { type: "function", name: "setMintOpen", stateMutability: "nonpayable", inputs: [{ type: "bool" }], outputs: [] },
  { type: "function", name: "mint", stateMutability: "nonpayable", inputs: [{ type: "uint256" }], outputs: [] },
  { type: "function", name: "mintOpen", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "mintPrice", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalDonated", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "stage", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "toNextStage", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "donationRecipient", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "treasury", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "tokenURI", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "string" }] },
] as const;

const ERC20_ABI = [
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ type: "address" }, { type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

async function main() {
  if (!TREE || !TOKEN) throw new Error("Set TREE_ADDRESS and PAYMENT_TOKEN");

  const pub = createPublicClient({ chain: local, transport: http(RPC) });
  if ((await pub.getChainId()) !== 4663 || !/127\.0\.0\.1|localhost/.test(RPC)) {
    throw new Error("Refusing to run outside a local node");
  }

  const owner = createWalletClient({ account: privateKeyToAccount(OWNER_KEY), chain: local, transport: http(RPC) });
  const buyer = createWalletClient({ account: privateKeyToAccount(BUYER_KEY), chain: local, transport: http(RPC) });

  const tree = getContract({ address: TREE, abi: TREE_ABI, client: { public: pub, wallet: owner } });
  const token = getContract({ address: TOKEN, abi: ERC20_ABI, client: { public: pub, wallet: buyer } });

  const wait = (hash: `0x${string}`) => pub.waitForTransactionReceipt({ hash });

  console.log("owner: setBaseURI + setMintOpen(true)");
  await wait(await tree.write.setBaseURI([BASE_URI]));
  await wait(await tree.write.setMintOpen([true]));
  console.log("  mintOpen =", await tree.read.mintOpen());

  const price = await tree.read.mintPrice();
  const qty = 2n;
  const due = price * qty;
  const recipient = await tree.read.donationRecipient();
  const treasury = await tree.read.treasury();

  console.log(`\nbuyer ${buyer.account.address}`);
  console.log("  approve", formatEther(due), "TREE");
  await wait(await token.write.approve([TREE, due]));
  console.log("  allowance =", formatEther(await token.read.allowance([buyer.account.address, TREE])));

  console.log("  mint", qty.toString());
  await wait(await tree.write.mint([qty], { account: buyer.account }));

  console.log("\nafter:");
  console.log("  totalSupply    ", (await tree.read.totalSupply()).toString());
  console.log("  buyer NFTs     ", (await tree.read.balanceOf([buyer.account.address])).toString());
  console.log("  buyer TREE     ", formatEther(await token.read.balanceOf([buyer.account.address])));
  console.log("  donated        ", formatEther(await tree.read.totalDonated()));
  console.log("  recipient TREE ", formatEther(await token.read.balanceOf([recipient])), `(${recipient})`);
  console.log("  treasury TREE  ", formatEther(await token.read.balanceOf([treasury])), `(${treasury})`);
  console.log("  stage          ", await tree.read.stage());
  console.log("  toNextStage    ", formatEther(await tree.read.toNextStage()));
  console.log("  tokenURI(1)    ", await tree.read.tokenURI([1n]));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

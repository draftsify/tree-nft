import { network } from "hardhat";
import { parseEther, formatEther, getAddress, isAddress } from "viem";

/**
 * Deployment is deliberately noisy about the values it is about to bake in,
 * because two of them can never be changed afterwards: the donation recipient
 * and the treasury. Run it once, read the summary, and only then confirm.
 *
 *   RPC_URL=... DEPLOYER_KEY=0x... \
 *   DONATION_RECIPIENT=0x... TREASURY=0x... \
 *   PROVENANCE_HASH=0x... npm run deploy
 */

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function address(name: string): `0x${string}` {
  const v = required(name);
  if (!isAddress(v)) throw new Error(`${name} is not an address: ${v}`);
  return getAddress(v);
}

async function main() {
  const donationRecipient = address("DONATION_RECIPIENT");
  // The mint is paid in an ERC-20, so the price is in whole tokens.
  const paymentToken = address("PAYMENT_TOKEN");
  const price = parseEther(process.env.MINT_PRICE ?? "7777");
  const provenanceHash = required("PROVENANCE_HASH") as `0x${string}`;
  const unrevealedURI =
    process.env.UNREVEALED_URI ??
    "https://tree-nft-beta.vercel.app/api/metadata/unrevealed.json";
  const contractURI =
    process.env.CONTRACT_URI ?? "https://tree-nft-beta.vercel.app/api/collection";

  const royaltyBps = BigInt(process.env.ROYALTY_BPS ?? "670");

  // Stages unlock at 10%, 40% and 80% of the donation a full sell-out produces.
  const MAX_SUPPLY = 1_000n;
  const fullDonation = (price * MAX_SUPPLY * 6_000n) / 10_000n;
  const thresholds: [bigint, bigint, bigint] = [
    (fullDonation * 10n) / 100n,
    (fullDonation * 40n) / 100n,
    (fullDonation * 80n) / 100n,
  ];

  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();

  // No separate treasury: the remainder returns to the deploying wallet unless
  // TREASURY names another. Still immutable once written.
  const treasury = process.env.TREASURY
    ? address("TREASURY")
    : getAddress(deployer.account.address);
  const royaltyReceiver = process.env.ROYALTY_RECEIVER
    ? address("ROYALTY_RECEIVER")
    : treasury;
  const publicClient = await viem.getPublicClient();

  console.log("\nDeploying Tree");
  console.log("  chain id          ", await publicClient.getChainId());
  console.log("  deployer          ", deployer.account.address);
  console.log("  balance           ", formatEther(await publicClient.getBalance({ address: deployer.account.address })), "ETH");
  console.log("\n  IMMUTABLE — check these twice, they can never be changed:");
  console.log("  payment token     ", paymentToken);
  console.log("  donation recipient", donationRecipient);
  console.log("  treasury          ", treasury);
  console.log("  provenance hash   ", provenanceHash);
  console.log("\n  mint price        ", formatEther(price), "tokens");
  console.log("  stage 2 at        ", formatEther(thresholds[0]), "tokens donated");
  console.log("  stage 3 at        ", formatEther(thresholds[1]), "tokens donated");
  console.log("  stage 4 at        ", formatEther(thresholds[2]), "tokens donated");
  console.log("  royalty           ", `${Number(royaltyBps) / 100}% to ${royaltyReceiver}`);
  console.log("  collection        ", contractURI);
  console.log("");

  const tree = await viem.deployContract("Tree", [
    paymentToken,
    donationRecipient,
    treasury,
    price,
    provenanceHash,
    thresholds,
    unrevealedURI,
    contractURI,
    royaltyReceiver,
    royaltyBps,
  ]);

  console.log("Deployed to", tree.address);
  console.log("\nNext:");
  console.log("  1. Verify the source on https://robinhoodchain.blockscout.com");
  console.log(`  2. Set NEXT_PUBLIC_CONTRACT_ADDRESS=${tree.address} in the web app`);
  console.log("  3. Upload the artwork, then setBaseURI, then freezeMetadata");
  console.log("  4. setMintOpen(true) only once the above is done\n");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

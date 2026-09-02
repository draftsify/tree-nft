import { network } from "hardhat";
import { parseEther, formatEther, getAddress, isAddress } from "viem";

/**
 * Deployment is deliberately noisy about the values it is about to bake in,
 * because two of them can never be changed afterwards: the donation recipient
 * and the treasury. Run it once, read the summary, and only then confirm.
 *
 * Running it prints the summary and stops. Nothing is deployed until the same
 * command is run again with CONFIRM_DEPLOY=yes, so the summary is always read
 * before it is acted on rather than scrolling past a transaction already sent.
 *
 *   RPC_URL=... DEPLOYER_KEY=0x... \
 *   DONATION_RECIPIENT=0x... TREASURY=0x... \
 *   PROVENANCE_HASH=0x... npm run deploy
 */

/** One Tree Planted's public donation address. */
const CHARITY = "0x62233D5483515A79ac06CEcEbac7D399fDF8a99b";

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
  const from = getAddress(deployer.account.address);
  const balance = await publicClient.getBalance({ address: from });

  // The deployer becomes the owner, so the wrong key here is not a small
  // mistake: it decides who can open the mint and repoint the metadata.
  if (process.env.EXPECTED_DEPLOYER) {
    const expected = address("EXPECTED_DEPLOYER");
    if (from !== expected) {
      throw new Error(
        `DEPLOYER_KEY belongs to ${from}, but EXPECTED_DEPLOYER is ${expected}. ` +
          "Wrong key, or wrong expectation. Resolve it before deploying.",
      );
    }
  }

  // The recipient is immutable and the mint pays in an ERC-20 the charity
  // cannot use. Sending there would repeat, irreversibly, on every mint.
  if (donationRecipient === getAddress(CHARITY)) {
    throw new Error(
      "DONATION_RECIPIENT is the charity's donation address. It must be the " +
        "project's own reforestation reserve; the charity is the end of the " +
        "published route, not the contract's recipient. See DEPLOY.md.",
    );
  }

  if (balance === 0n) {
    throw new Error(`${from} holds no ETH on this chain. Fund it for gas first.`);
  }

  console.log("\nDeploying Tree");
  console.log("  chain id          ", await publicClient.getChainId());
  console.log("  deployer / owner  ", from);
  console.log("  balance           ", formatEther(balance), "ETH");
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

  if (process.env.CONFIRM_DEPLOY !== "yes") {
    console.log("  Nothing has been deployed.");
    console.log("  Read the values above. Every line under IMMUTABLE is permanent.");
    console.log("  To go ahead, run the same command again with CONFIRM_DEPLOY=yes\n");
    return;
  }

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
  console.log("  3. setBaseURI to the metadata route, then check one token URI");
  console.log("  4. setMintOpen(true) only once the above is done");
  console.log("  Do NOT call freezeMetadata while metadata is served over HTTP:");
  console.log("  it would promise an immutability the files do not have.\n");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

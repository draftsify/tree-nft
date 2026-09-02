import { network } from "hardhat";
import { parseEther, formatEther } from "viem";

/**
 * Local only. Stands a MockTree up in place of $TREE so the approve step on
 * the mint screen has something to approve, and funds the first four hardhat
 * accounts with it. Never run this against a real network.
 */
const FUNDED = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
] as const;

async function main() {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  const chainId = await publicClient.getChainId();
  if (chainId !== 4663 || !/127\.0\.0\.1|localhost/.test(process.env.RPC_URL ?? "")) {
    throw new Error(`Refusing to run outside a local node (chain ${chainId}, RPC ${process.env.RPC_URL})`);
  }

  const token = await viem.deployContract("MockTree", []);
  console.log("MockTree deployed to", token.address);

  for (const to of FUNDED) {
    const hash = await token.write.mint([to, parseEther("100000")]);
    await publicClient.waitForTransactionReceipt({ hash });
    const bal = await token.read.balanceOf([to]);
    console.log(`  funded ${to}  ${formatEther(bal)} TREE`);
  }

  console.log("\nPAYMENT_TOKEN=" + token.address);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

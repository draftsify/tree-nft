/**
 * Local only. Puts the canonical Multicall3 on the local node at the address
 * the real chain uses, by copying the live runtime bytecode.
 *
 * `readChainState` reads everything through one multicall, so without this the
 * local app fails exactly the way production did before `chain.ts` named the
 * contract — and it fails silently, falling back to pre-launch figures. The
 * node holds this in memory, so re-run it after every node restart.
 */
import { readFile, writeFile } from "node:fs/promises";

const LOCAL = process.env.RPC_URL ?? "http://127.0.0.1:8546";
const MAINNET = process.env.MAINNET_RPC ?? "https://rpc.mainnet.chain.robinhood.com";
const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11";
const CACHE = new URL("./local-multicall.bytecode", import.meta.url);

const rpc = async (url, method, params) => {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`${method}: ${j.error.message}`);
  return j.result;
};

if (!/127\.0\.0\.1|localhost/.test(LOCAL)) throw new Error(`Refusing to touch a non-local node: ${LOCAL}`);
const chainId = await rpc(LOCAL, "eth_chainId");
if (parseInt(chainId, 16) !== 4663) throw new Error(`Expected chain 4663, got ${parseInt(chainId, 16)}`);

let bytecode;
try {
  bytecode = (await readFile(CACHE, "utf8")).trim();
  console.log("bytecode from cache");
} catch {
  bytecode = await rpc(MAINNET, "eth_getCode", [MULTICALL3, "latest"]);
  if (!bytecode || bytecode === "0x") throw new Error("Multicall3 has no code on mainnet");
  await writeFile(CACHE, bytecode);
  console.log("bytecode fetched from mainnet and cached");
}

await rpc(LOCAL, "hardhat_setCode", [MULTICALL3, bytecode]);
const on = await rpc(LOCAL, "eth_getCode", [MULTICALL3, "latest"]);
if (on !== bytecode) throw new Error("setCode did not stick");
console.log(`Multicall3 live at ${MULTICALL3} on ${LOCAL}`);

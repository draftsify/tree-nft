import type { Chain } from "viem";

/**
 * Robinhood Chain, mainnet.
 *
 * An Arbitrum-stack Ethereum L2 that settles in ETH, so mint prices stay
 * denominated in ETH rather than in a chain-specific token. OpenSea indexes it
 * as a first-class chain, which is why the collection needs no marketplace of
 * its own.
 *
 * The public RPC is unauthenticated and rate-limited with no SLA. Set
 * NEXT_PUBLIC_RPC_URL to a dedicated endpoint before launch.
 */
export const robinhoodChain: Chain = {
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL ??
          "https://rpc.mainnet.chain.robinhood.com",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://robinhoodchain.blockscout.com",
    },
  },
};

export function explorerTx(hash: string) {
  return `${robinhoodChain.blockExplorers!.default.url}/tx/${hash}`;
}

export function explorerToken(contract: string, tokenId: string | number) {
  return `${robinhoodChain.blockExplorers!.default.url}/token/${contract}/instance/${tokenId}`;
}

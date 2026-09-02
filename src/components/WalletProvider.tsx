"use client";

import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createWalletClient, custom, type WalletClient } from "viem";
import { robinhoodChain } from "@/lib/chain";

/**
 * The wallet layer, backed by Privy.
 *
 * Privy is used rather than a raw connector list because a $5 mint is aimed at
 * people who do not already hold a wallet: email and social logins get an
 * embedded wallet created for them, while anyone who does hold one connects it
 * as usual. Consumers see the same small surface either way.
 *
 * Without NEXT_PUBLIC_PRIVY_APP_ID the provider falls back to a local
 * simulation, so the interface still runs in a preview deploy that has no
 * credentials.
 */

const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

/**
 * Local testing only. Set NEXT_PUBLIC_LOCAL_WALLET=1 to talk to an injected
 * wallet (MetaMask) against a local node, which is the only way to walk the
 * real approve -> mint path without Privy credentials: the simulation below
 * hands back no wallet client, so no transaction can ever leave it.
 */
const LOCAL_WALLET = process.env.NEXT_PUBLIC_LOCAL_WALLET === "1";

type WalletState = {
  /** Shortened for display; null when disconnected. */
  address: string | null;
  /** Full checksum address, for contract calls. */
  fullAddress: string | null;
  connected: boolean;
  /** False until Privy has restored any existing session. */
  ready: boolean;
  connecting: boolean;
  /** True when running the local simulation instead of Privy. */
  simulated: boolean;
  /** Demo modal state. Unused when Privy is configured. */
  open: boolean;
  setOpen: (v: boolean) => void;
  connect: () => void;
  disconnect: () => void;
  /**
   * A viem client bound to the connected wallet, already switched to Robinhood
   * Chain. Null when disconnected, or when running the simulation.
   */
  getWalletClient: () => Promise<WalletClient | null>;
};

const Ctx = createContext<WalletState | null>(null);

function shorten(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/* ── Privy-backed ─────────────────────────────────────── */

function PrivyBridge({ children }: { children: ReactNode }) {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [connecting, setConnecting] = useState(false);

  const wallet = wallets[0];
  const fullAddress = authenticated && wallet ? wallet.address : null;

  const getWalletClient = useCallback(async () => {
    if (!wallet) return null;
    // Privy will not switch silently: an external wallet prompts the user, and
    // an embedded one moves without asking.
    await wallet.switchChain(robinhoodChain.id);
    const provider = await wallet.getEthereumProvider();
    return createWalletClient({
      account: wallet.address as `0x${string}`,
      chain: robinhoodChain,
      transport: custom(provider),
    });
  }, [wallet]);

  const connect = useCallback(() => {
    setConnecting(true);
    login();
    // Privy owns the modal, so there is no completion callback to await here;
    // `authenticated` flipping is what actually ends the pending state.
    window.setTimeout(() => setConnecting(false), 1200);
  }, [login]);

  const value = useMemo<WalletState>(
    () => ({
      address: fullAddress ? shorten(fullAddress) : null,
      fullAddress,
      connected: fullAddress !== null,
      ready,
      connecting,
      simulated: false,
      open: false,
      setOpen: (v) => {
        if (v) connect();
      },
      connect,
      disconnect: () => void logout(),
      getWalletClient,
    }),
    [fullAddress, ready, connecting, connect, logout, getWalletClient],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ── injected wallet, local testing only ──────────────── */

type Injected = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function injected(): Injected | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { ethereum?: Injected }).ethereum ?? null;
}

const CHAIN_HEX = `0x${robinhoodChain.id.toString(16)}`;

/** Move the wallet onto the chain, adding it first if it has never seen it. */
async function ensureChain(provider: Injected) {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_HEX }],
    });
  } catch (e) {
    if ((e as { code?: number }).code !== 4902) throw e;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: CHAIN_HEX,
          chainName: robinhoodChain.name,
          nativeCurrency: robinhoodChain.nativeCurrency,
          rpcUrls: [robinhoodChain.rpcUrls.default.http[0]],
        },
      ],
    });
  }
}

function InjectedBridge({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(() => {
    const provider = injected();
    if (!provider) return;
    setConnecting(true);
    void (async () => {
      try {
        const accounts = (await provider.request({
          method: "eth_requestAccounts",
        })) as string[];
        await ensureChain(provider);
        setAddress(accounts[0] ?? null);
      } finally {
        setConnecting(false);
      }
    })();
  }, []);

  const getWalletClient = useCallback(async () => {
    const provider = injected();
    if (!provider || !address) return null;
    await ensureChain(provider);
    return createWalletClient({
      account: address as `0x${string}`,
      chain: robinhoodChain,
      transport: custom(provider as Parameters<typeof custom>[0]),
    });
  }, [address]);

  const value = useMemo<WalletState>(
    () => ({
      address: address ? shorten(address) : null,
      fullAddress: address,
      connected: address !== null,
      ready: true,
      connecting,
      simulated: false,
      open: false,
      setOpen: (v) => {
        if (v) connect();
      },
      connect,
      disconnect: () => setAddress(null),
      getWalletClient,
    }),
    [address, connecting, connect, getWalletClient],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ── local simulation, used when no app id is set ─────── */

const DEMO_ADDRESS = "0x8Ae4C1f0B7D3a25e91Cb4f0aE7d2c5B18e6031f7";

function SimulatedBridge({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [open, setOpen] = useState(false);

  const connect = useCallback(() => {
    setConnecting(true);
    window.setTimeout(() => {
      setAddress(DEMO_ADDRESS);
      setConnecting(false);
      setOpen(false);
    }, 700);
  }, []);

  const value = useMemo<WalletState>(
    () => ({
      address: address ? shorten(address) : null,
      fullAddress: address,
      connected: address !== null,
      ready: true,
      connecting,
      simulated: true,
      open,
      setOpen,
      connect,
      disconnect: () => setAddress(null),
      getWalletClient: async () => null,
    }),
    [address, connecting, open, connect],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  if (LOCAL_WALLET) return <InjectedBridge>{children}</InjectedBridge>;
  if (!APP_ID) return <SimulatedBridge>{children}</SimulatedBridge>;

  return (
    <PrivyProvider
      appId={APP_ID}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#5b7150",
          walletChainType: "ethereum-only",
        },
        loginMethods: ["email", "wallet", "google", "apple"],
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        defaultChain: robinhoodChain,
        supportedChains: [robinhoodChain],
      }}
    >
      <PrivyBridge>{children}</PrivyBridge>
    </PrivyProvider>
  );
}

export function useWallet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

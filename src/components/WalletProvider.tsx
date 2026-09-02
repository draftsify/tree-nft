"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * A stand-in for the wallet layer.
 *
 * There is no provider detection, no signing and no RPC here — connecting sets
 * a demo address in React state so the holder-only screens can be reviewed.
 * Swapping this file for wagmi/RainbowKit later shouldn't touch any consumer,
 * which is the point of keeping the surface this small.
 */

export type WalletId = "metamask" | "walletconnect" | "phantom" | "coinbase";

export const WALLETS: { id: WalletId; name: string; hint: string; glyph: string }[] = [
  { id: "metamask", name: "MetaMask", hint: "Browser extension", glyph: "\u{1F98A}" },
  { id: "walletconnect", name: "WalletConnect", hint: "Scan with any mobile wallet", glyph: "\u{1F517}" },
  { id: "coinbase", name: "Coinbase Wallet", hint: "Extension or mobile", glyph: "\u{1F535}" },
  { id: "phantom", name: "Phantom", hint: "For a future Solana collection", glyph: "\u{1F47B}" },
];

type WalletState = {
  address: string | null;
  wallet: WalletId | null;
  connected: boolean;
  connecting: WalletId | null;
  open: boolean;
  setOpen: (v: boolean) => void;
  connect: (id: WalletId) => void;
  disconnect: () => void;
};

const Ctx = createContext<WalletState | null>(null);

const DEMO_ADDRESS = "0x8Ae4…31f7";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletId | null>(null);
  const [connecting, setConnecting] = useState<WalletId | null>(null);
  const [open, setOpen] = useState(false);

  const connect = useCallback((id: WalletId) => {
    setConnecting(id);
    // Fake the handshake latency so the pending state is visible in review.
    window.setTimeout(() => {
      setWallet(id);
      setAddress(DEMO_ADDRESS);
      setConnecting(null);
      setOpen(false);
    }, 700);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setWallet(null);
  }, []);

  const value = useMemo(
    () => ({
      address,
      wallet,
      connected: address !== null,
      connecting,
      open,
      setOpen,
      connect,
      disconnect,
    }),
    [address, wallet, connecting, open, connect, disconnect],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWallet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useWallet, WALLETS } from "./WalletProvider";

export default function WalletModal() {
  const { open, setOpen, connect, connecting } = useWallet();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-3 md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0 bg-ink/25 backdrop-blur-[3px]"
            onClick={() => setOpen(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Connect a wallet"
            className="relative w-full max-w-[420px] rounded-[24px] border border-line bg-paper p-2"
            initial={{ y: 24, scale: 0.985 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 16, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between px-3 pb-1 pt-3">
              <h2 className="display text-[20px]">Connect a wallet</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-8 place-items-center rounded-full text-ink-3 transition-colors hover:bg-paper-3 hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="mt-2 flex flex-col gap-1.5">
              {WALLETS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => connect(w.id)}
                  disabled={connecting !== null}
                  className="group flex items-center gap-3 rounded-[16px] border border-line bg-white px-3.5 py-3 text-left transition-colors hover:border-line-2 disabled:opacity-50"
                >
                  <span
                    className="grid size-9 place-items-center rounded-full bg-paper-2 text-[13px] font-medium text-ink-2"
                    aria-hidden
                  >
                    {w.name[0]}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[14px] font-medium text-ink">{w.name}</span>
                    <span className="block text-[12px] text-ink-3">{w.hint}</span>
                  </span>
                  <span className="text-[12px] text-ink-3">
                    {connecting === w.id ? "Connecting…" : "→"}
                  </span>
                </button>
              ))}
            </div>

            <p className="px-3.5 py-3.5 text-[11.5px] leading-relaxed text-ink-3">
              Demonstration only. No wallet is contacted, no signature is
              requested and no transaction is sent. Selecting a provider loads
              the holder screens with sample data.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useWallet } from "./WalletProvider";

/**
 * Only rendered when the app is running without Privy credentials. With them,
 * Privy owns the connect modal and this component never opens.
 */
export default function WalletModal() {
  const { open, setOpen, connect, connecting, simulated } = useWallet();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  if (!simulated) return null;

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
            className="relative w-full max-w-[400px] rounded-[24px] bg-paper p-6"
            initial={{ y: 24, scale: 0.985 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 16, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="display text-[20px]">Connect a wallet</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-[13px] text-ink-3 transition-colors hover:text-ink"
              >
                Close
              </button>
            </div>

            <p className="mt-3 max-w-[40ch] text-[13px] leading-relaxed text-ink-2">
              This deployment has no wallet credentials configured, so no wallet
              is contacted and no signature is requested. Continuing loads the
              holder screens with sample data.
            </p>

            <button
              onClick={connect}
              disabled={connecting}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-ink px-5 text-[13px] font-medium text-paper transition-colors hover:bg-moss disabled:opacity-50"
            >
              {connecting ? "Connecting…" : "Continue"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

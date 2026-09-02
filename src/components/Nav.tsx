"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "./WalletProvider";
import WalletModal from "./WalletModal";

const LINKS = [
  { href: "/collection", label: "Collection" },
  { href: "/impact", label: "Impact" },
  { href: "/forest", label: "My Forest" },
  { href: "/mint", label: "Mint" },
];

export default function Nav() {
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { connected, address, setOpen, disconnect } = useWallet();

  // Close the mobile sheet on navigation without reaching for an effect.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (menu) setMenu(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
        <nav
          className={`mx-auto flex h-14 w-full max-w-[1240px] items-center gap-2 rounded-full border px-2 pl-4 transition-all duration-500 md:h-15 ${
            scrolled
              ? "border-line bg-paper/85 backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
        >
          <Link href="/" className="flex items-center gap-2 pr-2" aria-label="Tree — home">
            <LeafMark />
            <span className="display text-[19px] tracking-[-0.04em]">Tree</span>
          </Link>

          <div className="mx-auto hidden items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-3.5 py-2 text-[13px] transition-colors ${
                    active ? "bg-paper-3 text-ink" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-1.5 md:ml-0">
            {connected ? (
              <button
                onClick={disconnect}
                title="Disconnect"
                className="group inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-[12.5px] text-ink transition-colors hover:border-line-2"
              >
                <span className="size-1.5 rounded-full bg-moss" />
                <span className="num">{address}</span>
              </button>
            ) : (
              <button
                onClick={() => setOpen(true)}
                className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-[13px] font-medium text-paper transition-colors hover:bg-moss"
              >
                Connect wallet
              </button>
            )}
            <button
              onClick={() => setMenu((v) => !v)}
              aria-label="Menu"
              aria-expanded={menu}
              className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-white md:hidden"
            >
              <span className="relative block h-[9px] w-[15px]">
                <span
                  className={`absolute inset-x-0 top-0 h-px bg-ink transition-transform duration-300 ${menu ? "translate-y-[4px] rotate-45" : ""}`}
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-px bg-ink transition-transform duration-300 ${menu ? "-translate-y-[4px] -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </nav>

        {/* mobile sheet */}
        <div
          className={`mx-auto mt-2 max-w-[1240px] overflow-hidden rounded-3xl border border-line bg-paper/95 backdrop-blur-xl transition-all duration-400 md:hidden ${
            menu ? "max-h-80 opacity-100" : "pointer-events-none max-h-0 border-transparent opacity-0"
          }`}
        >
          <div className="flex flex-col p-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-2xl px-4 py-3 text-[15px] text-ink hover:bg-paper-3"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <WalletModal />
    </>
  );
}

export function LeafMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-[18px] ${className}`}
      fill="none"
      aria-hidden
    >
      <path
        d="M12 22V13.2M12 13.2C12 13.2 5 12.6 5 7.2C5 3.8 8 2 12 2C16 2 19 3.8 19 7.2C19 12.6 12 13.2 12 13.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 13.2V7.6M12 10.4L9.4 8M12 9.6L14.4 7.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

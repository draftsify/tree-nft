"use client";

import Link from "next/link";
import { useState } from "react";
import Mark from "./Mark";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Collection",
    links: [
      { label: "Genesis Forest", href: "/collection" },
      { label: "Mint", href: "/mint" },
      { label: "My Forest", href: "/forest" },
    ],
  },
  {
    title: "Transparency",
    links: [
      { label: "Impact ledger", href: "/impact" },
      { label: "Verification log", href: "/admin" },
      { label: "How evolution works", href: "/#evolution" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "What this is", href: "/#thesis" },
      { label: "Questions", href: "/#faq" },
      { label: "Journal", href: "/#journal" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer className="relative mt-24 overflow-hidden bg-deep px-5 pt-16 text-paper md:px-8">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="grid gap-12 pb-16 md:grid-cols-[1.3fr_2fr]">
          <div>
            <div className="flex items-center gap-2">
              <Mark className="size-[26px] text-sage" />
              <span className="display text-[22px] tracking-[-0.04em]">Tree</span>
            </div>
            <p className="mt-5 max-w-[36ch] text-[14px] leading-relaxed text-paper/55">
              A digital tree you own, and a funding record you can check. No
              yield, no promises about price — just the collectible and the
              receipt.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="mt-8 max-w-[380px]"
            >
              <label htmlFor="footer-email" className="eyebrow text-paper/40">
                Planting updates
              </label>
              <div className="mt-2 flex h-12 items-center rounded-full border border-paper/15 bg-paper/[0.04] pl-4 pr-1 transition-colors focus-within:border-paper/35">
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-full flex-1 bg-transparent text-[14px] text-paper outline-none placeholder:text-paper/30"
                />
                <button
                  type="submit"
                  className="h-10 shrink-0 rounded-full bg-paper px-4 text-[13px] font-medium text-ink transition-colors hover:bg-sage"
                >
                  {sent ? "Noted" : "Subscribe"}
                </button>
              </div>
              <p className="mt-2.5 text-[11.5px] text-paper/35">
                {sent
                  ? "Nothing was actually stored — this form has no backend yet."
                  : "One message per verified planting report. Nothing else."}
              </p>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-paper/40">{col.title}</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-[14px] text-paper/70 transition-colors hover:text-paper"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-paper/10 py-6">
          <p className="max-w-[92ch] text-[12px] leading-relaxed text-paper/40">
            <span className="text-paper/70">Read this part.</span> Tree is an
            interface prototype. No smart contract is deployed, no mint is live,
            no donation has been made and no reforestation partnership is
            signed. Every figure shown — trees funded, dollars donated,
            transaction hashes, holder counts — is placeholder data. A Tree NFT
            is a collectible, not a security, a share or an investment: it pays
            nothing, entitles you to nothing, and its resale value is whatever a
            buyer decides it is, including nothing.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-paper/10 py-6 text-[12px] text-paper/40">
          <span>© 2026 Tree. Interface prototype.</span>
          <div className="flex items-center gap-5">
            <span className="cursor-not-allowed">X</span>
            <span className="cursor-not-allowed">Discord</span>
            <span className="cursor-not-allowed">Mirror</span>
          </div>
        </div>
      </div>

      {/* the mark, set large and cropped by the viewport edge */}
      <div
        aria-hidden
        className="display pointer-events-none select-none pb-0 pt-6 text-center text-[clamp(5rem,21vw,17rem)] leading-[0.8] text-paper/[0.045]"
      >
        Tree
      </div>
    </footer>
  );
}

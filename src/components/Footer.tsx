"use client";

import Link from "next/link";
import { useState } from "react";
import Mark from "./Mark";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Collection",
    links: [
      { label: "The Forest", href: "/collection" },
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
      { label: "Terms", href: "/terms" },
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
              Collectible digital trees whose mint revenue funds reforestation,
              with each donation published on-chain.
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
                  ? "Nothing was stored. This form is not connected to a backend."
                  : "One message per verified planting report."}
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

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-paper/10 py-6 text-[12px] text-paper/40">
          <span>© 2026 Tree.</span>
          <a
            href="https://x.com/treedotfamily"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-paper/70"
          >
            @treedotfamily
          </a>
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

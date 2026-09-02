import Image from "next/image";
import Link from "next/link";
import Accordion from "@/components/Accordion";
import Marquee from "@/components/Marquee";
import { DrawLine, Reveal, ScrollWords } from "@/components/Reveal";
import { GrowthTree, HeroTree } from "@/components/ScrollTree";
import TreeCard from "@/components/TreeCard";
import {
  ButtonLink,
  Eyebrow,
  Provisional,
  Section,
} from "@/components/ui";
import {
  DONATIONS,
  FAQ,
  IMPACT,
  JOURNAL,
  MINT,
  RARITIES,
  SPECIES,
  STAGES,
  TREES,
  speciesImage,
} from "@/lib/data";

const PRINCIPLES = [
  {
    n: "01",
    title: "One tree, drawn six thousand ways.",
    body: "Every token is the same photographed oak, recomposed: species, canopy, trunk, season, light. The art is a system, not a folder of six thousand exports — which is why the traits can be verified against the contract rather than taken on faith.",
  },
  {
    n: "02",
    title: "The receipt is the product.",
    body: "A share of every mint leaves the treasury as one on-chain donation, and the hash goes on the impact page the same day. You are not asked to believe the money moved. You are shown where it went.",
  },
  {
    n: "03",
    title: "It grows when something real happens.",
    body: "Your tree advances a stage when a donation settles, when a partner allocates it to a site, when a planting report is filed. Never on a schedule, never because a launch calendar needed a moment.",
  },
  {
    n: "04",
    title: "No claim we can't evidence.",
    body: "You will not find a trees-per-mint figure on this site, because no partner has signed one yet. When that number exists it goes in the metadata, dated and sourced, and this sentence gets deleted.",
  },
];

const STEPS = [
  {
    n: "Step 01",
    title: "Connect",
    body: "Any EVM wallet on Base. Read-only until you approve a transaction — connecting shows you the collection, nothing more.",
  },
  {
    n: "Step 02",
    title: "Mint",
    body: "Traits are assigned at mint from the contract's own randomness and frozen immediately. Species, rarity and traits can never be rewritten afterwards.",
  },
  {
    n: "Step 03",
    title: "Watch it change",
    body: "Your token arrives as a Seed. It advances only when the funding milestone behind that stage is verified and filed against your token id.",
  },
];

export default function Home() {
  const featured = TREES.slice(0, 8);

  return (
    <>
      {/* ── hero ────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <HeroTree />

        {/* keeps the copy legible where the canopy reaches into the column:
            a top-down scrim while the tree sits under the text on small
            screens, a left-to-right one once they sit side by side */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-paper via-paper/90 to-transparent lg:hidden" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[58%] bg-gradient-to-r from-paper via-paper/90 to-transparent lg:block" />

        <div className="relative z-[2] flex min-h-[100svh] flex-col px-5 pb-10 pt-32 md:px-8 md:pt-36">
          <div className="mx-auto w-full max-w-[1240px]">
            <Reveal>
              <Eyebrow>Genesis Forest · 10,000 trees</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="display mt-6 max-w-[11ch] text-[clamp(2.7rem,6.6vw,5.4rem)] lg:max-w-[9ch]">
                Own a tree. Fund a forest.
              </h1>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed text-ink-2 md:text-[16px]">
                A collectible digital tree, and a public record of the
                reforestation your mint paid for. The artwork is yours. The
                receipt is everyone&rsquo;s.
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <div className="mt-8 flex flex-wrap items-center gap-2.5">
                <ButtonLink href="/mint" size="lg">
                  Mint a tree
                </ButtonLink>
                <ButtonLink href="/impact" variant="outline" size="lg">
                  See where the money went
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <div className="mx-auto mt-auto flex w-full max-w-[1240px] flex-wrap items-end justify-between gap-6 pt-16">
            <Reveal delay={0.3}>
              <div className="rounded-[18px] border border-line bg-paper/70 p-4 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Eyebrow>Minted so far</Eyebrow>
                  <Provisional />
                </div>
                <p className="num mt-2 text-[26px] leading-none text-ink">
                  {IMPACT.minted.toLocaleString("en-US")}
                  <span className="text-ink-3"> / {IMPACT.supply.toLocaleString("en-US")}</span>
                </p>
                <p className="mt-1.5 text-[12.5px] text-ink-3">
                  {MINT.priceEth} ETH · {MINT.chain} · {MINT.standard}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.36} className="hidden md:block">
              <p className="max-w-[24ch] text-right text-[12.5px] leading-relaxed text-ink-3">
                Scroll. The tree grows the way the token does — one verified
                milestone at a time.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── ticker ──────────────────────────────────────── */}
      <div className="border-y border-line bg-paper py-4">
        <Marquee
          duration={54}
          items={[
            "ERC-721 on Base",
            "60% of every mint routed to reforestation",
            "Donation hashes published",
            "Metadata versioned, never overwritten",
            "Traits frozen at mint",
            "Impact history travels with the token",
            "No yield. No revenue share. No promises.",
          ].map((t) => (
            <span key={t} className="text-[13px] text-ink-2">
              {t}
            </span>
          ))}
        />
      </div>

      {/* ── thesis ──────────────────────────────────────── */}
      <Section id="thesis" className="py-28 md:py-40">
        <Eyebrow>What this is</Eyebrow>
        <ScrollWords
          className="display mt-8 max-w-[19ch] text-[clamp(2rem,6.2vw,5.2rem)]"
          text="Most impact NFTs sell you a feeling. This one hands you the transaction."
        />
        <div className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-3">
          {[
            {
              h: "A collectible first",
              p: "If the environmental story vanished tomorrow, you'd still want to look at it. That's the bar. A beautiful object that happens to be honest, not a donation button wearing an image.",
            },
            {
              h: "A funding record second",
              p: "Each token carries an append-only log: the mint, the donation hash, the project it was allocated to, the date a planting report was filed. It's a ledger, and it reads like one.",
            },
            {
              h: "Never a return",
              p: "There is no staking, no airdrop schedule, no floor-price mechanic and no buyback. What happens to the resale price is entirely between future buyers and sellers.",
            },
          ].map((c, i) => (
            <Reveal key={c.h} delay={i * 0.08}>
              <h3 className="display text-[20px]">{c.h}</h3>
              <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-ink-2">
                {c.p}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── principles ──────────────────────────────────── */}
      <Section className="pb-28 md:pb-40">
        <div className="grid gap-px overflow-hidden rounded-[24px] border border-line bg-line md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.n} delay={(i % 2) * 0.08}>
              <div className="flex h-full flex-col bg-paper p-7 md:p-10">
                <span className="num text-[12px] text-ink-3">{p.n}</span>
                <h3 className="display mt-6 max-w-[16ch] text-[clamp(1.4rem,2.6vw,2.1rem)]">
                  {p.title}
                </h3>
                <p className="mt-4 max-w-[46ch] text-[14px] leading-relaxed text-ink-2">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── evolution (pinned scroll) ───────────────────── */}
      <section id="evolution" className="relative border-y border-line bg-paper-2">
        <div className="px-5 pt-24 md:px-8">
          <div className="mx-auto w-full max-w-[1240px]">
            <Eyebrow>Evolution</Eyebrow>
            <h2 className="display mt-6 max-w-[18ch] text-[clamp(2rem,5.4vw,4.2rem)]">
              It only grows when something is proven.
            </h2>
            <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">
              Four stages, four milestones. Each transition writes a new
              metadata version against your token id and leaves the previous one
              readable, so the history can be audited rather than trusted.
            </p>
          </div>
        </div>
        <GrowthTree stages={STAGES} />
      </section>

      {/* ── how it works ────────────────────────────────── */}
      <Section className="py-28 md:py-36">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Minting</Eyebrow>
            <h2 className="display mt-6 max-w-[16ch] text-[clamp(2rem,5vw,3.8rem)]">
              Three steps, then nothing to manage.
            </h2>
          </div>
          <ButtonLink href="/mint" variant="outline">
            Open the mint
          </ButtonLink>
        </div>

        <DrawLine className="mt-12" />

        <div className="grid gap-px bg-line md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="h-full bg-paper py-10 md:px-8 md:first:pl-0">
                <Eyebrow>{s.n}</Eyebrow>
                <h3 className="display mt-5 text-[24px]">{s.title}</h3>
                <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-ink-2">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <DrawLine />

        {/* revenue split */}
        <div className="mt-16 grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <Eyebrow>Where the mint goes</Eyebrow>
            <h3 className="display mt-5 max-w-[14ch] text-[clamp(1.6rem,3.2vw,2.6rem)]">
              Split on-chain, not by memo.
            </h3>
            <p className="mt-4 max-w-[40ch] text-[14px] leading-relaxed text-ink-2">
              Draft figures. They get written into the contract before launch
              and can be read by anyone from the contract afterwards.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-[20px] border border-line bg-white">
              {MINT.split.map((s) => (
                <div key={s.label} className="border-b border-line p-5 last:border-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[14.5px] font-medium text-ink">{s.label}</span>
                    <span className="num text-[15px] text-ink">{s.pct}%</span>
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-paper-3">
                    <div
                      className="h-full rounded-full bg-moss"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-3">{s.note}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ── species ─────────────────────────────────────── */}
      <section className="border-y border-line bg-paper-2 px-5 py-28 md:px-8 md:py-36">
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Six species</Eyebrow>
              <h2 className="display mt-6 max-w-[16ch] text-[clamp(2rem,5vw,3.8rem)]">
                Scarcity that means something.
              </h2>
              <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">
                Supply per species is fixed in the contract and enforced at mint.
                A rare tree is rare because there are fewer of them — not because
                anyone expects it to be worth more.
              </p>
            </div>
            <ButtonLink href="/collection" variant="outline">
              Browse the collection
            </ButtonLink>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIES.map((s, i) => (
              <Reveal key={s.id} delay={(i % 3) * 0.07}>
                <article className="flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-paper">
                  <div className="relative aspect-[4/3] bg-white">
                    <Image
                      src={speciesImage(s.id)}
                      alt={s.name}
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 380px"
                      className="object-contain p-6"
                    />
                    <span className="num absolute right-4 top-4 text-[11px] text-ink-3">
                      {s.supply.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col border-t border-line p-5">
                    <div className="flex items-baseline gap-2">
                      <h3 className="display text-[21px]">{s.name}</h3>
                      <span className="text-[12px] italic text-ink-3">{s.latin}</span>
                    </div>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-2">{s.note}</p>
                    <p className="mt-4 border-t border-line pt-3 text-[11.5px] uppercase tracking-[0.08em] text-ink-3">
                      {s.region}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* rarity bar */}
          <Reveal>
            <div className="mt-14 rounded-[20px] border border-line bg-paper p-6 md:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Eyebrow>Rarity distribution — 10,000 Genesis tokens</Eyebrow>
                <Provisional>Draft supply</Provisional>
              </div>
              <div className="mt-5 flex h-3 overflow-hidden rounded-full">
                {RARITIES.map((r) => (
                  <div
                    key={r.id}
                    style={{ width: `${r.share * 100}%`, background: r.tint }}
                    title={`${r.id} — ${r.supply.toLocaleString("en-US")}`}
                  />
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
                {RARITIES.map((r) => (
                  <div key={r.id}>
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: r.tint }} />
                      <span className="text-[13px] font-medium text-ink">{r.id}</span>
                    </div>
                    <p className="num mt-1 pl-[18px] text-[12.5px] text-ink-3">
                      {r.supply.toLocaleString("en-US")} · {(r.share * 100).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── featured trees ──────────────────────────────── */}
      <Section className="py-28 md:py-36">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>In the forest right now</Eyebrow>
            <h2 className="display mt-6 text-[clamp(2rem,5vw,3.6rem)]">
              Recently minted.
            </h2>
          </div>
          <Link href="/collection" className="text-[13px] text-ink-2 underline-offset-4 hover:underline">
            View all 10,000 →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {featured.map((t, i) => (
            <Reveal key={t.id} delay={(i % 4) * 0.06}>
              <TreeCard tree={t} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── impact preview ──────────────────────────────── */}
      <section className="bg-deep px-5 py-28 text-paper md:px-8 md:py-36">
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-paper/40">The ledger</p>
              <h2 className="display mt-6 max-w-[16ch] text-[clamp(2rem,5vw,3.8rem)] text-paper">
                Every donation, with its hash.
              </h2>
            </div>
            <ButtonLink
              href="/impact"
              className="border border-paper/20 bg-transparent text-paper hover:border-paper hover:bg-paper hover:text-ink"
              variant="ghost"
              size="md"
            >
              Open the full ledger →
            </ButtonLink>
          </div>

          <div className="mt-14 grid gap-8 border-t border-paper/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: IMPACT.treesFunded.toLocaleString("en-US"), l: "trees reported planted", s: "Counted only from filed reports" },
              { v: `$${IMPACT.donatedUsd.toLocaleString("en-US")}`, l: "donated", s: `${IMPACT.donatedEth} ETH across ${IMPACT.transactions} transactions` },
              { v: String(IMPACT.projects), l: "projects", s: `${IMPACT.countries} countries` },
              { v: IMPACT.minted.toLocaleString("en-US"), l: "trees minted", s: `of ${IMPACT.supply.toLocaleString("en-US")} Genesis` },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 0.07}>
                <div className="display text-[clamp(2.2rem,4.6vw,3.4rem)] text-paper">{s.v}</div>
                <div className="mt-2 text-[13px] text-paper/80">{s.l}</div>
                <div className="mt-1 text-[12.5px] text-paper/40">{s.s}</div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-14 overflow-hidden rounded-[20px] border border-paper/10">
              {DONATIONS.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  className="grid gap-3 border-b border-paper/10 p-5 last:border-0 md:grid-cols-[auto_1fr_auto_auto] md:items-center md:gap-6"
                >
                  <span className="num text-[12px] text-paper/40">{d.date}</span>
                  <span className="text-[14px] text-paper/85">{d.region}</span>
                  <span className="num text-[12px] text-paper/40">
                    {d.txHash.slice(0, 10)}…{d.txHash.slice(-8)}
                  </span>
                  <span className="num text-[14px] text-paper">
                    ${d.amountUsd.toLocaleString("en-US")}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <p className="mt-6 text-[12px] text-paper/35">
            Sample rows. The partner column reads &ldquo;pending&rdquo; on every
            entry because no agreement has been signed yet.
          </p>
        </div>
      </section>

      {/* ── permanence ──────────────────────────────────── */}
      <Section className="py-28 md:py-40">
        <div className="grid gap-14 md:grid-cols-2">
          <div>
            <Eyebrow>Secondary market</Eyebrow>
            <ScrollWords
              className="display mt-7 max-w-[13ch] text-[clamp(1.9rem,4.6vw,3.6rem)]"
              text="Sell it whenever you like. The history doesn't leave with you."
            />
          </div>
          <Reveal delay={0.1}>
            <div className="flex flex-col gap-5 md:pt-4">
              {[
                {
                  h: "Standard, so it trades anywhere",
                  p: "ERC-721 on Base. OpenSea, Blur, Rarible and anything else that reads the standard — we run no marketplace of our own and take no cut of resales beyond the on-chain royalty.",
                },
                {
                  h: "Ownership is one field",
                  p: "Transfers rewrite the owner and nothing else. The mint record, every donation hash and every verification date are keyed to the token id, not the wallet.",
                },
                {
                  h: "A buyer inherits the proof",
                  p: "Whoever holds token #00421 in five years can still read which donation funded it, which site it was allocated to, and the date the planting report was filed.",
                },
              ].map((c) => (
                <div key={c.h} className="border-t border-line pt-5">
                  <h3 className="text-[15px] font-medium text-ink">{c.h}</h3>
                  <p className="mt-2 max-w-[46ch] text-[14px] leading-relaxed text-ink-2">{c.p}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ── benefits marquee ────────────────────────────── */}
      <div className="border-y border-line bg-paper-2 py-5">
        <Marquee
          duration={60}
          items={[
            "Traits frozen at mint",
            "Metadata versioned",
            "Donation hash per batch",
            "Planting reports attached",
            "Impact log append-only",
            "Contract-enforced supply",
            "Withdrawals through a multisig",
          ].map((t) => (
            <span key={t} className="display text-[clamp(1.4rem,3.4vw,2.6rem)] text-ink/70">
              {t}
            </span>
          ))}
        />
      </div>

      {/* ── faq ─────────────────────────────────────────── */}
      <Section id="faq" className="py-28 md:py-36">
        <div className="grid gap-12 md:grid-cols-[1fr_1.6fr]">
          <div>
            <Eyebrow>Questions</Eyebrow>
            <h2 className="display mt-6 max-w-[10ch] text-[clamp(2rem,4.6vw,3.4rem)]">
              The awkward ones first.
            </h2>
            <p className="mt-5 max-w-[34ch] text-[14px] leading-relaxed text-ink-2">
              If a question here reads like a hedge, it&rsquo;s because the
              honest answer is one.
            </p>
          </div>
          <Accordion items={FAQ} />
        </div>
      </Section>

      {/* ── journal ─────────────────────────────────────── */}
      <Section id="journal" className="pb-28 md:pb-36">
        <div className="flex items-end justify-between gap-6">
          <h2 className="display text-[clamp(1.8rem,4vw,3rem)]">From the journal.</h2>
          <span className="text-[13px] text-ink-3">Coming with launch</span>
        </div>
        <div className="mt-10 grid gap-px bg-line md:grid-cols-3">
          {JOURNAL.map((j, i) => (
            <Reveal key={j.title} delay={i * 0.07}>
              <article className="h-full bg-paper py-8 md:px-7 md:first:pl-0">
                <div className="flex items-center gap-3 text-[11.5px] text-ink-3">
                  <span className="rounded-full border border-line px-2 py-0.5">{j.tag}</span>
                  <span>{j.date}</span>
                  <span className="ml-auto">{j.read}</span>
                </div>
                <h3 className="display mt-5 max-w-[18ch] text-[21px]">{j.title}</h3>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── closing ─────────────────────────────────────── */}
      <Section className="pb-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-line bg-paper-2 px-6 py-20 text-center md:px-16 md:py-28">
            <Image
              src="/tree/tree-sm.webp"
              alt=""
              aria-hidden
              width={560}
              height={550}
              className="pointer-events-none absolute -bottom-[18%] left-1/2 w-[min(760px,120%)] -translate-x-1/2 opacity-[0.14]"
            />
            <div className="relative">
              <h2 className="display mx-auto max-w-[16ch] text-[clamp(2rem,5.4vw,4.2rem)]">
                Collect a tree. Keep the receipt.
              </h2>
              <p className="mx-auto mt-6 max-w-[48ch] text-[15px] leading-relaxed text-ink-2">
                The Genesis Forest opens with 10,000 numbered trees. Nothing is
                live yet — this is the interface, published early so it can be
                argued with before anything is deployed.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
                <ButtonLink href="/mint" size="lg">
                  Open the mint
                </ButtonLink>
                <ButtonLink href="/collection" variant="outline" size="lg">
                  Browse trees
                </ButtonLink>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-ink-3">
                <span>{MINT.standard}</span>
                <span>·</span>
                <span>{MINT.chain}</span>
                <span>·</span>
                <span>{MINT.priceEth} ETH</span>
                <span>·</span>
                <span>Max {MINT.perWallet} per wallet</span>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

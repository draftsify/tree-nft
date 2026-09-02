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
  PAYMENT,
  priceLabel,
  RARITIES,
  SPECIES,
  STAGES,
  TREES,
  speciesImage,
} from "@/lib/data";

const PRINCIPLES = [
  {
    n: "01",
    title: "Generative artwork",
    body: "Every token is composed from photographed specimen trees, each shot the same way against the same white ground: species, canopy, trunk, season and light are drawn from a fixed trait system at mint. Because the artwork is generated rather than hand-assigned, each token's traits can be checked against the contract.",
  },
  {
    n: "02",
    title: "Published donations",
    body: "The mint splits itself. 60% leaves for One Tree Planted's donation address inside the same transaction that issues your token, so the donation and the mint are one record rather than two you have to reconcile.",
  },
  {
    n: "03",
    title: "Milestone-based evolution",
    body: "A token's stage is a pure function of how much the collection has donated. There is no setter on the contract, so no key can advance a token and no schedule releases one.",
  },
  {
    n: "04",
    title: "No unverified claims",
    body: "This site does not state how many trees a mint funds, because no partner has confirmed a cost per tree. When that figure is agreed it will be recorded in each token's metadata with its source and date.",
  },
];

const STEPS = [
  {
    n: "Step 01",
    title: "Connect",
    body: "Any EVM wallet, on Robinhood Chain. Connecting is read-only and grants no permissions until you approve a transaction.",
  },
  {
    n: "Step 02",
    title: "Mint",
    body: "Traits are assigned by the contract at mint and frozen in the same transaction. Species, rarity and traits cannot be rewritten afterwards.",
  },
  {
    n: "Step 03",
    title: "Watch it change",
    body: "Tokens are issued as a Seed. Each subsequent stage is written only after the corresponding funding milestone has been verified and filed against the token id.",
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
              <Eyebrow>Digital trees that fund real forests</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="display mt-6 max-w-[10ch] text-[clamp(2.7rem,6.6vw,5.4rem)] lg:max-w-[9ch]">
                Mint a tree, plant a tree.
              </h1>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed text-ink-2 md:text-[16px]">
                Each token is a unique digital tree. 60% of every mint is sent
                to One Tree Planted, and every donation is published with its
                transaction hash.
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

          <div className="mx-auto mt-auto w-full max-w-[1240px] pt-16">
            {/* held to the left column on wide screens so the scroll note
                never lands on the canopy */}
            <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8 lg:w-[62%] lg:max-w-[720px]">
              <Reveal delay={0.3}>
                <div className="flex items-center gap-2">
                  <Eyebrow>Genesis supply</Eyebrow>
                  <Provisional>Not yet live</Provisional>
                </div>
                <p className="num mt-3 text-[28px] leading-none text-ink">
                  {IMPACT.minted.toLocaleString("en-US")}
                  <span className="text-ink-3"> / {IMPACT.supply.toLocaleString("en-US")}</span>
                </p>
                <p className="mt-2.5 text-[12.5px] text-ink-3">
                  {priceLabel()} · {MINT.chain} · {MINT.standard}
                </p>
              </Reveal>

              <Reveal delay={0.36} className="hidden md:block">
                <p className="max-w-[24ch] text-right text-[12.5px] leading-relaxed text-ink-3">
                  Scroll to see how a token moves through its four stages.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── thesis ──────────────────────────────────────── */}
      <Section id="thesis" className="py-28 md:py-40">
        <Eyebrow>Overview</Eyebrow>
        <ScrollWords
          className="display mt-8 max-w-[19ch] text-[clamp(2rem,6.2vw,5.2rem)]"
          text="Every figure on this site is tied to a transaction that can be checked independently."
        />
        <div className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-3">
          {[
            {
              h: "The artwork",
              p: "Each token is a distinct composition drawn from a fixed set of species, canopy, trunk, season and light traits. Traits are assigned by the contract at mint and cannot be changed.",
            },
            {
              h: "The funding record",
              p: "Each token carries an append-only log: the mint transaction, the donation that followed, the project the funds were allocated to, and the date a planting report was filed.",
            },
            {
              h: "What it is not",
              p: "There is no staking, airdrop schedule, floor-price mechanism or buyback. Resale prices are set by the secondary market and carry no guarantee.",
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
        <div className="grid border-t border-line md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.n} delay={(i % 2) * 0.08}>
              <div className="flex h-full flex-col border-b border-line py-10 md:pr-12 md:[&:nth-child(odd)]:pr-16">
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
              Four stages, each one a number on the contract.
            </h2>
            <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-ink-2">
              Stage is derived from cumulative donations, so it can be checked
              by calling the contract rather than taken from us. Every token
              shares it: the forest grows together, and it grows only when more
              has actually been given.
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
              How minting works.
            </h2>
          </div>
          <ButtonLink href="/mint" variant="outline">
            Open the mint
          </ButtonLink>
        </div>

        <DrawLine className="mt-12" />

        <div className="grid md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="h-full py-10 md:pr-10">
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
            <Eyebrow>Revenue allocation</Eyebrow>
            <h3 className="display mt-5 max-w-[16ch] text-[clamp(1.6rem,3.2vw,2.6rem)]">
              Allocation of mint revenue.
            </h3>
            <p className="mt-4 max-w-[42ch] text-[14px] leading-relaxed text-ink-2">
              These are draft figures. They will be written into the contract
              before launch and can be read from it by anyone afterwards.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="border-t border-line">
              {MINT.split.map((s) => (
                <div key={s.label} className="border-b border-line py-5">
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
              <Eyebrow>Species</Eyebrow>
              <h2 className="display mt-6 max-w-[16ch] text-[clamp(2rem,5vw,3.8rem)]">
                Six species, fixed supply.
              </h2>
              <p className="mt-5 max-w-[54ch] text-[15px] leading-relaxed text-ink-2">
                Supply per species is set in the contract and enforced at mint.
                Rarity describes how many tokens exist at each tier. It is not a
                statement about value.
              </p>
            </div>
            <ButtonLink href="/collection" variant="outline">
              Browse the collection
            </ButtonLink>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIES.map((s, i) => (
              <Reveal key={s.id} delay={(i % 3) * 0.07}>
                <article className="flex h-full flex-col border-t border-line pt-4">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={speciesImage(s.id)}
                      alt={s.name}
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 380px"
                      className="object-contain p-6"
                    />
                    <span className="num absolute right-0 top-0 text-[11px] text-ink-3">
                      {s.supply.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col pt-4">
                    <div className="flex items-baseline gap-2">
                      <h3 className="display text-[21px]">{s.name}</h3>
                      <span className="text-[12px] italic text-ink-3">{s.latin}</span>
                    </div>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-2">{s.note}</p>
                    <p className="mt-4 text-[11.5px] uppercase tracking-[0.08em] text-ink-3">
                      {s.region}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* rarity bar */}
          <Reveal>
            <div className="mt-16 border-t border-line pt-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Eyebrow>Rarity distribution — 1,000 Genesis tokens</Eyebrow>
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
            <Eyebrow>Preview</Eyebrow>
            <h2 className="display mt-6 text-[clamp(2rem,5vw,3.6rem)]">
              Sample compositions.
            </h2>
          </div>
          <Link href="/collection" className="text-[13px] text-ink-2 underline-offset-4 hover:underline">
            Browse the preview →
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
              <p className="eyebrow text-paper/40">Impact ledger</p>
              <h2 className="display mt-6 max-w-[16ch] text-[clamp(2rem,5vw,3.8rem)] text-paper">
                The donation record.
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
              { v: `${IMPACT.donatedTokens.toLocaleString("en-US")}`, l: `${PAYMENT.symbol} donated`, s: `across ${IMPACT.transactions} transactions` },
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
            <div className="mt-14 border-t border-paper/10">
              {DONATIONS.length === 0 && (
                <p className="py-8 text-[14px] text-paper/45">
                  No donation has been made. The first batch will appear here
                  with its transaction hash on the day it settles.
                </p>
              )}
              {DONATIONS.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  className="grid gap-3 border-b border-paper/10 py-5 md:grid-cols-[auto_1fr_auto_auto] md:items-center md:gap-6"
                >
                  <span className="num text-[12px] text-paper/40">{d.date}</span>
                  <span className="text-[14px] text-paper/85">{d.region}</span>
                  <span className="mono text-[12px] text-paper/40">
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
            No funds have been sent yet.
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
              text="Tokens can be transferred and resold at any time. The funding record stays attached."
            />
          </div>
          <Reveal delay={0.1}>
            <div className="flex flex-col gap-5 md:pt-4">
              {[
                {
                  h: "Standard token, any marketplace",
                  p: "An ERC-721 collection, tradable on any marketplace that indexes the chain. We operate no marketplace of our own and take no share of resales beyond the on-chain royalty.",
                },
                {
                  h: "Transfers change one field",
                  p: "A transfer rewrites the owner and nothing else. The mint record, donation hashes and verification dates are keyed to the token id rather than to a wallet.",
                },
                {
                  h: "The record passes to the buyer",
                  p: "Whoever holds a token in five years can still read which donation funded it, which site it was allocated to, and the date the planting report was filed.",
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
            <h2 className="display mt-6 max-w-[12ch] text-[clamp(2rem,4.6vw,3.4rem)]">
              Common questions.
            </h2>
            <p className="mt-5 max-w-[36ch] text-[14px] leading-relaxed text-ink-2">
              Covering the mint mechanism, what the token does and does not
              confer, and the current state of the project.
            </p>
          </div>
          <Accordion items={FAQ} />
        </div>
      </Section>

      {/* ── journal ─────────────────────────────────────── */}
      <Section id="journal" className="pb-28 md:pb-36">
        <div className="flex items-end justify-between gap-6">
          <h2 className="display text-[clamp(1.8rem,4vw,3rem)]">Journal.</h2>
          <span className="text-[13px] text-ink-3">Published at launch</span>
        </div>
        <div className="mt-10 grid border-t border-line md:grid-cols-3">
          {JOURNAL.map((j, i) => (
            <Reveal key={j.title} delay={i * 0.07}>
              <article className="h-full py-8 md:pr-10">
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
          <div className="relative overflow-hidden rounded-[28px] bg-paper-2 px-6 py-20 text-center md:px-16 md:py-28">
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
                The Genesis Forest opens with 1,000 trees.
              </h2>
              <p className="mx-auto mt-6 max-w-[50ch] text-[15px] leading-relaxed text-ink-2">
                Nothing is live yet. This interface is published ahead of the
                contract so that the mechanism and the disclosures can be
                reviewed before anything is deployed.
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
                <span>{priceLabel()}</span>
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

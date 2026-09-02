import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import {
  ButtonLink,
  Eyebrow,
  Hash,
  Provisional,
  RarityBadge,
  Section,
  StageBadge,
  StatusDot,
} from "@/components/ui";
import {
  DONATIONS,
  SPECIES,
  STAGES,
  ALL_TREES,
  TREES,
  tokenImage,
  treeById,
  type StageId,
} from "@/lib/data";

/**
 * Prerender the slice the collection page links to. The rest of the thousand
 * render on demand rather than lengthening every build.
 */
export function generateStaticParams() {
  return TREES.map((t) => ({ id: String(t.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tree = treeById(Number(id));
  if (!tree) return { title: "Not found" };
  const species = SPECIES.find((s) => s.id === tree.species)!;
  return {
    title: `#${tree.tokenId} · ${tree.rarity} ${species.name}`,
    description: `A ${tree.rarity} ${species.name} from the Genesis Forest.`,
  };
}

const STAGE_ORDER: StageId[] = ["seed", "sapling", "young", "mature"];

export default async function TreePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const n = Number(id);
  const tree = treeById(n);
  if (!tree) notFound();
  const species = SPECIES.find((s) => s.id === tree.species)!;
  const stageIndex = STAGE_ORDER.indexOf(tree.stage);
  /** The batch this token was funded by, once one exists. */
  const donation = DONATIONS.length ? DONATIONS[n % DONATIONS.length] : null;

  const attributes: [string, string][] = [
    ["Species", species.name],
    ["Rarity", tree.rarity],
    ["Forest", tree.forest],
    ["Region", tree.region],
    ["Season", tree.season],
    ["Canopy", tree.canopy],
    ["Trunk", tree.trunk],
    ["Effect", tree.effect],
    ["Collection", "Genesis"],
    ["Mint number", `#${tree.tokenId}`],
  ];

  /* The permanent log. Entries are only shown up to the stage actually reached. */
  const history: {
    title: string;
    date: string | null;
    body: string;
    hash: string | null;
    done: boolean;
  }[] = [
    {
      title: "Minted",
      date: tree.mintedAt,
      body: tree.owner
        ? `Token #${tree.tokenId} issued to ${tree.owner}. Traits written and frozen in the same transaction.`
        : "Traits are written and frozen in the same transaction that issues the token.",
      hash: null,
      done: tree.mintedAt !== null,
    },
    {
      title: "Reforestation share sent",
      date: donation?.date ?? null,
      body: donation
        ? `${donation.amountAsset} sent to One Tree Planted as part of batch ${donation.id}.`
        : "60% of the mint leaves for One Tree Planted inside the minting transaction itself.",
      hash: donation?.txHash ?? null,
      done: stageIndex >= 1,
    },
    {
      title: "Allocated to a planting site",
      date: donation && donation.status !== "pending" ? "2026-07-15" : null,
      body: donation
        ? `The partner assigned batch ${donation.id} to ${donation.region} and confirmed the planting window.`
        : "The partner assigns the batch to a named site and confirms the planting window in writing.",
      hash: null,
      done: stageIndex >= 2,
    },
    {
      title: "Planting report filed",
      date: donation?.verifiedAt ?? null,
      body: "A dated report with site photographs, attached to the batch and to every token it funded.",
      hash: null,
      done: stageIndex >= 3,
    },
  ];

  return (
    <>
      <Section className="pb-8 pt-32 md:pt-40">
        <Link
          href="/collection"
          className="text-[13px] text-ink-3 underline-offset-4 hover:text-ink hover:underline"
        >
          ← Collection
        </Link>
      </Section>

      <Section className="pb-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* artwork */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-[24px] bg-paper-2">
              <Image
                src={tokenImage(tree.id, 4)}
                alt={`Tree #${tree.tokenId}`}
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 560px"
                unoptimized
                className="object-cover"
              />
              <div className="absolute left-5 top-5 flex gap-2">
                <RarityBadge rarity={tree.rarity} />
                <StageBadge stage={tree.stage} />
              </div>
            </div>

            {/* stage rail */}
            <div className="mt-6 border-t border-line pt-5">
              <div className="flex items-center justify-between">
                <Eyebrow>Evolution</Eyebrow>
                <span className="text-[12px] text-ink-3">
                  Stage {stageIndex + 1} of 4
                </span>
              </div>
              <div className="mt-4 flex gap-1.5">
                {STAGE_ORDER.map((s, i) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full ${
                      i <= stageIndex ? "bg-moss" : "bg-paper-3"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {STAGES.map((s, i) => (
                  <div key={s.id} className={i <= stageIndex ? "" : "opacity-35"}>
                    <div className="num text-[11px] text-ink-3">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="mt-1 text-[11.5px] text-ink-2">{s.label}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-line pt-3 text-[12.5px] leading-relaxed text-ink-3">
                {STAGES[stageIndex].blurb}
              </p>
            </div>
          </div>

          {/* details */}
          <div>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <h1 className="display text-[clamp(2.4rem,5.4vw,3.8rem)]">
                Tree #{tree.tokenId}
              </h1>
              <Provisional>Preview</Provisional>
            </div>
            <p className="mt-3 text-[15px] text-ink-2">
              {tree.rarity} {species.name} · <span className="italic">{species.latin}</span>
            </p>

            <dl className="mt-8 grid grid-cols-2 border-t border-line">
              {attributes.map(([k, v]) => (
                <div key={k} className="border-b border-line py-4 pr-4">
                  <dt className="eyebrow">{k}</dt>
                  <dd className="mt-1.5 text-[14px] text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            {/* impact summary */}
            <div className="mt-8 border-t border-line pt-5">
              <div className="flex items-center justify-between gap-3">
                <Eyebrow>Impact</Eyebrow>
                <StatusDot status={tree.status} />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="display text-[28px]">
                    {tree.treesFunded ?? "—"}
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">
                    trees attributed to this token. Left blank until a partner
                    confirms cost per tree in writing.
                  </p>
                </div>
                <div>
                  <div className="display text-[28px]">
                    {donation ? donation.region.split(",")[0] : "—"}
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">
                    {donation
                      ? `planting region for batch ${donation.id}.`
                      : "planting region, assigned once the funding batch is allocated."}
                  </p>
                </div>
              </div>
            </div>

            {/* ownership + market */}
            <div className="mt-8 border-t border-line pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Eyebrow>Current owner</Eyebrow>
                  <p className="num mt-1.5 text-[14px] text-ink">
                    {tree.owner ?? "Unminted"}
                  </p>
                </div>
                <div className="text-right">
                  <Eyebrow>Last sale</Eyebrow>
                  <p className="num mt-1.5 text-[14px] text-ink">—</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href="/mint" size="sm">
                  Mint your own
                </ButtonLink>
                <button
                  disabled
                  className="inline-flex h-9 items-center rounded-full border border-line px-4 text-[13px] text-ink-3"
                  title="No contract is deployed yet"
                >
                  View on marketplace
                </button>
                <button
                  disabled
                  className="inline-flex h-9 items-center rounded-full border border-line px-4 text-[13px] text-ink-3"
                  title="No contract is deployed yet"
                >
                  Transfer
                </button>
              </div>
              <p className="mt-4 text-[11.5px] leading-relaxed text-ink-3">
                Marketplace actions are inactive because no contract is
                deployed. Once live they hand off to the standard ERC-721
                interface, and the token is never held in custody by us.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── permanent history ───────────────────────────── */}
      <section className="border-t border-line bg-paper-2 px-5 py-24 md:px-8">
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="grid gap-10 md:grid-cols-[1fr_1.7fr]">
            <div>
              <Eyebrow>Permanent record</Eyebrow>
              <h2 className="display mt-5 max-w-[12ch] text-[clamp(1.8rem,4vw,3rem)]">
                The record attached to this token.
              </h2>
              <p className="mt-4 max-w-[40ch] text-[14px] leading-relaxed text-ink-2">
                Append-only and keyed to the token id. A sale rewrites the owner
                field and leaves everything below it unchanged.
              </p>
            </div>

            <ol className="relative">
              <div className="absolute bottom-3 left-[7px] top-3 w-px bg-line" />
              {history.map((h, i) => (
                <Reveal key={h.title} delay={i * 0.06}>
                  <li className={`relative pb-8 pl-8 ${h.done ? "" : "opacity-45"}`}>
                    <span
                      className={`absolute left-0 top-1.5 size-[15px] rounded-full border-2 ${
                        h.done ? "border-moss bg-moss" : "border-line-2 bg-paper-2"
                      }`}
                    />
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-[15px] font-medium text-ink">{h.title}</h3>
                      <span className="num text-[12px] text-ink-3">
                        {h.done ? (h.date ?? "—") : "Not yet reached"}
                      </span>
                    </div>
                    <p className="mt-1.5 max-w-[54ch] text-[13.5px] leading-relaxed text-ink-2">
                      {h.body}
                    </p>
                    {h.hash && h.done && (
                      <p className="mt-2">
                        <Hash value={h.hash} />
                      </p>
                    )}
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── neighbours ──────────────────────────────────── */}
      <Section className="py-20">
        <div className="flex items-center justify-between">
          <Link
            href={`/tree/${Math.max(1, n - 1)}`}
            className="text-[13px] text-ink-2 underline-offset-4 hover:underline"
          >
            ← #{String(Math.max(1, n - 1)).padStart(5, "0")}
          </Link>
          <Link href="/collection" className="text-[13px] text-ink-3 hover:text-ink">
            All trees
          </Link>
          <Link
            href={`/tree/${Math.min(ALL_TREES.length, n + 1)}`}
            className="text-[13px] text-ink-2 underline-offset-4 hover:underline"
          >
            #{String(Math.min(ALL_TREES.length, n + 1)).padStart(5, "0")} →
          </Link>
        </div>
      </Section>
    </>
  );
}

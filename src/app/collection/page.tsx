import type { Metadata } from "next";
import CollectionBrowser from "./CollectionBrowser";
import { Eyebrow, Provisional, Section } from "@/components/ui";
import { IMPACT, TREES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Genesis Forest — Tree",
  description:
    "10,000 numbered trees. Six species, five rarity tiers, supply enforced in the contract.",
};

export default function CollectionPage() {
  return (
    <>
      <Section className="pb-10 pt-36 md:pt-44">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <Eyebrow>Genesis Forest</Eyebrow>
              <Provisional />
            </div>
            <h1 className="display mt-6 max-w-[14ch] text-[clamp(2.4rem,6vw,4.6rem)]">
              Ten thousand trees, one at a time.
            </h1>
            <p className="mt-5 max-w-[54ch] text-[15px] leading-relaxed text-ink-2">
              Species, rarity and traits are assigned at mint and frozen. Stage
              is the only field that ever changes, and it changes only when a
              funding milestone is verified.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-8 text-right md:gap-12">
            {[
              ["Minted", IMPACT.minted.toLocaleString("en-US")],
              ["Supply", IMPACT.supply.toLocaleString("en-US")],
              ["Holders", IMPACT.holders.toLocaleString("en-US")],
            ].map(([l, v]) => (
              <div key={l}>
                <dt className="eyebrow">{l}</dt>
                <dd className="num mt-2 text-[22px] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <CollectionBrowser trees={TREES} />
    </>
  );
}

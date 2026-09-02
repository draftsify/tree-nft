import type { Metadata } from "next";
import MintPanel from "./MintPanel";
import { Eyebrow, Section } from "@/components/ui";
import { MINT } from "@/lib/data";

export const metadata: Metadata = {
  title: "Mint — Tree",
  description:
    "Mint a Genesis tree. Traits frozen at mint, reforestation share routed on-chain, no promises about resale.",
};

const SPEC: [string, string, string][] = [
  ["Blockchain", MINT.chain, "L2 rollup, settled to Ethereum. Cheap enough to write a metadata version on every milestone."],
  ["Standard", MINT.standard, "Read by every major marketplace, so trading needs no venue of ours."],
  ["Supply", MINT.supply.toLocaleString("en-US"), "Hard cap in the contract. No later mints into this collection."],
  ["Price", `${MINT.priceEth} ETH`, `≈ $${MINT.priceUsdApprox} at the time of writing.`],
  ["Per wallet", String(MINT.perWallet), "Enforced on-chain, not by the interface."],
  ["Metadata", "Arweave", MINT.metadata],
];

export default function MintPage() {
  return (
    <>
      <Section className="pb-14 pt-36 md:pt-44">
        <Eyebrow>Genesis Forest</Eyebrow>
        <h1 className="display mt-6 max-w-[14ch] text-[clamp(2.4rem,6.2vw,4.8rem)]">
          Mint a tree that has to earn its own growth.
        </h1>
        <p className="mt-6 max-w-[56ch] text-[15px] leading-relaxed text-ink-2">
          You are buying a collectible and a funding record. There is no yield,
          no revenue share and no promise about what it will be worth later.
          Please read the panel on the right before you decide.
        </p>
      </Section>

      <Section className="pb-24">
        <MintPanel />
      </Section>

      {/* ── specification ───────────────────────────────── */}
      <section className="border-y border-line bg-paper-2 px-5 py-24 md:px-8">
        <div className="mx-auto w-full max-w-[1240px]">
          <Eyebrow>Specification</Eyebrow>
          <h2 className="display mt-5 max-w-[16ch] text-[clamp(1.8rem,4vw,3rem)]">
            Decided before a line of the contract was written.
          </h2>

          <dl className="mt-12 grid gap-px overflow-hidden rounded-[20px] border border-line bg-line md:grid-cols-3">
            {SPEC.map(([k, v, note]) => (
              <div key={k} className="bg-paper p-6">
                <dt className="eyebrow">{k}</dt>
                <dd className="display mt-3 text-[24px]">{v}</dd>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-3">{note}</p>
              </div>
            ))}
          </dl>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-[15px] font-medium text-ink">Security</h3>
              <ul className="mt-3 flex flex-col gap-2.5 text-[13.5px] leading-relaxed text-ink-2">
                <li>— External audit before deployment, report published in full including anything unresolved.</li>
                <li>— Withdrawals behind a multisig; no single key can move funds.</li>
                <li>— Pausable mint, but transfers can never be paused — your token stays yours if we go dark.</li>
                <li>— Trait fields immutable after mint, enforced in the contract rather than by policy.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-[15px] font-medium text-ink">Still open</h3>
              <ul className="mt-3 flex flex-col gap-2.5 text-[13.5px] leading-relaxed text-ink-2">
                <li>— No charity partnership is signed, so cost per tree is unknown.</li>
                <li>— Jurisdiction and disclosure requirements for the donation flow are still being reviewed.</li>
                <li>— Royalty rate on secondary sales is not fixed.</li>
                <li>— The verification process for planting reports needs a second, independent reader.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

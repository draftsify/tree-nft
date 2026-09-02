import type { Metadata } from "next";
import MintPanel from "./MintPanel";
import { Eyebrow, Section } from "@/components/ui";
import { MINT, priceLabel } from "@/lib/data";

export const metadata: Metadata = {
  title: "Mint",
  description:
    "Mint a Genesis tree. Traits frozen at mint, reforestation share routed on-chain, no promises about resale.",
};

const SPEC: [string, string, string][] = [
  ["Blockchain", MINT.chain, "Fees low enough to write a metadata version at every milestone rather than batching them."],
  ["Standard", MINT.standard, "Read by every major marketplace and indexer, so tokens trade without a venue of ours."],
  ["Supply", MINT.supply.toLocaleString("en-US"), "A hard cap in the contract. No further mints into this collection."],
  ["Price", priceLabel(), "Paid in the project's own token. Approve once, then mint."],
  ["Per wallet", String(MINT.perWallet), "Enforced by the contract rather than by the interface."],
  ["Creator fee", `${MINT.royaltyPct}%`, "On secondary sales, declared through ERC-2981."],
  ["Metadata", "Arweave", MINT.metadata],
];

export default function MintPage() {
  return (
    <>
      <Section className="pb-14 pt-36 md:pt-44">
        <Eyebrow>Genesis Forest</Eyebrow>
        <h1 className="display mt-6 max-w-[14ch] text-[clamp(2.4rem,6.2vw,4.8rem)]">
          Mint a token from the Genesis Forest.
        </h1>
        <p className="mt-6 max-w-[58ch] text-[15px] leading-relaxed text-ink-2">
          A mint buys a collectible token and the funding record attached to it.
          It carries no yield, no revenue share and no guarantee of future
          value. Please read the disclosures alongside the panel before minting.
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
            Fixed before the contract is written.
          </h2>

          <dl className="mt-12 grid border-t border-line md:grid-cols-3">
            {SPEC.map(([k, v, note]) => (
              <div key={k} className="border-b border-line py-6 pr-8">
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
                <li>— External audit before deployment, with the report published in full, including unresolved findings.</li>
                <li>— Withdrawals require a multisig. No single key can move funds.</li>
                <li>— The mint is pausable. Transfers are not, so tokens remain usable if the project stops operating.</li>
                <li>— Trait fields are immutable after mint, enforced by the contract rather than by policy.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-[15px] font-medium text-ink">Still open</h3>
              <ul className="mt-3 flex flex-col gap-2.5 text-[13.5px] leading-relaxed text-ink-2">
                <li>— One Tree Planted has not confirmed what our donations funded, so cost per tree is not yet attributed.</li>
                <li>— Jurisdiction and disclosure requirements for the donation flow are under review.</li>
                <li>— The royalty rate on secondary sales is not fixed.</li>
                <li>— The verification process requires a second, independent reader of planting reports.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

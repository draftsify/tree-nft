import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import {
  Eyebrow,
  Hash,
  Provisional,
  Section,
  StatusDot,
} from "@/components/ui";
import { DONATIONS, IMPACT, PROJECTS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Impact ledger — Tree",
  description:
    "Every donation, its transaction hash, the project it funded and the date a planting report was filed.",
};

export default function ImpactPage() {
  const reported = DONATIONS.filter((d) => d.treesFunded !== null);
  const unreported = DONATIONS.length - reported.length;

  return (
    <>
      <Section className="pb-16 pt-36 md:pt-44">
        <div className="flex items-center gap-3">
          <Eyebrow>Public ledger</Eyebrow>
          <Provisional />
        </div>
        <h1 className="display mt-6 max-w-[15ch] text-[clamp(2.4rem,6.2vw,4.8rem)]">
          Where the money went, and what came back.
        </h1>
        <p className="mt-6 max-w-[58ch] text-[15px] leading-relaxed text-ink-2">
          Two columns matter here: what left the treasury, and what a partner
          confirmed in writing afterwards. They are counted separately on
          purpose — money sent is not the same as a tree in the ground, and
          conflating them is how impact reporting usually goes wrong.
        </p>
      </Section>

      {/* ── headline numbers ────────────────────────────── */}
      <Section className="pb-20">
        <div className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              v: IMPACT.treesFunded.toLocaleString("en-US"),
              l: "trees reported planted",
              s: `From ${reported.length} filed reports. ${unreported} batch${unreported === 1 ? "" : "es"} still outstanding.`,
            },
            {
              v: `$${IMPACT.donatedUsd.toLocaleString("en-US")}`,
              l: "sent to partners",
              s: `${IMPACT.donatedEth} ETH across ${IMPACT.transactions} on-chain transactions.`,
            },
            {
              v: String(IMPACT.projects),
              l: "reforestation projects",
              s: `${IMPACT.countries} countries. Four still awaiting allocation.`,
            },
            {
              v: IMPACT.minted.toLocaleString("en-US"),
              l: "trees minted",
              s: `${((IMPACT.minted / IMPACT.supply) * 100).toFixed(1)}% of Genesis supply, held by ${IMPACT.holders} wallets.`,
            },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 0.06}>
              <div className="h-full border-b border-line py-7 pr-7">
                <div className="display text-[clamp(2.2rem,4.4vw,3.2rem)]">{s.v}</div>
                <div className="mt-3 text-[13.5px] font-medium text-ink">{s.l}</div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-3">{s.s}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
          Every figure on this page is placeholder data. When the ledger is
          live these numbers come from the indexer and the contract, never from
          a file someone edits by hand.
        </p>
      </Section>

      {/* ── donations ───────────────────────────────────── */}
      <section className="border-y border-line bg-paper-2 px-5 py-20 md:px-8">
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Donations</Eyebrow>
              <h2 className="display mt-5 text-[clamp(1.8rem,4vw,2.8rem)]">
                Every transaction, in order.
              </h2>
            </div>
            <span className="text-[12.5px] text-ink-3">
              {DONATIONS.length} batches · Base
            </span>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line-2">
                  {["Batch", "Date", "Amount", "Transaction", "Project", "Status", "Trees reported"].map(
                    (h) => (
                      <th key={h} className="eyebrow pb-3 pr-6 font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {DONATIONS.map((d) => (
                  <tr key={d.id} className="border-b border-line align-top">
                    <td className="num py-5 pr-6 text-[13px] text-ink">{d.id}</td>
                    <td className="num py-5 pr-6 text-[13px] text-ink-2">{d.date}</td>
                    <td className="py-5 pr-6">
                      <div className="num text-[13.5px] text-ink">
                        ${d.amountUsd.toLocaleString("en-US")}
                      </div>
                      <div className="num text-[11.5px] text-ink-3">{d.amountAsset}</div>
                    </td>
                    <td className="py-5 pr-6">
                      <Hash value={d.txHash} />
                    </td>
                    <td className="py-5 pr-6">
                      <div className="text-[13px] text-ink">{d.projectId}</div>
                      <div className="text-[11.5px] text-ink-3">{d.region}</div>
                    </td>
                    <td className="py-5 pr-6">
                      <StatusDot status={d.status} />
                      {d.verifiedAt && (
                        <div className="num mt-1 text-[11px] text-ink-3">
                          verified {d.verifiedAt}
                        </div>
                      )}
                    </td>
                    <td className="py-5 text-right">
                      <span className="num text-[13.5px] text-ink">
                        {d.treesFunded === null ? "—" : d.treesFunded.toLocaleString("en-US")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 max-w-[70ch] text-[12px] leading-relaxed text-ink-3">
            A dash in the last column means the money has moved but no partner
            report has been filed yet. It is not a zero and it is not an
            estimate — it stays blank until there is a document behind it.
          </p>
        </div>
      </section>

      {/* ── projects ────────────────────────────────────── */}
      <Section className="py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Projects</Eyebrow>
            <h2 className="display mt-5 max-w-[16ch] text-[clamp(1.8rem,4vw,2.8rem)]">
              Named sites, not &ldquo;a forest somewhere&rdquo;.
            </h2>
          </div>
          <span className="text-[12.5px] text-ink-3">{PROJECTS.length} sites</span>
        </div>

        <div className="mt-10 grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06}>
              <article className="flex h-full flex-col border-t border-line pt-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="num text-[11.5px] text-ink-3">{p.id}</span>
                  <StatusDot status={p.status} />
                </div>
                <h3 className="display mt-4 text-[19px] leading-tight">{p.name}</h3>
                <p className="mt-1.5 text-[12.5px] text-ink-3">
                  {p.region}, {p.country}
                </p>
                <dl className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-[12.5px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-3">Area</dt>
                    <dd className="num text-ink">{p.hectares} ha</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-3">Window</dt>
                    <dd className="text-ink">{p.window}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-3">Species</dt>
                    <dd className="text-right text-ink">{p.species.join(", ")}</dd>
                  </div>
                </dl>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── method ──────────────────────────────────────── */}
      <section className="bg-deep px-5 py-24 text-paper md:px-8">
        <div className="mx-auto grid w-full max-w-[1240px] gap-12 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow text-paper/40">Method</p>
            <h2 className="display mt-5 max-w-[12ch] text-[clamp(1.8rem,4vw,2.8rem)] text-paper">
              How a number gets onto this page.
            </h2>
          </div>
          <ol className="flex flex-col">
            {[
              ["Mint settles", "The reforestation share accumulates in a dedicated address. Nothing is claimed at this point."],
              ["Batch is sent", "Once the balance clears the partner's minimum, it goes out in one transaction. The hash is published the same day, before any allocation is known."],
              ["Partner allocates", "The partner names the site and the planting window in writing. That letter is what moves affected tokens to Young Tree."],
              ["Report is filed", "A dated report with counts and site photographs. Only then does a tree count appear in the table above, and only then do tokens reach Mature."],
              ["Nothing is back-filled", "If a report never arrives, the row keeps its dash permanently. We don't estimate, and we don't quietly delete the batch."],
            ].map(([h, p], i) => (
              <li key={h} className="border-t border-paper/10 py-6 first:border-0 first:pt-0">
                <div className="flex gap-5">
                  <span className="num shrink-0 text-[12px] text-paper/35">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-medium text-paper">{h}</h3>
                    <p className="mt-1.5 max-w-[58ch] text-[13.5px] leading-relaxed text-paper/55">
                      {p}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

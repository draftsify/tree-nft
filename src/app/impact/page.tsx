import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import {
  Eyebrow,
  Hash,
  Provisional,
  Section,
  StatusDot,
} from "@/components/ui";
import { DONATIONS, IMPACT, MINT, PARTNER, PROJECTS } from "@/lib/data";
import { robinhoodChain } from "@/lib/chain";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "Every donation, its transaction hash, the project it funded and the date a planting report was filed.",
};

export default function ImpactPage() {
  return (
    <>
      <Section className="pb-16 pt-36 md:pt-44">
        <div className="flex items-center gap-3">
          <Eyebrow>Public ledger</Eyebrow>
          <Provisional />
        </div>
        <h1 className="display mt-6 max-w-[15ch] text-[clamp(2.4rem,6.2vw,4.8rem)]">
          Donations sent, and results confirmed.
        </h1>
        <p className="mt-6 max-w-[60ch] text-[15px] leading-relaxed text-ink-2">
          Two figures are tracked separately: the amount sent to partner
          organisations, and the planting a partner has since confirmed in
          writing. Funds sent are not evidence of trees planted, so the two are
          never combined into a single number.
        </p>
      </Section>

      {/* ── headline numbers ────────────────────────────── */}
      <Section className="pb-20">
        <div className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              v: IMPACT.treesFunded.toLocaleString("en-US"),
              l: "trees reported planted",
              s: `Counted from filed partner reports only.`,
            },
            {
              v: `$${IMPACT.donatedUsd.toLocaleString("en-US")}`,
              l: "sent to partners",
              s: `${IMPACT.donatedEth} ETH across ${IMPACT.transactions} on-chain transactions.`,
            },
            {
              v: String(IMPACT.projects),
              l: "reforestation projects",
              s: `Across ${IMPACT.countries} countries.`,
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
          The ledger is empty because nothing has been sent yet. Once the mint
          is live these values are read from the contract and the indexer rather
          than from a file maintained by hand.
        </p>
      </Section>

      {/* ── recipient ───────────────────────────────────── */}
      <Section className="pb-20">
        <div className="grid gap-10 border-t border-line pt-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <Eyebrow>Recipient</Eyebrow>
            <h2 className="display mt-5 max-w-[14ch] text-[clamp(1.6rem,3.4vw,2.4rem)]">
              Every donation goes to one address.
            </h2>
          </div>
          <div>
            <p className="max-w-[58ch] text-[14.5px] leading-relaxed text-ink-2">
              The reforestation share is sent to the public crypto donation
              address published by{" "}
              <a
                href={PARTNER.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline underline-offset-4 hover:text-moss"
              >
                One Tree Planted
              </a>
              , a US 501(c)(3) reforestation non-profit. Sending to a public
              donation address is the whole of the relationship: the
              organisation has not reviewed, approved or endorsed this project,
              and receives nothing from us other than the donation.
            </p>

            <dl className="mt-8 border-t border-line">
              {[
                ["Organisation", PARTNER.name],
                ["Website", PARTNER.url.replace("https://", "")],
                ["Address published at", PARTNER.donateUrl.replace("https://", "")],
                ["Relationship", PARTNER.relationship],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-line py-3.5 text-[13px]"
                >
                  <dt className="text-ink-3">{k}</dt>
                  <dd className="text-right text-ink">{v}</dd>
                </div>
              ))}
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-3.5 text-[13px]">
                <dt className="text-ink-3">Donation address</dt>
                <dd>
                  <a
                    href={`${robinhoodChain.blockExplorers!.default.url}/address/${PARTNER.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono break-all text-[12px] text-ink underline underline-offset-4 hover:text-moss"
                  >
                    {PARTNER.address}
                  </a>
                </dd>
              </div>
            </dl>

            <p className="mt-4 max-w-[64ch] text-[12px] leading-relaxed text-ink-3">
              The address is the one published on{" "}
              <a
                href={PARTNER.donateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-2 underline underline-offset-4 hover:text-moss"
              >
                One Tree Planted&rsquo;s crypto donation page
              </a>
              . Check it there yourself before relying on it: transfers cannot
              be reversed, and the contract bakes the recipient in permanently.
            </p>
          </div>
        </div>
      </Section>

      {/* ── donations ───────────────────────────────────── */}
      <section className="border-y border-line bg-paper-2 px-5 py-20 md:px-8">
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Donations</Eyebrow>
              <h2 className="display mt-5 text-[clamp(1.8rem,4vw,2.8rem)]">
                Transactions, in order.
              </h2>
            </div>
            <span className="text-[12.5px] text-ink-3">
              {DONATIONS.length} batches · {MINT.chain}
            </span>
          </div>

          {DONATIONS.length === 0 && (
            <p className="mt-8 max-w-[56ch] text-[14px] leading-relaxed text-ink-2">
              No donation has been made. The first batch will appear here with
              its transaction hash, amount and destination project on the day it
              settles.
            </p>
          )}

          <div hidden={DONATIONS.length === 0} className="mt-10 overflow-x-auto">
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
            A dash in the final column means the funds have been sent but no
            partner report has been filed. It is neither a zero nor an estimate.
            The field stays empty until a document supports it.
          </p>
        </div>
      </section>

      {/* ── projects ────────────────────────────────────── */}
      <Section className="py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Projects</Eyebrow>
            <h2 className="display mt-5 max-w-[16ch] text-[clamp(1.8rem,4vw,2.8rem)]">
              Named planting sites.
            </h2>
          </div>
          <span className="text-[12.5px] text-ink-3">{PROJECTS.length} sites</span>
        </div>

        {PROJECTS.length === 0 && (
          <p className="mt-8 max-w-[56ch] text-[14px] leading-relaxed text-ink-2">
            No project is registered. Sites are added here once a partner has
            confirmed the location, area and planting window in writing.
          </p>
        )}

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
              How a figure reaches this page.
            </h2>
          </div>
          <ol className="flex flex-col">
            {[
              ["Mint settles", "The reforestation share accumulates in a dedicated address. No claim is made at this stage."],
              ["Batch is sent", "Once the balance clears the partner's minimum it is sent in a single transaction. The hash is published the same day, before any allocation is known."],
              ["Partner allocates", "The partner names the site and planting window in writing. That confirmation moves the affected tokens to Young Tree."],
              ["Report is filed", "A dated report with counts and site photographs. Only then does a tree count appear in the table above and the tokens reach Mature."],
              ["Records are not back-filled", "If a report never arrives, the row keeps its dash permanently. Figures are not estimated and batches are not removed."],
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

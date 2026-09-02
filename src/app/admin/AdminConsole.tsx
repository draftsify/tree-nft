"use client";

import { useState } from "react";
import { Button, Eyebrow, Hash, Provisional, Section, StatusDot } from "@/components/ui";
import { DONATIONS, PROJECTS, STAGES, type ImpactStatus } from "@/lib/data";

/**
 * The internal side of the impact system, shown publicly on purpose: if the
 * verification step is a black box, the ledger is worth nothing. Every control
 * here is inert — the form validates and previews, then stops.
 */

const NEXT_STATUS: Partial<Record<ImpactStatus, ImpactStatus>> = {
  pending: "funded",
  funded: "allocated",
  allocated: "planted",
  planted: "verified",
};

export default function AdminConsole() {
  const [batch, setBatch] = useState(DONATIONS[0].id);
  const [project, setProject] = useState(PROJECTS[0].id);
  const [trees, setTrees] = useState("");
  const [date, setDate] = useState("");
  const [evidence, setEvidence] = useState("");
  const [preview, setPreview] = useState(false);

  const selected = DONATIONS.find((d) => d.id === batch)!;
  const next = NEXT_STATUS[selected.status];
  const affected = 180 + selected.amountUsd / 24;

  const complete = trees.trim() !== "" && date.trim() !== "" && evidence.trim() !== "";

  return (
    <>
      <Section className="pb-12 pt-36 md:pt-44">
        <div className="flex items-center gap-3">
          <Eyebrow>Verification console</Eyebrow>
          <Provisional>Read-only demo</Provisional>
        </div>
        <h1 className="display mt-6 max-w-[16ch] text-[clamp(2.2rem,5.4vw,4rem)]">
          The step everyone else keeps private.
        </h1>
        <p className="mt-6 max-w-[58ch] text-[15px] leading-relaxed text-ink-2">
          This is how a partner report becomes a stage change. It is published
          because a transparency claim that hides its own review process is not
          a transparency claim. Nothing here writes anything.
        </p>
      </Section>

      <Section className="pb-24">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          {/* ── form ─────────────────────────────────── */}
          <div className="border-t border-line pt-6">
            <h2 className="display text-[22px]">File a partner report</h2>

            <div className="mt-7 flex flex-col gap-5">
              <Field label="Donation batch" hint="Only batches with a settled transaction appear here.">
                <select
                  value={batch}
                  onChange={(e) => {
                    setBatch(e.target.value);
                    setPreview(false);
                  }}
                  className="h-11 w-full rounded-[12px] border border-line bg-paper px-3 text-[14px] text-ink outline-none focus:border-line-2"
                >
                  {DONATIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.id} — {d.date} — ${d.amountUsd.toLocaleString("en-US")}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Planting project" hint="Must already exist in the project register.">
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="h-11 w-full rounded-[12px] border border-line bg-paper px-3 text-[14px] text-ink outline-none focus:border-line-2"
                >
                  {PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.name}, {p.country}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Trees confirmed planted" hint="From the report. Never an estimate.">
                  <input
                    inputMode="numeric"
                    value={trees}
                    onChange={(e) => setTrees(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="1980"
                    className="h-11 w-full rounded-[12px] border border-line bg-paper px-3 text-[14px] text-ink outline-none placeholder:text-ink-3/60 focus:border-line-2"
                  />
                </Field>
                <Field label="Report date" hint="The date on the document, not today.">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11 w-full rounded-[12px] border border-line bg-paper px-3 text-[14px] text-ink outline-none focus:border-line-2"
                  />
                </Field>
              </div>

              <Field
                label="Evidence reference"
                hint="A permanent link — the report is pinned, not hosted on our own server."
              >
                <input
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="ar://… or ipfs://…"
                  className="h-11 w-full rounded-[12px] border border-line bg-paper px-3 text-[14px] text-ink outline-none placeholder:text-ink-3/60 focus:border-line-2"
                />
              </Field>

              <div className="border-t border-line pt-4">
                <p className="text-[12.5px] leading-relaxed text-ink-2">
                  Filing this would advance{" "}
                  <span className="num text-ink">{Math.round(affected)}</span> tokens
                  from{" "}
                  <span className="text-ink">
                    {STAGES.find((s) => s.id === stageFor(selected.status))?.label}
                  </span>{" "}
                  to{" "}
                  <span className="text-ink">
                    {next ? STAGES.find((s) => s.id === stageFor(next))?.label : "—"}
                  </span>
                  , and write a new metadata version for each of them. The
                  previous version stays readable.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button disabled={!complete} onClick={() => setPreview(true)}>
                  Preview the write
                </Button>
                <Button variant="outline" disabled>
                  Sign &amp; submit
                </Button>
                <span className="text-[11.5px] text-ink-3">
                  Submission needs 2 of 3 multisig signers.
                </span>
              </div>
            </div>
          </div>

          {/* ── batch detail + preview ───────────────── */}
          <div className="flex flex-col gap-4">
            <div className="border-t border-line pt-6">
              <div className="flex items-center justify-between gap-3">
                <Eyebrow>Selected batch</Eyebrow>
                <StatusDot status={selected.status} />
              </div>
              <dl className="mt-5 flex flex-col gap-3 text-[13px]">
                {[
                  ["Batch", selected.id],
                  ["Sent", selected.date],
                  ["Amount", `$${selected.amountUsd.toLocaleString("en-US")} · ${selected.amountAsset}`],
                  ["Chain", selected.chain],
                  ["Region", selected.region],
                  ["Partner", selected.partner],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-line pb-3 last:border-0">
                    <dt className="text-ink-3">{k}</dt>
                    <dd className="text-right text-ink">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-3">Transaction</dt>
                  <dd>
                    <Hash value={selected.txHash} />
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex-1 border-t border-line pt-6">
              <Eyebrow>Metadata diff</Eyebrow>
              {preview && complete ? (
                <pre className="mono mt-4 overflow-x-auto rounded-[14px] bg-deep p-4 text-[11.5px] leading-relaxed text-paper/80">
{`{
  "tokenId": "00421",
  "version": 3,
  "attributes": {
`}<span className="text-paper/35">{`    "species": "Sakura",        // frozen
    "rarity": "Rare",           // frozen
`}</span>{`-   "stage": "${STAGES.find((s) => s.id === stageFor(selected.status))?.label}",
+   "stage": "${next ? STAGES.find((s) => s.id === stageFor(next))?.label : "—"}"
  },
  "impact": {
+   "project": "${project}",
+   "treesReported": ${trees || 0},
+   "reportDate": "${date}",
+   "evidence": "${evidence}"
  },
  "supersedes": "ar://…v2"
}`}
                </pre>
              ) : (
                <p className="mt-4 max-w-[42ch] text-[13px] leading-relaxed text-ink-3">
                  Fill the three report fields and preview to see exactly which
                  keys change. Frozen attributes are shown greyed so a reviewer
                  can confirm the write touches nothing it shouldn&rsquo;t.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── rules ──────────────────────────────────── */}
        <div className="mt-14 grid border-t border-line md:grid-cols-3">
          {[
            ["No back-dating", "The report date comes from the document. If a partner sends a report late, the row shows both dates rather than the flattering one."],
            ["No partial credit", "A batch is either reported or it isn't. Nothing is pro-rated to make a quarter look better."],
            ["No silent edits", "Every write is a new version with a pointer to the one it supersedes. Corrections are visible as corrections."],
          ].map(([h, p]) => (
            <div key={h} className="border-b border-line py-6 pr-8">
              <h3 className="text-[14.5px] font-medium text-ink">{h}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{p}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function stageFor(status: ImpactStatus) {
  return {
    pending: "seed",
    funded: "sapling",
    allocated: "young",
    planted: "young",
    verified: "mature",
  }[status];
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <div className="mt-2">{children}</div>
      <span className="mt-1.5 block text-[11.5px] leading-relaxed text-ink-3">{hint}</span>
    </label>
  );
}

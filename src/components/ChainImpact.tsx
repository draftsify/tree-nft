"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { Eyebrow, Provisional } from "@/components/ui";
import { explorerToken } from "@/lib/chain";
import {
  CONTRACT_ADDRESS,
  isDeployed,
  readChainState,
  type ChainState,
} from "@/lib/contract";
import { PARTNER, PAYMENT, STAGES } from "@/lib/data";

/**
 * The live figures, read from the contract rather than from a database.
 *
 * `totalDonated` is the contract's own running total of what it has forwarded,
 * so this block cannot overstate: it is the same number anyone gets by calling
 * the contract themselves, and the explorer link next to it is how they check.
 */
export default function ChainImpact() {
  const [chain, setChain] = useState<ChainState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isDeployed) return;
    readChainState()
      .then(setChain)
      .catch(() => setFailed(true));
  }, []);

  if (!isDeployed) {
    return (
      <div className="border-t border-line pt-10">
        <div className="flex items-center gap-3">
          <Eyebrow>Live from the contract</Eyebrow>
          <Provisional>Not deployed</Provisional>
        </div>
        <p className="mt-4 max-w-[58ch] text-[14px] leading-relaxed text-ink-2">
          Once the collection is deployed this block reads the contract
          directly: tokens minted, the total it has forwarded to{" "}
          {PARTNER.name}, and the stage that total has unlocked. Nothing here
          will come from a database, so there is nothing for us to overstate.
        </p>
      </div>
    );
  }

  const stage = chain ? STAGES[chain.stage - 1] : null;

  return (
    <div className="border-t border-line pt-10">
      <div className="flex flex-wrap items-center gap-3">
        <Eyebrow>Live from the contract</Eyebrow>
        <a
          href={`${explorerToken(CONTRACT_ADDRESS as string, 1).split("/instance")[0]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-[11px] text-ink-3 underline underline-offset-4 hover:text-moss"
        >
          {CONTRACT_ADDRESS}
        </a>
      </div>

      {failed && (
        <p className="mt-4 text-[13px] text-ink-3">
          The contract could not be reached just now. That is an RPC problem,
          not a missing figure: the values are on-chain either way.
        </p>
      )}

      {chain && (
        <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              v: chain.totalSupply.toLocaleString("en-US"),
              l: "minted",
              s: `of ${chain.maxSupply.toLocaleString("en-US")}`,
            },
            {
              v: `${Math.round(Number(formatUnits(chain.totalDonated, PAYMENT.decimals))).toLocaleString("en-US")} ${PAYMENT.symbol}`,
              l: `forwarded to ${PARTNER.name}`,
              s: "Sent inside each minting transaction",
            },
            {
              v: stage ? stage.label : "—",
              l: `stage ${chain.stage} of 4`,
              s: stage ? stage.unlock : "",
            },
            {
              v:
                chain.toNextStage === BigInt(0)
                  ? "—"
                  : `${Math.round(Number(formatUnits(chain.toNextStage, PAYMENT.decimals))).toLocaleString("en-US")} ${PAYMENT.symbol}`,
              l: "to the next stage",
              s: chain.toNextStage === BigInt(0) ? "Final stage reached" : "Remaining",
            },
          ].map((s) => (
            <div key={s.l}>
              <div className="display text-[clamp(1.6rem,3vw,2.2rem)]">{s.v}</div>
              <div className="mt-2 text-[13px] font-medium text-ink">{s.l}</div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">{s.s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

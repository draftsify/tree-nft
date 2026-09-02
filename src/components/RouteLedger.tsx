"use client";

import { useEffect, useState } from "react";
import { formatEther, formatUnits } from "viem";
import { Eyebrow, Provisional } from "@/components/ui";
import { explorerTx } from "@/lib/chain";
import {
  hasReserve,
  RESERVE_ADDRESS,
  readReserveState,
  readRouteEvents,
  type ReserveState,
  type RouteEvent,
} from "@/lib/contract";
import { PARTNER, PAYMENT } from "@/lib/data";

/**
 * The route as the chain recorded it.
 *
 * Every row here exists because a transaction happened, and carries the hash of
 * that transaction. Nothing is entered by hand, so there is no version of this
 * page where a step is claimed and did not occur. An empty ledger means the
 * reserve has not moved yet, which is a fact rather than an omission.
 */
export default function RouteLedger() {
  const [rows, setRows] = useState<RouteEvent[] | null>(null);
  const [state, setState] = useState<ReserveState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasReserve) return;
    Promise.all([readRouteEvents(), readReserveState()])
      .then(([r, s]) => {
        setRows(r);
        setState(s);
      })
      .catch(() => setFailed(true));
  }, []);

  if (!hasReserve) {
    return (
      <div className="border-t border-line pt-10">
        <div className="flex items-center gap-3">
          <Eyebrow>The ledger</Eyebrow>
          <Provisional>Not deployed</Provisional>
        </div>
        <p className="mt-4 max-w-[62ch] text-[14px] leading-relaxed text-ink-2">
          Once the reserve is deployed, every swap and every bridge appears here
          on its own, read from the contract&apos;s logs with the hash of the
          transaction that produced it. No step can be listed here without
          having happened, and none of it is entered by us.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-line pt-10">
      <div className="flex flex-wrap items-center gap-3">
        <Eyebrow>The ledger</Eyebrow>
        <span className="mono text-[11px] text-ink-3">{RESERVE_ADDRESS}</span>
      </div>

      {failed && (
        <p className="mt-4 text-[13px] text-ink-3">
          The reserve could not be reached just now. That is an RPC problem, not
          an empty ledger: the events are on-chain either way.
        </p>
      )}

      {state && (
        <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              v: `${Number(formatUnits(state.pendingTokens, PAYMENT.decimals)).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${PAYMENT.symbol}`,
              l: "waiting to be sold",
              s: "Anyone can trigger the sale",
            },
            {
              v: `${Number(formatEther(state.pendingEth)).toFixed(4)} ETH`,
              l: "waiting to be bridged",
              s: "Anyone can trigger the bridge",
            },
            {
              v: `${Number(formatEther(state.totalSwapped)).toFixed(4)} ETH`,
              l: "raised from sales",
              s: "Cumulative, read from the reserve",
            },
            {
              v: `${Number(formatEther(state.totalBridged)).toFixed(4)} ETH`,
              l: `on its way to ${PARTNER.name}`,
              s: "Addressed at the moment it was sent",
            },
          ].map((s) => (
            <div key={s.l}>
              <div className="display text-[clamp(1.4rem,2.6vw,1.9rem)]">{s.v}</div>
              <div className="mt-2 text-[13px] font-medium text-ink">{s.l}</div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">{s.s}</p>
            </div>
          ))}
        </div>
      )}

      {rows && rows.length === 0 && (
        <p className="mt-6 text-[13.5px] leading-relaxed text-ink-2">
          Nothing has moved yet. The reserve exists and its balance is readable
          above; the first row appears the first time anyone calls the sale.
        </p>
      )}

      {rows && rows.length > 0 && (
        <ol className="mt-8 border-t border-line">
          {rows.map((r) => (
            <li
              key={r.hash}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line py-4"
            >
              <div className="min-w-0">
                <span className="text-[14px] font-medium text-ink">
                  {r.kind === "swap" ? "Sold for ETH" : "Bridged to Ethereum"}
                </span>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">
                  {r.kind === "swap"
                    ? `${Number(formatUnits(r.amountIn, PAYMENT.decimals)).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${PAYMENT.symbol} for ${Number(formatEther(r.amountOut ?? BigInt(0))).toFixed(4)} ETH`
                    : `${Number(formatEther(r.amountIn)).toFixed(4)} ETH addressed to ${r.destination}`}
                </p>
              </div>
              <a
                href={explorerTx(r.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="mono shrink-0 text-[11px] text-ink-3 underline underline-offset-4 hover:text-moss"
              >
                {r.hash.slice(0, 10)}…{r.hash.slice(-8)}
              </a>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-6 max-w-[80ch] text-[12.5px] leading-relaxed text-ink-3">
        A bridged amount is not a delivered one. Robinhood Chain settles to
        Ethereum through a challenge period of about a week, so ETH shown as on
        its way stays that way until the withdrawal is completed on Ethereum.
        Anyone can complete it, and it can only land at the address it was
        given when it left.
      </p>
    </div>
  );
}

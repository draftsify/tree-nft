import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { RARITIES, STAGES, type ImpactStatus, type Rarity, type StageId } from "@/lib/data";

/* ── buttons ──────────────────────────────────────────── */

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-[13px] font-medium tracking-[-0.01em] transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none";

const variants = {
  solid: "bg-ink text-paper hover:bg-moss",
  outline: "border border-line-2 text-ink hover:border-ink hover:bg-white",
  ghost: "text-ink-2 hover:text-ink",
  light: "bg-white border border-line text-ink hover:border-line-2",
} as const;

const sizes = {
  sm: "h-9 px-4",
  md: "h-11 px-6",
  lg: "h-14 px-8 text-[14px]",
} as const;

export function Button({
  variant = "solid",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <Link
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}

/* ── badges ───────────────────────────────────────────── */

export function RarityBadge({ rarity, className = "" }: { rarity: Rarity; className?: string }) {
  const r = RARITIES.find((x) => x.id === rarity)!;
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.02em] ${className}`}
      style={{ background: r.tint, color: r.text }}
    >
      {rarity}
    </span>
  );
}

export function StageBadge({ stage, className = "" }: { stage: StageId; className?: string }) {
  const s = STAGES.find((x) => x.id === stage)!;
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-full border border-line bg-white px-2.5 text-[11px] font-medium text-ink-2 ${className}`}
    >
      <span aria-hidden>{s.glyph}</span>
      {s.label}
    </span>
  );
}

const STATUS_COPY: Record<ImpactStatus, { label: string; dot: string }> = {
  pending: { label: "Awaiting donation", dot: "#c9c4b6" },
  funded: { label: "Donation sent", dot: "#a9b8a2" },
  allocated: { label: "Allocated to site", dot: "#7f9a76" },
  planted: { label: "Planted", dot: "#5b7150" },
  verified: { label: "Verified", dot: "#3d5a34" },
};

export function StatusDot({ status, className = "" }: { status: ImpactStatus; className?: string }) {
  const s = STATUS_COPY[status];
  return (
    <span className={`inline-flex items-center gap-2 text-[12px] text-ink-2 ${className}`}>
      <span className="size-[7px] rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

/* ── layout helpers ───────────────────────────────────── */

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-5 md:px-8 ${className}`}>
      <div className="mx-auto w-full max-w-[1240px]">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

export function Stat({
  value,
  label,
  sub,
}: {
  value: ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <div>
      <div className="display text-[clamp(2rem,4.4vw,3.4rem)] text-ink">{value}</div>
      <div className="mt-2 text-[13px] font-medium text-ink">{label}</div>
      {sub && <div className="mt-1 text-[13px] leading-relaxed text-ink-3">{sub}</div>}
    </div>
  );
}

/**
 * Used anywhere the page shows a figure that isn't yet backed by a signed
 * agreement or a live indexer. Better a visible label than a quiet lie — it
 * just doesn't need a chip around it to be read.
 */
export function Provisional({ children = "Placeholder data" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-3">
      <span aria-hidden className="text-line-2">
        ·
      </span>
      {children}
    </span>
  );
}

export function Hash({ value }: { value: string }) {
  return (
    <span className="mono text-[12px] text-ink-3" title={value}>
      {value.slice(0, 10)}…{value.slice(-8)}
    </span>
  );
}

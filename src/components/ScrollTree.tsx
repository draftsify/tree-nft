"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { preload } from "react-dom";

/**
 * The photograph is cut into vertical strips and each strip drifts a little
 * differently as the page moves. It stays one tree — the offsets are small
 * enough that the silhouette holds — but the canopy breathes the way a real one
 * does, and the seam gives a still image something to do while you scroll.
 *
 * Strip geometry is computed in whole pixels from the measured width. Doing it
 * in percentages leaves sub-pixel gaps that render as pale vertical lines
 * across the canopy.
 */

const STRIPS = 16;
const ASPECT = 1696 / 1669;
const DRIFT_PX = 14;

export function SlicedTree({
  src = "/tree/tree.webp",
  drift,
  className = "",
  priority = false,
}: {
  src?: string;
  /** 0 → strips aligned, 1 → maximum drift. */
  drift: number;
  className?: string;
  priority?: boolean;
}) {
  // One fetch shared by every strip; the hero copy jumps the queue.
  preload(src, { as: "image", fetchPriority: priority ? "high" : "auto" });

  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const edges = Array.from({ length: STRIPS + 1 }, (_, i) =>
    Math.round((i * width) / STRIPS),
  );

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: String(ASPECT) }}
    >
      {width === 0 ? (
        // Before measurement (and for anyone without JS) show the whole image.
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${src})` }}
        />
      ) : (
        Array.from({ length: STRIPS }, (_, i) => {
          // A slow wave across the strips plus a little noise, so it never
          // reads as a mechanical sine.
          const wave = Math.sin((i / STRIPS) * Math.PI * 1.6 + 0.4);
          const noise = Math.sin(i * 12.9898) * 0.35;
          const left = edges[i];
          const last = i === STRIPS - 1;
          return (
            <div
              key={i}
              className="absolute top-0 h-full will-change-transform"
              style={{
                left,
                // 1px of overlap hides the seam once the strips move apart.
                width: edges[i + 1] - left + (last ? 0 : 1),
                transform: `translate3d(0, ${(wave + noise) * drift * DRIFT_PX}px, 0)`,
                backgroundImage: `url(${src})`,
                backgroundSize: `${width}px 100%`,
                backgroundPosition: `${-left}px 0`,
                backgroundRepeat: "no-repeat",
              }}
            />
          );
        })
      )}
    </div>
  );
}

/* ── hero: the tree pushes past the frame as you leave ── */

export function HeroTree() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.6 });

  const scale = useTransform(p, [0, 1], [1, 1.24]);
  const y = useTransform(p, [0, 1], ["0%", "10%"]);
  const opacity = useTransform(p, [0, 0.7, 1], [1, 1, 0.2]);
  const driftMv = useTransform(p, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      <motion.div
        style={{ scale, y, opacity, transformOrigin: "70% 100%" }}
        className="absolute bottom-[2%] right-[-18%] h-[44%] sm:right-[-10%] sm:h-[56%] lg:bottom-[4%] lg:right-[-3%] lg:h-[78%]"
      >
        <DriftBridge value={driftMv}>
          {(d) => <SlicedTree drift={d} priority className="h-full" />}
        </DriftBridge>
      </motion.div>
    </div>
  );
}

/* ── growth: four stages resolved by scroll ───────────── */

export function GrowthTree({
  stages,
}: {
  stages: { label: string; glyph: string; blurb: string; unlock: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 180, damping: 38, mass: 0.7 });

  // Growth is carried by scale, from a seedling standing on the line to the
  // full crown. A light top-clip on the first stretch keeps the very smallest
  // state from reading as a shrunken adult tree.
  const scale = useTransform(p, [0, 1], [0.11, 1]);
  const clipTop = useTransform(p, [0, 0.34], [34, 0]);
  const clipPath = useTransform(clipTop, (v) => `inset(${v}% 0% 0% 0%)`);
  const drift = useTransform(p, [0, 1], [1, 0]);
  const shadow = useTransform(p, [0, 1], [0.12, 1]);

  return (
    <div ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="relative h-full">
          <StageHeadline progress={p} stages={stages} />

          <div className="absolute inset-x-0 bottom-[30vh] h-px bg-line" />

          <motion.div
            style={{ scale, transformOrigin: "50% 100%" }}
            className="absolute bottom-[30vh] left-1/2 h-[48vh] -translate-x-1/2"
          >
            <motion.div style={{ clipPath }} className="h-full">
              <DriftBridge value={drift}>
                {(d) => <SlicedTree drift={d} className="h-full" />}
              </DriftBridge>
            </motion.div>
          </motion.div>

          {/* cast shadow, so the tree sits on the line instead of floating */}
          <motion.div
            style={{ scaleX: shadow, opacity: shadow }}
            className="absolute bottom-[29.4vh] left-1/2 h-3 w-[min(420px,54vw)] -translate-x-1/2 rounded-[50%] bg-ink/[0.08] blur-md"
          />

          <StageLabels progress={p} stages={stages} />
        </div>
      </div>
    </div>
  );
}

/**
 * The pinned frame needs to say what it is once the section heading has
 * scrolled off. Stage name on the left, the milestone that unlocks it on the
 * right, both swapped by scroll position.
 */
function StageHeadline({
  progress,
  stages,
}: {
  progress: MotionValue<number>;
  stages: { label: string; glyph: string; blurb: string; unlock: string }[];
}) {
  const total = stages.length;
  return (
    <div className="absolute inset-x-0 top-0 px-5 pt-24 md:px-8 md:pt-28">
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-baseline justify-between gap-4">
        <div className="relative h-[clamp(2.6rem,6vw,4.6rem)] flex-1">
          {stages.map((s, i) => {
            const start = i / total;
            return (
              <StageWord
                key={s.label}
                progress={progress}
                from={start}
                to={start + 1 / total}
              >
                {s.label}
              </StageWord>
            );
          })}
        </div>
        <div className="num text-[12px] text-ink-3">
          <StageCounter progress={progress} total={total} /> / 0{total}
        </div>
      </div>
    </div>
  );
}

function StageWord({
  progress,
  from,
  to,
  children,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  children: string;
}) {
  const span = to - from;
  const opacity = useTransform(
    progress,
    [from - span * 0.35, from + span * 0.15, to - span * 0.15, to + span * 0.35],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [from - span * 0.35, from + span * 0.15],
    [14, 0],
  );
  return (
    <motion.span
      style={{ opacity, y }}
      className="display absolute inset-x-0 top-0 text-[clamp(2.2rem,5.4vw,4.2rem)]"
    >
      {children}
    </motion.span>
  );
}

function StageCounter({
  progress,
  total,
}: {
  progress: MotionValue<number>;
  total: number;
}) {
  const [n, setN] = useState(1);
  useMotionValueEvent(progress, "change", (latest) => {
    const next = Math.min(total, Math.max(1, Math.floor(latest * total) + 1));
    setN((prev) => (prev === next ? prev : next));
  });
  return <>0{n}</>;
}

function StageLabels({
  progress,
  stages,
}: {
  progress: MotionValue<number>;
  stages: { label: string; glyph: string; blurb: string; unlock: string }[];
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 px-5 pb-8 md:px-8">
      <div className="mx-auto grid w-full max-w-[1240px] gap-2.5 md:grid-cols-4">
        {stages.map((s, i) => (
          <StageCard
            key={s.label}
            progress={progress}
            index={i}
            total={stages.length}
            stage={s}
          />
        ))}
      </div>
    </div>
  );
}

function StageCard({
  progress,
  index,
  total,
  stage,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  stage: { label: string; glyph: string; blurb: string; unlock: string };
}) {
  const start = index / total;
  const opacity = useTransform(
    progress,
    [start - 0.14, start + 0.02, start + 1 / total, start + 1 / total + 0.16],
    [0.3, 1, 1, 0.3],
  );
  const yy = useTransform(progress, [start - 0.14, start + 0.02], [8, 0]);

  return (
    <motion.div
      style={{ opacity, y: yy }}
      className="rounded-[16px] border border-line bg-white/85 p-4 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        <span className="text-[15px]" aria-hidden>
          {stage.glyph}
        </span>
        <span className="text-[13px] font-medium text-ink">{stage.label}</span>
        <span className="num ml-auto text-[11px] text-ink-3">0{index + 1}</span>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{stage.blurb}</p>
      <p className="mt-2.5 border-t border-line pt-2 text-[11px] uppercase tracking-[0.08em] text-ink-3">
        {stage.unlock}
      </p>
    </motion.div>
  );
}

/* ── plumbing ─────────────────────────────────────────── */

/**
 * SlicedTree needs a plain number to lay the strips out, but the scroll value
 * is a MotionValue. This subscribes once and re-renders the strips only when
 * the rounded value actually changes.
 */
function DriftBridge({
  value,
  children,
}: {
  value: MotionValue<number>;
  children: (v: number) => ReactElement;
}) {
  const [v, setV] = useState(0);
  useMotionValueEvent(value, "change", (latest) => {
    const rounded = Math.round(latest * 40) / 40;
    setV((prev) => (prev === rounded ? prev : rounded));
  });
  return children(v);
}

"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { preload } from "react-dom";

/**
 * The photograph is cut into vertical strips and each strip drifts a little
 * differently as the page moves. It stays one tree — the offsets are small
 * enough that the silhouette holds — but the canopy breathes the way a real one
 * does, and the seam gives a still image something to do while you scroll.
 *
 * Two things keep it smooth:
 *
 * - Strip geometry is in whole pixels from the measured width. Percentages
 *   leave sub-pixel gaps that render as pale vertical lines across the canopy.
 * - The drift is a MotionValue per strip, so scrolling writes transforms
 *   straight to the DOM. Passing a plain number would re-render sixteen nodes
 *   on every scroll tick, which is what made the entrance stutter.
 */

const STRIPS = 16;
const ASPECT = 1696 / 1669;
const DRIFT_PX = 14;

/** Measure before paint on the client so the strips are there on frame one. */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function SlicedTree({
  src = "/tree/tree.webp",
  drift,
  className = "",
  priority = false,
}: {
  src?: string;
  /** 0 → strips aligned, 1 → maximum drift. */
  drift: MotionValue<number>;
  className?: string;
  priority?: boolean;
}) {
  // One fetch shared by every strip; the hero copy jumps the queue.
  preload(src, { as: "image", fetchPriority: priority ? "high" : "auto" });

  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.round(el.getBoundingClientRect().width));
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
        // Server render, and anyone without JS: the whole image, undivided.
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${src})` }}
        />
      ) : (
        Array.from({ length: STRIPS }, (_, i) => (
          <Strip
            key={i}
            index={i}
            left={edges[i]}
            // 1px of overlap hides the seam once the strips move apart.
            width={edges[i + 1] - edges[i] + (i === STRIPS - 1 ? 0 : 1)}
            containerWidth={width}
            src={src}
            drift={drift}
          />
        ))
      )}
    </div>
  );
}

function Strip({
  index,
  left,
  width,
  containerWidth,
  src,
  drift,
}: {
  index: number;
  left: number;
  width: number;
  containerWidth: number;
  src: string;
  drift: MotionValue<number>;
}) {
  // A slow wave across the strips plus a little noise, so it never reads as a
  // mechanical sine.
  const wave = Math.sin((index / STRIPS) * Math.PI * 1.6 + 0.4);
  const noise = Math.sin(index * 12.9898) * 0.35;
  const amplitude = (wave + noise) * DRIFT_PX;
  const y = useTransform(drift, (d) => d * amplitude);

  return (
    <motion.div
      className="absolute top-0 h-full"
      style={{
        y,
        left,
        width,
        backgroundImage: `url(${src})`,
        backgroundSize: `${containerWidth}px 100%`,
        backgroundPosition: `${-left}px 0`,
        backgroundRepeat: "no-repeat",
      }}
    />
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
  const drift = useTransform(p, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      <motion.div
        style={{ scale, y, opacity, transformOrigin: "70% 100%" }}
        className="absolute bottom-[2%] right-[-18%] h-[44%] sm:right-[-10%] sm:h-[56%] lg:bottom-[4%] lg:right-[-3%] lg:h-[78%]"
      >
        <SlicedTree drift={drift} priority className="h-full" />
      </motion.div>
    </div>
  );
}

/* ── growth: four stages resolved by scroll ───────────── */

type Stage = { label: string; blurb: string; unlock: string };

export function GrowthTree({ stages }: { stages: Stage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 180, damping: 38, mass: 0.7 });

  // Growth is carried by scale alone. It starts at roughly the size the third
  // stage used to reach: any smaller and the crown reads as truncated rather
  // than young.
  const scale = useTransform(p, [0, 1], [0.58, 1]);
  const drift = useTransform(p, [0, 1], [1, 0]);
  const shadow = useTransform(p, [0, 1], [0.58, 1]);

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
            <SlicedTree drift={drift} className="h-full" />
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
 * scrolled off. Stage name on the left, the count on the right, both swapped
 * by scroll position.
 */
function StageHeadline({
  progress,
  stages,
}: {
  progress: MotionValue<number>;
  stages: Stage[];
}) {
  const total = stages.length;
  return (
    <div className="absolute inset-x-0 top-0 px-5 pt-24 md:px-8 md:pt-28">
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-baseline justify-between gap-4">
        <div className="relative h-[clamp(2.6rem,6vw,4.6rem)] flex-1">
          {stages.map((s, i) => (
            <StageWord
              key={s.label}
              progress={progress}
              from={i / total}
              to={(i + 1) / total}
            >
              {s.label}
            </StageWord>
          ))}
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
    [from - span * 0.3, from + span * 0.12, to - span * 0.12, to + span * 0.3],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [from - span * 0.3, from + span * 0.12],
    [14, 0],
  );
  const filter = useTransform(
    progress,
    [from - span * 0.3, from + span * 0.12, to - span * 0.12, to + span * 0.3],
    ["blur(10px)", "blur(0px)", "blur(0px)", "blur(10px)"],
  );
  return (
    <motion.span
      style={{ opacity, y, filter }}
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
  stages: Stage[];
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-8">
      <div className="mx-auto grid w-full max-w-[1240px] gap-x-8 gap-y-6 md:grid-cols-4">
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
  stage: Stage;
}) {
  const start = index / total;
  const opacity = useTransform(
    progress,
    [start - 0.14, start + 0.02, start + 1 / total, start + 1 / total + 0.16],
    [0.32, 1, 1, 0.32],
  );
  const y = useTransform(progress, [start - 0.14, start + 0.02], [8, 0]);

  return (
    <motion.div style={{ opacity, y }} className="border-t border-line pt-3.5">
      <div className="flex items-baseline gap-2">
        <span className="num text-[11px] text-ink-3">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[13px] font-medium text-ink">{stage.label}</span>
      </div>
      <p className="mt-2 max-w-[34ch] text-[12.5px] leading-relaxed text-ink-2">
        {stage.blurb}
      </p>
      <p className="mt-2.5 text-[11px] uppercase tracking-[0.08em] text-ink-3">
        {stage.unlock}
      </p>
    </motion.div>
  );
}

"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type ReactNode } from "react";

/* ── fade-up on enter ─────────────────────────────────── */

export function Reveal({
  children,
  delay = 0,
  y = 18,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── word-by-word, driven by scroll position ──────────── */

function Word({
  children,
  progress,
  from,
  to,
}: {
  children: string;
  progress: MotionValue<number>;
  from: number;
  to: number;
}) {
  const opacity = useTransform(progress, [from, to], [0.14, 1]);
  const y = useTransform(progress, [from, to], [10, 0]);
  return (
    <span className="inline-block overflow-hidden pb-[0.06em]">
      <motion.span style={{ opacity, y }} className="inline-block">
        {children}
      </motion.span>
    </span>
  );
}

/**
 * The signature move of the reference layout: a long statement that resolves
 * word by word as the block crosses the viewport, so reading speed is tied to
 * scroll speed rather than to a fixed timeline.
 */
export function ScrollWords({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.55"],
  });

  const words = text.split(" ");
  const step = 1 / words.length;

  return (
    <p ref={ref} className={`flex flex-wrap gap-x-[0.26em] gap-y-[0.06em] ${className}`}>
      {words.map((w, i) => (
        <Word
          key={`${w}-${i}`}
          progress={scrollYProgress}
          from={i * step}
          to={Math.min(1, i * step + step * 2.5)}
        >
          {w}
        </Word>
      ))}
    </p>
  );
}

/* ── a line that draws itself in ──────────────────────── */

export function DrawLine({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`h-px w-full origin-left bg-line ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

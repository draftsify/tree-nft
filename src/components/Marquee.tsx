"use client";

import type { ReactNode } from "react";

/**
 * Two identical tracks scrolling as one, so the loop has no seam. Duplicated in
 * the DOM rather than cloned in JS to keep it working before hydration.
 */
export default function Marquee({
  items,
  duration = 46,
  reverse = false,
  className = "",
  separator = "·",
}: {
  items: ReactNode[];
  duration?: number;
  reverse?: boolean;
  className?: string;
  separator?: string;
}) {
  const track = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === "b"}>
      {items.map((item, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span className="px-5 whitespace-nowrap">{item}</span>
          <span className="text-ink-3/50 select-none">{separator}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`relative flex overflow-hidden ${className}`}>
      <div
        className="marquee-track flex w-max"
        style={{
          ["--marquee-duration" as string]: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {track("a")}
        {track("b")}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-paper to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-paper to-transparent" />
    </div>
  );
}

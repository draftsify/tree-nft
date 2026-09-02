"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function Accordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-line">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="group flex w-full items-start gap-6 py-6 text-left"
            >
              <span className="num mt-1 w-8 shrink-0 text-[12px] text-ink-3">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="display flex-1 text-[clamp(1.05rem,2vw,1.5rem)] leading-[1.15] text-ink">
                {item.q}
              </span>
              <span
                className={`mt-1 grid size-7 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-transform duration-400 ${
                  isOpen ? "rotate-45 bg-ink text-paper" : "group-hover:border-line-2"
                }`}
                aria-hidden
              >
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[62ch] pb-7 pl-14 text-[14.5px] leading-relaxed text-ink-2">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import TreeCard from "@/components/TreeCard";
import { Section } from "@/components/ui";
import {
  RARITIES,
  SPECIES,
  type Rarity,
  type SpeciesId,
  type StageId,
  type Tree,
} from "@/lib/data";

type Sort = "id" | "rarity";

const RARITY_ORDER: Rarity[] = ["Legendary", "Epic", "Rare", "Uncommon", "Common"];

export default function CollectionBrowser({ trees }: { trees: Tree[] }) {
  const [species, setSpecies] = useState<SpeciesId | "all">("all");
  const [rarity, setRarity] = useState<Rarity | "all">("all");
  const [stage, setStage] = useState<StageId | "all">("all");
  const [sort, setSort] = useState<Sort>("id");

  const filtered = useMemo(() => {
    const out = trees.filter(
      (t) =>
        (species === "all" || t.species === species) &&
        (rarity === "all" || t.rarity === rarity) &&
        (stage === "all" || t.stage === stage),
    );
    if (sort === "rarity")
      return [...out].sort(
        (a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity),
      );
    return [...out].sort((a, b) => a.id - b.id);
  }, [trees, species, rarity, stage, sort]);

  const active = [species, rarity, stage].filter((v) => v !== "all").length;

  /** Changing this remounts the grid, which is what drives the crossfade. */
  const resultKey = `${species}-${rarity}-${stage}-${sort}`;

  return (
    <Section className="pb-28">
      {/* filter rail */}
      <div className="sticky top-[76px] z-30 mb-8 border-b border-line bg-paper/95 py-3.5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <FilterRow
            label="Species"
            value={species}
            onChange={setSpecies}
            options={SPECIES.map((s) => [s.id, s.name] as const)}
          />
          <FilterRow
            label="Rarity"
            value={rarity}
            onChange={setRarity}
            options={RARITIES.map((r) => [r.id, r.id] as const)}
          />
          <div className="ml-auto flex items-center gap-2">
            {active > 0 && (
              <button
                onClick={() => {
                  setSpecies("all");
                  setRarity("all");
                  setStage("all");
                }}
                className="rounded-full px-2.5 py-1.5 text-[12px] text-ink-3 underline-offset-4 hover:text-ink hover:underline"
              >
                Clear
              </button>
            )}
            <label className="sr-only" htmlFor="sort">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-8 rounded-full bg-paper-3 px-3 text-[12.5px] text-ink outline-none"
            >
              <option value="id">Token number</option>
              <option value="rarity">Rarity</option>
            </select>
          </div>
        </div>
      </div>

      <p className="mb-5 text-[13px] text-ink-3">
        Showing <span className="num text-ink">{filtered.length}</span> of{" "}
        <span className="num">{trees.length}</span> preview compositions. No
        tokens have been minted.
      </p>

      {/*
        The whole result set crossfades as one. Per-card layout animation was
        the wrong tool here: with a five-column grid, a card that survives a
        filter change slides across the page to its new slot while others are
        still fading out, which reads as the grid coming apart. Swapping the
        set wholesale is both calmer and cheaper.
      */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={resultKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {filtered.length === 0 ? (
            <div className="border-t border-line py-20 text-center">
              <p className="display text-[22px]">
                No tokens match this combination.
              </p>
              <p className="mx-auto mt-2 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-3">
                Some combinations do not exist by design. Baobab, for example,
                is never issued below Epic.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((t, i) => (
                <TreeCard key={t.id} tree={t} priority={i < 5} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}

function FilterRow<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | "all";
  onChange: (v: T | "all") => void;
  options: readonly (readonly [T, string])[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="eyebrow shrink-0">{label}</span>
      <div className="flex flex-wrap items-center gap-1">
        <Chip active={value === "all"} onClick={() => onChange("all")}>
          All
        </Chip>
        {options.map(([id, name]) => (
          <Chip key={id} active={value === id} onClick={() => onChange(id)}>
            {name}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-8 rounded-full px-3 text-[12.5px] transition-colors ${
        active
          ? "bg-ink text-paper"
          : "text-ink-3 hover:bg-paper-3 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

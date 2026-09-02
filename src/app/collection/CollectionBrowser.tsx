"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import TreeCard from "@/components/TreeCard";
import { Section } from "@/components/ui";
import {
  RARITIES,
  SPECIES,
  STAGES,
  type Rarity,
  type SpeciesId,
  type StageId,
  type Tree,
} from "@/lib/data";

type Sort = "recent" | "id" | "rarity";

const RARITY_ORDER: Rarity[] = ["Legendary", "Epic", "Rare", "Uncommon", "Common"];

export default function CollectionBrowser({ trees }: { trees: Tree[] }) {
  const [species, setSpecies] = useState<SpeciesId | "all">("all");
  const [rarity, setRarity] = useState<Rarity | "all">("all");
  const [stage, setStage] = useState<StageId | "all">("all");
  const [sort, setSort] = useState<Sort>("recent");

  const filtered = useMemo(() => {
    const out = trees.filter(
      (t) =>
        (species === "all" || t.species === species) &&
        (rarity === "all" || t.rarity === rarity) &&
        (stage === "all" || t.stage === stage),
    );
    if (sort === "id") return [...out].sort((a, b) => a.id - b.id);
    if (sort === "rarity")
      return [...out].sort(
        (a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity),
      );
    return [...out].sort((a, b) => b.mintedAt.localeCompare(a.mintedAt));
  }, [trees, species, rarity, stage, sort]);

  const active = [species, rarity, stage].filter((v) => v !== "all").length;

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
          <FilterRow
            label="Stage"
            value={stage}
            onChange={setStage}
            options={STAGES.map((s) => [s.id, s.label] as const)}
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
              className="h-8 rounded-full border border-line bg-white px-3 text-[12.5px] text-ink outline-none"
            >
              <option value="recent">Recently minted</option>
              <option value="id">Token number</option>
              <option value="rarity">Rarity</option>
            </select>
          </div>
        </div>
      </div>

      <p className="mb-5 text-[13px] text-ink-3">
        Showing{" "}
        <span className="num text-ink">{filtered.length}</span> of{" "}
        <span className="num">{trees.length}</span> sample tokens
      </p>

      <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <TreeCard tree={t} priority={i < 5} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="rounded-[20px] border border-dashed border-line-2 py-20 text-center">
          <p className="display text-[22px]">No tree matches that combination.</p>
          <p className="mt-2 text-[13.5px] text-ink-3">
            Some pairings don&rsquo;t exist by design — Baobab is never issued
            below Epic, for one.
          </p>
        </div>
      )}
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
          : "border border-line bg-white text-ink-2 hover:border-line-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

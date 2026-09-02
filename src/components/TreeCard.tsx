import Image from "next/image";
import Link from "next/link";
import { SPECIES, speciesImage, type Tree } from "@/lib/data";
import { RarityBadge, StageBadge } from "./ui";

export default function TreeCard({ tree, priority = false }: { tree: Tree; priority?: boolean }) {
  const species = SPECIES.find((s) => s.id === tree.species)!;

  return (
    <Link
      href={`/tree/${tree.id}`}
      className="group flex flex-col overflow-hidden rounded-[20px] border border-line bg-white transition-all duration-500 hover:border-line-2"
    >
      <div className="relative aspect-square overflow-hidden bg-paper-2">
        <Image
          src={speciesImage(tree.species)}
          alt={`Tree #${tree.tokenId} — ${species.name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          priority={priority}
          className="scale-[0.94] object-contain p-3 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-100"
        />
        <div className="absolute left-3 top-3">
          <RarityBadge rarity={tree.rarity} />
        </div>
        {tree.genesis && (
          <div className="absolute right-3 top-3 rounded-full border border-line bg-paper/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-ink-3 backdrop-blur-sm">
            Genesis
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 border-t border-line p-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="num text-[13px] text-ink">#{tree.tokenId}</span>
          <span className="text-[13px] text-ink-2">{species.name}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <StageBadge stage={tree.stage} />
          <span className="num text-[11.5px] text-ink-3">{tree.forest}</span>
        </div>
      </div>
    </Link>
  );
}

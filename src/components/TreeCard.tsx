import Image from "next/image";
import Link from "next/link";
import { SPECIES, tokenImage, type Tree } from "@/lib/data";
import { RarityBadge, StageBadge } from "./ui";

export default function TreeCard({ tree, priority = false }: { tree: Tree; priority?: boolean }) {
  const species = SPECIES.find((s) => s.id === tree.species)!;

  return (
    <Link
      href={`/tree/${tree.id}`}
      className="group flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden rounded-[14px] bg-paper-2">
        <Image
          src={tokenImage(tree.id, 4)}
          alt={`Tree #${tree.tokenId} — ${species.name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          priority={priority}
          unoptimized
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
        />
        <div className="absolute left-2.5 top-2.5">
          <RarityBadge rarity={tree.rarity} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-3">
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

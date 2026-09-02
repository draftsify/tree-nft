import { STAGE_LABEL, treeByIndex } from "@/lib/artwork";
import { PARTNER } from "@/lib/data";

/**
 * The metadata a marketplace reads, at the shape the contract resolves:
 * `{baseURI}{artworkIndex}/{stage}.json`.
 *
 * Traits are identical across the four stages; only the image and the stage
 * attributes move. Nothing is rewritten when a token advances, because the
 * contract simply asks for a different file.
 *
 * The impact block is present and null. Omitting it would hide the shape;
 * filling it with an estimate would be a claim nobody has verified.
 */

export const runtime = "nodejs";

function origin(request: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function parseStage(raw: string) {
  const n = Number(raw.replace(/\.json$/i, ""));
  return Number.isInteger(n) && n >= 1 && n <= 4 ? n : null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ index: string; stage: string }> },
) {
  const { index: rawIndex, stage: rawStage } = await params;

  const index = Number(rawIndex);
  const stage = parseStage(rawStage);
  const tree = treeByIndex(index);

  if (!tree || stage === null) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const base = origin(request);
  const label = STAGE_LABEL[stage - 1];

  return Response.json(
    {
      name: `${tree.name} — ${label}`,
      description:
        `A collectible tree from the Tree Genesis Forest. ` +
        `60% of the mint that issued this token was sent to ${PARTNER.name} in ` +
        `the same transaction. The stage follows the collection's cumulative ` +
        `donation, read from the contract, and no key can advance it.`,
      image: `${base}/api/nft/${index}/${stage}.png`,
      external_url: `${base}/tree/${tree.number}`,
      attributes: [
        { trait_type: "Species", value: capitalise(tree.species) },
        { trait_type: "Rarity", value: tree.rarity },
        { trait_type: "Region", value: tree.region },
        { trait_type: "Forest", value: tree.forest },
        { trait_type: "Season", value: tree.season },
        { trait_type: "Canopy", value: tree.canopy },
        { trait_type: "Trunk", value: tree.trunk },
        { trait_type: "Effect", value: tree.effect },
        { trait_type: "Collection", value: tree.genesis ? "Genesis" : "—" },
        { trait_type: "Stage", value: label },
        { display_type: "number", trait_type: "Stage number", value: stage },
        { display_type: "number", trait_type: "Mint number", value: tree.number },
      ],
      impact: {
        donationRecipient: PARTNER.address,
        donationTransaction: null,
        treesFunded: null,
        plantingProject: null,
        plantingRegion: null,
        plantingReport: null,
        verifiedAt: null,
      },
    },
    {
      headers: {
        // The stage changes which file is requested, never what a file says.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}

function capitalise(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

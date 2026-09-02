import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import {
  EFFECT_WASH,
  FOREST_GROUND,
  seasonGrade,
  STAGE_SCALE,
  framing,
  masterFile,
  treeByIndex,
} from "@/lib/artwork";

/**
 * Renders one token's artwork at one stage.
 *
 * Composed rather than stored: four thousand files would have to live
 * somewhere, and the inputs are eighteen photographs plus a handful of numbers
 * that come from the token's own traits. The result is deterministic, so the
 * response is marked immutable and each image is built at most once before the
 * CDN takes over.
 *
 *   /api/nft/0/1.png … /api/nft/999/4.png
 */

export const runtime = "nodejs";

const SIZE = 1000;
/** Where the trunk sits, as a fraction of the frame height. */
const GROUND_Y = 0.9;

function parseStage(raw: string) {
  const n = Number(raw.replace(/\.png$/i, ""));
  return Number.isInteger(n) && n >= 1 && n <= 4 ? n : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ index: string; stage: string }> },
) {
  const { index: rawIndex, stage: rawStage } = await params;

  const index = Number(rawIndex);
  const stage = parseStage(rawStage);
  const tree = treeByIndex(index);

  if (!tree || stage === null) {
    return new Response("Not found", { status: 404 });
  }

  const ground = FOREST_GROUND[tree.forest] ?? "#eceae2";
  const grade = seasonGrade(tree);
  const wash = EFFECT_WASH[tree.effect] ?? null;
  const { dx, dy } = framing(tree);

  // The tree itself: regraded for season, then scaled for the stage.
  const master = await readFile(
    path.join(process.cwd(), "public", "masters", masterFile(tree)),
  );
  const target = Math.round(SIZE * STAGE_SCALE[stage - 1]);
  const subject = await sharp(master)
    .modulate(grade)
    .resize({ width: target, height: target, fit: "inside" })
    .toBuffer();
  const { width = target, height = target } = await sharp(subject).metadata();

  // Stand it on the ground line rather than centring it, so a Seed and a
  // Mature Tree share a horizon instead of floating at different heights.
  const left = Math.round((SIZE - width) / 2 + dx * SIZE);
  const top = Math.round(SIZE * GROUND_Y - height + dy * SIZE);

  const layers: OverlayOptions[] = [
    {
      input: Buffer.from(
        `<svg width="${SIZE}" height="${SIZE}">
           <defs>
             <radialGradient id="g" cx="50%" cy="88%" r="62%">
               <stop offset="0%" stop-color="#000" stop-opacity="0.07"/>
               <stop offset="100%" stop-color="#000" stop-opacity="0"/>
             </radialGradient>
           </defs>
           <ellipse cx="${SIZE / 2 + dx * SIZE}" cy="${SIZE * GROUND_Y}"
                    rx="${Math.max(60, width * 0.34)}" ry="${Math.max(10, width * 0.035)}"
                    fill="url(#g)"/>
         </svg>`,
      ),
      top: 0,
      left: 0,
    },
    { input: subject, top, left },
  ];

  if (wash) {
    layers.push({
      input: Buffer.from(
        `<svg width="${SIZE}" height="${SIZE}"><rect width="${SIZE}" height="${SIZE}" fill="${wash.colour}" opacity="${wash.opacity}"/></svg>`,
      ),
      top: 0,
      left: 0,
      blend: "overlay",
    });
  }

  const png = await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: ground,
    },
  })
    .composite(layers)
    .png({ compressionLevel: 9 })
    .toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      // Deterministic for a given token and stage, so it never needs revisiting.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

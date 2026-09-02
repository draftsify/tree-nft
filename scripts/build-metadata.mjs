#!/usr/bin/env node
/**
 * Builds the metadata the contract's tokenURI resolves to.
 *
 * The contract serves `{baseURI}{artworkIndex}/{stage}.json`, where
 * artworkIndex is 0-based and stage is 1–4. So each token gets a directory of
 * four files: the same traits throughout, a different image per stage. That is
 * how evolution works without any field being rewritten after the fact.
 *
 * Layout produced:
 *   metadata/0/1.json … metadata/0/4.json      ← artwork/base/0001.png
 *   metadata/999/1.json … metadata/999/4.json  ← artwork/base/1000.png
 *
 * Impact fields are present and null. They are not omitted, because a consumer
 * should see the shape and see that it is empty, and they are not filled with
 * an estimate, because nothing has been verified.
 *
 *   node scripts/build-metadata.mjs --image-base ar://<manifest-id>
 */

import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const OUT = "metadata";
const STAGES = [
  { n: 1, label: "Seed" },
  { n: 2, label: "Sapling" },
  { n: 3, label: "Young Tree" },
  { n: 4, label: "Mature Tree" },
];

/** Trait values are shown to buyers, so ids get their display casing back. */
const title = (s) => s[0].toUpperCase() + s.slice(1);

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : fallback;
}

/**
 * Where the stage images live. Placeholder until storage is chosen and the
 * upload returns a real identifier; the script prints a warning if unset.
 */
const IMAGE_BASE = arg("--image-base", "");
const EXTERNAL_BASE = arg("--external-base", "https://tree-nft-beta.vercel.app/tree");

async function main() {
  const raw = JSON.parse(await readFile("data/trees.json", "utf8"));
  const trees = raw.trees;

  if (!IMAGE_BASE) {
    console.warn(
      "No --image-base given. Writing placeholder image URIs; rerun before uploading.\n",
    );
  }

  await rm(OUT, { recursive: true, force: true });

  const manifest = [];

  for (const tree of trees) {
    // 1-based token number in data, 0-based index in the contract's maths.
    const index = tree.number - 1;
    const artwork = `${String(tree.number).padStart(4, "0")}`;

    for (const stage of STAGES) {
      const meta = {
        name: `${tree.name} — ${stage.label}`,
        description:
          "A collectible digital tree from the Tree Genesis Forest. " +
          "60% of the mint that issued this token was sent to One Tree Planted " +
          "in the same transaction. The token's stage follows the collection's " +
          "cumulative donation, read from the contract.",
        image: IMAGE_BASE
          ? `${IMAGE_BASE}/${artwork}/${stage.n}.png`
          : `PLACEHOLDER/${artwork}/${stage.n}.png`,
        external_url: `${EXTERNAL_BASE}/${tree.number}`,
        attributes: [
          { trait_type: "Species", value: title(tree.species) },
          { trait_type: "Rarity", value: tree.rarity },
          { trait_type: "Region", value: tree.region },
          { trait_type: "Forest", value: tree.forest },
          { trait_type: "Season", value: tree.season },
          { trait_type: "Canopy", value: tree.canopy },
          { trait_type: "Trunk", value: tree.trunk },
          { trait_type: "Effect", value: tree.effect },
          { trait_type: "Collection", value: tree.genesis ? "Genesis" : "—" },
          { trait_type: "Stage", value: stage.label },
          { display_type: "number", trait_type: "Stage number", value: stage.n },
          { display_type: "number", trait_type: "Mint number", value: tree.number },
        ],
        /**
         * Reserved and empty on purpose. Populated only from a verified
         * source; an estimate never goes in here.
         */
        impact: {
          donationTransaction: null,
          treesFunded: null,
          plantingProject: null,
          plantingRegion: null,
          plantingReport: null,
          verifiedAt: null,
        },
      };

      const dir = path.join(OUT, String(index));
      await mkdir(dir, { recursive: true });
      await writeFile(
        path.join(dir, `${stage.n}.json`),
        JSON.stringify(meta, null, 2) + "\n",
      );
    }

    // The provenance record commits the artwork order, so it hashes the
    // artwork filename against the index it was assigned.
    manifest.push(`${index}:${artwork}.png`);
  }

  const provenance = createHash("sha256").update(manifest.join("\n")).digest("hex");
  await writeFile(
    path.join(OUT, "provenance.txt"),
    manifest.join("\n") + `\n\nsha256: ${provenance}\n`,
  );

  console.log(`Wrote ${trees.length * STAGES.length} metadata files under ${OUT}/`);
  console.log(`Provenance hash: 0x${provenance}`);
  console.log("\nPass that hash to the deploy script as PROVENANCE_HASH.");
  if (!IMAGE_BASE) {
    console.log("Image URIs are placeholders. Rerun with --image-base once storage is live.");
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

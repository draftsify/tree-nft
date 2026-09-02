import { MINT, PARTNER } from "@/lib/data";

/**
 * Contract-level metadata, the shape OpenSea reads from `contractURI()`.
 *
 * Setting it here is what gives the collection its name, logo and banner
 * without anyone signing in to claim and edit the listing by hand. OpenSea
 * documents that this must be an ordinary HTTP URL rather than an IPFS one,
 * which is why it is a route on this site.
 *
 * The description says plainly what the token is and is not, because a
 * marketplace page is where most people will meet the project and it should
 * not read more confidently there than it does here.
 */

export const runtime = "nodejs";

function origin(request: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(request: Request) {
  const base = origin(request);

  return Response.json(
    {
      name: "Trees",
      description:
        `${MINT.supply.toLocaleString("en-US")} collectible trees on Robinhood Chain. ` +
        `60% of every mint is sent to ${PARTNER.name}'s public donation address ` +
        `inside the minting transaction itself, so the token and the donation ` +
        `share one transaction hash and neither has to be taken on trust.\n\n` +
        `A token's stage is a pure function of how much the collection has ` +
        `donated in total, read from the contract. There is no setter: no key, ` +
        `including the deployer's, can advance a token.\n\n` +
        `A Tree is a collectible. It pays no yield, carries no revenue share ` +
        `and confers no rights. Resale prices are set by the market. No number ` +
        `of trees planted is claimed, because the donations are anonymous and ` +
        `nobody has confirmed one.`,
      image: `${base}/brand/logo.webp`,
      banner_image: `${base}/brand/banner.webp`,
      featured_image: `${base}/brand/featured.webp`,
      external_link: base,
    },
    {
      headers: {
        // Collection copy can legitimately change; the artwork cannot.
        "Cache-Control": "public, max-age=300, s-maxage=3600",
      },
    },
  );
}

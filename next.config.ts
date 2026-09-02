import type { NextConfig } from "next";

/**
 * Response headers.
 *
 * A page that asks for a wallet signature and an ERC-20 approval is worth
 * hardening, and the specific risk is framing: an attacker who can put the mint
 * screen inside their own page can dress an approval up as something else. So
 * framing is refused outright, twice, because `X-Frame-Options` is what older
 * scanners read and `frame-ancestors` is what browsers actually enforce.
 *
 * There is deliberately no script or connect policy here. Privy loads its own
 * frames and talks to its own hosts, and a content policy written without
 * checking every one of them breaks wallet sign-in while looking like an
 * improvement. That is worth doing separately, verified against a real login,
 * rather than bundled into a header commit.
 */
const securityHeaders = [
  // Refuse to be framed. Both forms, for browsers and for scanners.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },

  // Never let a response be reinterpreted as a type it did not declare.
  { key: "X-Content-Type-Options", value: "nosniff" },

  // A wallet address in a path should not leak to third parties in a referer.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Nothing here uses these. Passkey and clipboard access are left alone
  // because Privy's sign-in depends on them.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },

  // Vercel already sends this; stating it keeps it true anywhere else.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // sharp composes the token artwork in a route handler, so it must stay a
  // real Node dependency rather than being bundled.
  serverExternalPackages: ["sharp"],

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp composes the token artwork in a route handler, so it must stay a
  // real Node dependency rather than being bundled.
  serverExternalPackages: ["sharp"],
};

export default nextConfig;

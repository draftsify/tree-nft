import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { WalletProvider } from "@/components/WalletProvider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://tree-nft.vercel.app",
  ),
  title: "Tree — a digital tree, a funded forest",
  description:
    "Mint a unique digital tree. A fixed share of every mint is routed to reforestation, with the donation transaction published on-chain. Collectible, not an investment.",
  openGraph: {
    title: "Tree — a digital tree, a funded forest",
    description:
      "Mint a unique digital tree. A fixed share of every mint funds real reforestation, verifiably.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable} h-full`}
    >
      <body className="min-h-full">
        <SmoothScroll />
        <WalletProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}

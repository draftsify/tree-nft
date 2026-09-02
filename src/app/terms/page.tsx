import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow, Provisional, Section } from "@/components/ui";
import { MINT, PARTNER, priceLabel } from "@/lib/data";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Terms and conditions for minting, holding and reselling a Tree token, and for the reforestation donations the mint funds.",
};

const UPDATED = "2 September 2026";

type Clause = { n: string; title: string; body: string[] };

const CLAUSES: Clause[] = [
  {
    n: "01",
    title: "Scope",
    body: [
      "These terms govern your use of this website and, once the mint is live, the minting and holding of a Tree token. The project is run pseudonymously; the contract and the addresses it pays out to are the accountable record, not a company name.",
      "By connecting a wallet or minting a token you accept these terms. If you do not accept them, do not mint.",
    ],
  },
  {
    n: "02",
    title: "What a Tree token is",
    body: [
      "A Tree token is a non-fungible token on Robinhood Chain, issued under the ERC-721 standard. It records a distinct artwork composition and an append-only funding record.",
      "It is a collectible. It is not a security, a share, a unit in a fund, a debt instrument, a deposit, or a claim on us or on any third party. It pays no yield, distributes no revenue, carries no voting or governance right, and entitles you to no goods or services.",
      "Nothing on this site is investment advice or an offer of securities. If you are unsure how a token is treated where you live, take your own advice before minting.",
    ],
  },
  {
    n: "03",
    title: "Eligibility",
    body: [
      "You must be of legal age in your jurisdiction and legally permitted to hold digital assets there.",
      "You must not be resident in, or acting on behalf of anyone in, a jurisdiction subject to comprehensive sanctions, and you must not appear on any applicable sanctions list. We may refuse or reverse access where we reasonably believe this clause is breached.",
    ],
  },
  {
    n: "04",
    title: "Minting",
    body: [
      `The mint price is ${priceLabel()} per token, plus network fees, paid in the project's own ERC-20. Supply is capped at ${MINT.supply.toLocaleString("en-US")} tokens and each wallet may mint at most ${MINT.perWallet}. Both caps are enforced by the contract.`,
      "Traits are assigned by the contract at mint and frozen in the same transaction. You cannot select a species, rarity or trait, and nothing can be rerolled or exchanged afterwards.",
      "Transactions on a blockchain are final. Once a mint confirms it cannot be reversed by us, and no refund is available. You are responsible for the accuracy of the address you mint to and for the security of your keys. We cannot recover a lost key, an unrecoverable wallet or a token sent to the wrong address.",
    ],
  },
  {
    n: "05",
    title: "Metadata and evolution",
    body: [
      "Species, rarity and traits are immutable after mint. The contract enforces this.",
      "The stage field and the funding record attached to a token are updatable by design. A token advances when the donation covering its batch settles, when the recipient organisation assigns that batch to a named site, and when a dated planting report is filed.",
      "Each update writes a new metadata version and leaves the previous version readable. We do not guarantee that any token will advance beyond its first stage, or that it will do so within any period. Planting is seasonal, and reports arrive when they arrive.",
    ],
  },
  {
    n: "06",
    title: "Reforestation donations",
    body: [
      `We send ${MINT.split[0].pct}% of gross mint revenue to the public crypto donation address published by ${PARTNER.name} (${PARTNER.url}), a reforestation non-profit. Donations are batched, and each transaction hash is published on the impact page on the day it settles.`,
      "These are anonymous donations to a public address, which anyone may make. There is no agreement, and none is required for a donation to be valid. Nothing needs to be taken on trust: the sending address, the receiving address, the amount and the timestamp are all on-chain and can be checked by anyone, at any time, without our involvement.",
      `${PARTNER.name} is not a partner, sponsor or affiliate of this project. It has not reviewed, approved or endorsed us, and it receives nothing from us other than the donation itself. Its acceptance of public donations creates no relationship between the organisation and you, and gives you no rights against it.`,
      "We do not state how many trees a mint funds, and we do not warrant that any number of trees will be planted, will survive, or will sequester any amount of carbon. Because the donations are anonymous, no report attributing planting to them should be expected, and a tree count will appear against a token only if one is ever confirmed.",
      "If the recipient stops accepting donations or changes its address, we will publish the change and name the replacement before sending further funds.",
    ],
  },
  {
    n: "07",
    title: "Resale and royalties",
    body: [
      "You may transfer or resell your token freely on any marketplace that supports the standard. We operate no marketplace and we are not party to any secondary sale.",
      `A creator fee of ${MINT.royaltyPct}% is declared on the contract under ERC-2981. Marketplaces choose whether to honour it; we cannot enforce payment.`,
      "Resale prices are set entirely by buyers and sellers. We make no representation about the price of a token at any time, and the price you receive may be less than you paid, or nothing.",
    ],
  },
  {
    n: "08",
    title: "The artwork",
    body: [
      "We retain copyright in the artwork and in the trait system that generates it.",
      "As the holder of a token, you receive a worldwide, non-exclusive, royalty-free licence to display the artwork of that token, to use it as a personal or profile image, and to include it in a listing when you offer the token for sale. The licence lasts as long as you hold the token and passes to the next holder on transfer.",
      "The licence does not permit you to use the artwork in a way that implies endorsement by us or by any organisation named on this site, or to use the Tree name and marks other than to identify the token.",
    ],
  },
  {
    n: "09",
    title: "Risks you accept",
    body: [
      "Smart contracts can contain defects. An audit reduces this risk but does not remove it. A defect may result in loss of your token or of funds.",
      "Robinhood Chain, the wallet infrastructure, the metadata storage and any marketplace are operated by third parties. Outages, changes or discontinuation at any of them can make a token unavailable, unreadable or untradable.",
      "Digital asset markets are volatile and largely unregulated. The regulatory treatment of collectible tokens may change, in ways that could restrict transfer or resale.",
      "You are solely responsible for your own tax position.",
    ],
  },
  {
    n: "10",
    title: "No warranty, and limits on liability",
    body: [
      'The site and the tokens are provided "as is" and "as available". To the fullest extent the law allows, we exclude all implied warranties, including fitness for a particular purpose and uninterrupted availability.',
      "To the fullest extent the law allows, our total liability to you in connection with these terms, the site or a token is limited to the amount you paid us to mint the tokens you hold. We are not liable for lost profits, lost value, or loss arising from a third party's act or omission.",
      "Nothing in these terms limits liability for fraud, for fraudulent misrepresentation, or for anything else that cannot lawfully be limited.",
    ],
  },
  {
    n: "11",
    title: "Things you must not do",
    body: [
      "Do not use the site or a token to launder money, to finance terrorism, to evade sanctions, or for any other unlawful purpose.",
      "Do not attempt to manipulate the mint, to circumvent the per-wallet cap through multiple addresses under your control, or to interfere with the contract, the site or its infrastructure.",
      "Do not present a Tree token as an investment, as a security, or as carrying an environmental claim that this site does not make.",
    ],
  },
  {
    n: "12",
    title: "Changes to these terms",
    body: [
      "We may change these terms. The version in force is the one published here, with its date at the top of the page. Material changes will be summarised on this page rather than applied silently.",
      "Changes do not alter the immutable properties of a token you already hold.",
    ],
  },
  {
    n: "13",
    title: "How to verify any of this",
    body: [
      "Every claim on this site that concerns money is settled on-chain and can be checked without asking us. The contract address, the address holding the reforestation share, and the recipient address are all published on the impact page, and the block explorer will show you every transfer between them.",
      "Where a statement cannot be verified that way, this site does not make it. That is why no tree count is printed and why the impact figures read zero until the corresponding transaction exists.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Section className="pb-14 pt-36 md:pt-44">
        <div className="flex flex-wrap items-center gap-3">
          <Eyebrow>Terms and conditions</Eyebrow>
          <Provisional>Draft</Provisional>
        </div>
        <h1 className="display mt-6 max-w-[16ch] text-[clamp(2.4rem,6vw,4.4rem)]">
          What you get, and what you do not.
        </h1>
        <p className="mt-6 max-w-[60ch] text-[15px] leading-relaxed text-ink-2">
          Last updated {UPDATED}. Published ahead of the mint so the position is
          legible before anything is deployed. The project is run pseudonymously
          and settles in public: where a clause makes a claim about money, the
          transaction backing it is on-chain and can be checked without us.
        </p>
      </Section>

      <Section className="pb-24">
        <div className="grid gap-x-16 gap-y-2 lg:grid-cols-[220px_1fr]">
          {/* contents */}
          <nav aria-label="Contents" className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">Contents</p>
            <ol className="mt-4 flex flex-col gap-1.5 lg:mb-0 mb-10">
              {CLAUSES.map((c) => (
                <li key={c.n}>
                  <a
                    href={`#clause-${c.n}`}
                    className="flex gap-3 text-[12.5px] leading-snug text-ink-3 transition-colors hover:text-ink"
                  >
                    <span className="num shrink-0">{c.n}</span>
                    <span>{c.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="border-t border-line">
            {CLAUSES.map((c) => (
              <section
                key={c.n}
                id={`clause-${c.n}`}
                className="scroll-mt-28 border-b border-line py-9"
              >
                <div className="flex gap-4">
                  <span className="num mt-1 shrink-0 text-[12px] text-ink-3">
                    {c.n}
                  </span>
                  <div className="min-w-0">
                    <h2 className="display text-[clamp(1.15rem,2vw,1.5rem)]">
                      {c.title}
                    </h2>
                    <div className="mt-3 flex flex-col gap-3">
                      {c.body.map((p, i) => (
                        <p
                          key={i}
                          className="max-w-[68ch] text-[14px] leading-relaxed text-ink-2"
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ))}

            <p className="max-w-[68ch] py-9 text-[12.5px] leading-relaxed text-ink-3">
              A summary is not a substitute for the clauses above, but the short
              version is this: you are buying a collectible, not an investment;
              the mint is final; most of the money goes to a reforestation
              non-profit and the transaction is published; and we do not claim a
              number of trees that nobody has confirmed. See the{" "}
              <Link
                href="/impact"
                className="text-ink underline underline-offset-4 hover:text-moss"
              >
                impact ledger
              </Link>{" "}
              for what has actually been sent.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}

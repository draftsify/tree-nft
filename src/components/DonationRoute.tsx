import { Eyebrow } from "@/components/ui";
import { DONATION_ROUTE, PARTNER, PAYMENT, RESERVE } from "@/lib/data";

/**
 * The route a mint takes to the charity.
 *
 * It exists because only the first step is enforced by the contract. The rest
 * is us moving money, and a page that let a reader assume otherwise would be
 * the dishonest version of this project. So the steps are numbered, each is
 * marked as automatic or manual, and the manual ones say what gets published.
 */
export default function DonationRoute() {
  return (
    <div className="border-t border-line pt-10">
      <div className="grid gap-10 md:grid-cols-[1fr_1.7fr]">
        <div>
          <Eyebrow>The route</Eyebrow>
          <h2 className="display mt-5 max-w-[15ch] text-[clamp(1.6rem,3.4vw,2.4rem)]">
            How a mint reaches the charity.
          </h2>
          <p className="mt-4 max-w-[38ch] text-[14px] leading-relaxed text-ink-2">
            The mint settles in {PAYMENT.symbol} on {RESERVE.chain}. Charity
            donation addresses accept what they can realise, which in practice
            means mainnet ETH. So the share is converted and bridged before it
            is sent, and each step is published.
          </p>
        </div>

        <ol className="border-t border-line">
          {DONATION_ROUTE.map((step) => (
            <li key={step.n} className="border-b border-line py-6">
              <div className="flex gap-4">
                <span className="num mt-0.5 shrink-0 text-[12px] text-ink-3">
                  {step.n}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-[15px] font-medium text-ink">
                      {step.title}
                    </h3>
                    <span
                      className={`text-[10px] font-medium uppercase tracking-[0.12em] ${
                        step.trust === "us" ? "text-ink-3" : "text-moss"
                      }`}
                    >
                      {step.trust === "contract"
                        ? "Enforced by the contract"
                        : step.trust === "permissionless"
                          ? "Anyone can trigger"
                          : "Done by us"}
                    </span>
                  </div>
                  <p className="mt-2 max-w-[62ch] text-[13.5px] leading-relaxed text-ink-2">
                    {step.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-6 max-w-[80ch] text-[12.5px] leading-relaxed text-ink-3">
        <span className="text-ink-2">Be clear about what this costs.</span> No
        step on this list is a wallet of ours moving money. The split is
        enforced by the mint contract; the other four are calls anyone can make,
        that take no destination, and that pay the caller nothing. The
        reforestation reserve is a contract with no owner, no withdraw and no
        setter, so the money it holds has exactly one exit and it ends at{" "}
        {PARTNER.name}.
        <br />
        <br />
        What is left to trust is narrower, and worth stating rather than
        burying. The reserve is deployed by us, so its code and its immutable
        destination are what you are checking, once, before you mint — not our
        conduct afterwards. A sale open to anyone can be sandwiched: the price
        floor written into the contract bounds how badly, but does not reduce it
        to zero. And a bridged amount is not a delivered one until the
        withdrawal is completed on Ethereum, about a week later, so ETH sitting
        in transit is normal rather than a warning sign.
      </p>
    </div>
  );
}

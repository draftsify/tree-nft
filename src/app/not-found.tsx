import Image from "next/image";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";

export default function NotFound() {
  return (
    <Section className="pb-32 pt-40 md:pt-52">
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-paper-2 px-6 py-24 text-center md:px-16">
        <Image
          src="/tree/tree-sm.webp"
          alt=""
          aria-hidden
          width={560}
          height={550}
          className="pointer-events-none absolute -bottom-[24%] left-1/2 w-[min(680px,120%)] -translate-x-1/2 opacity-[0.12]"
        />
        <div className="relative">
          <Eyebrow>404</Eyebrow>
          <h1 className="display mx-auto mt-6 max-w-[13ch] text-[clamp(2rem,5.4vw,3.6rem)]">
            This page does not exist.
          </h1>
          <p className="mx-auto mt-5 max-w-[42ch] text-[14.5px] leading-relaxed text-ink-2">
            The address you requested could not be found.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <ButtonLink href="/" size="lg">
              Back to the start
            </ButtonLink>
            <ButtonLink href="/collection" variant="outline" size="lg">
              Browse the collection
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}

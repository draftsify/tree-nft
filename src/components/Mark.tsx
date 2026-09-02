/**
 * The brand mark.
 *
 * The logo arrives as a white-on-transparent bitmap, so it is applied as a CSS
 * mask rather than drawn as an <img>: the shape comes from the file's alpha and
 * the colour comes from `currentColor`. That way one asset works as ink on the
 * paper nav and as sage on the dark footer, and it inherits hover colours for
 * free.
 */
export default function Mark({
  className = "size-[22px]",
}: {
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label="Tree"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        maskImage: "url(/brand/mark.png)",
        WebkitMaskImage: "url(/brand/mark.png)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

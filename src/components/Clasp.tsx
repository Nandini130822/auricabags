/**
 * Aurica's signature "clutch clasp" frame: a gold frame bar across the top of a photo
 * with a kiss-lock clasp (two gold knobs) sitting on it, like an evening frame clutch.
 * Wrap the photo box in it; the photo box keeps its own size/aspect classes.
 */
export function Clasp({
  children,
  size = "sm",
  className = "",
}: {
  children: React.ReactNode;
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <div className={`clasp clasp-${size} ${className}`}>
      <span aria-hidden className="clasp-lock">
        <i />
        <i />
      </span>
      {children}
    </div>
  );
}

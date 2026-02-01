import Link from "next/link";
import { cn } from "@/lib/utils";

/** Prop IX logo image (three teal triangles + "PROP IX" text). Transparent background to match header. */
export function PropIxLogo({
  className,
  href = "/",
  size = "md",
}: {
  className?: string;
  href?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const height = size === "sm" ? 44 : size === "lg" ? 72 : 56;

  const content = (
    <span
      className={cn(
        "inline-flex items-center justify-center bg-transparent",
        className
      )}
      style={{ minHeight: height }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Prop IX"
        className="h-auto w-auto object-contain select-none"
        style={{ height: `${height}px`, width: "auto", display: "block" }}
      />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity inline-flex">
        {content}
      </Link>
    );
  }
  return content;
}

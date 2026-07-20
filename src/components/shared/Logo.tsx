import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/images/printoe-logo.png";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  priority?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative z-10 inline-flex shrink-0 items-center focus-ring rounded-md",
        className,
      )}
      aria-label="Printoe home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_SRC}
        alt="Printoe"
        width={160}
        height={78}
        className="block h-10 w-[130px] object-contain object-left md:h-12 md:w-[155px]"
      />
    </Link>
  );
}

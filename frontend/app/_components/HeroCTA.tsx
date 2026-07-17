import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroCTAProps {
  isAuthenticated: boolean;
  startLabel: string;
  returningLabel: string;
  showArrow?: boolean;
  className?: string;
}

export default function HeroCTA({
  isAuthenticated,
  startLabel,
  returningLabel,
  showArrow,
  className,
}: HeroCTAProps) {
  return (
    <Link href={isAuthenticated ? "/dashboard" : "/signup"} className={className}>
      {isAuthenticated ? returningLabel : startLabel}
      {showArrow && (
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      )}
    </Link>
  );
}

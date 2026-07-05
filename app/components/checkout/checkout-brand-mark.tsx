import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import { cn } from "@/lib/utils";

type CheckoutBrandMarkProps = {
  itemCount: number;
  className?: string;
};

export function CheckoutBrandMark({ itemCount, className }: CheckoutBrandMarkProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background shadow-sm"
          aria-hidden
        >
          <svg viewBox="0 0 32 32" className="size-6 text-foreground" fill="none">
            <path
              d="M9 8h9.2c4.2 0 6.8 2.4 6.8 6.1 0 2.6-1.2 4.5-3.4 5.5L24 24H19l-4.8-7.2H14V24H9V8zm5 3.5V13h3.8c1.8 0 2.8-.9 2.8-2.3S19.6 8.5 17.8 8.5H14z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-[0.22em] text-foreground uppercase">
            {SITE_NAME}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{SITE_TAGLINE}</p>
        </div>
      </div>

      <span className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {itemCount} {itemCount === 1 ? "peça" : "peças"}
      </span>
    </div>
  );
}
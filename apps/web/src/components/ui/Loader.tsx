import { cn } from "@/lib/cn";

/** The studio's loading motif — a gold segment sliding under a hairline track. */
export function Loader({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("relative block h-px w-24 overflow-hidden bg-[color:var(--color-line-strong)]", className)}
    >
      <span className="absolute inset-y-0 left-0 w-1/3 animate-[stilio-loader_1.4s_ease-in-out_infinite] bg-[color:var(--color-gold)] motion-reduce:animate-none" />
      <style>{`@keyframes stilio-loader{0%{transform:translateX(-120%)}100%{transform:translateX(360%)}}`}</style>
    </span>
  );
}

/** Inline spinner — a small square turning slowly, for tight spaces. */
export function Spark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-2.5 w-2.5 animate-[stilio-spark_2.4s_linear_infinite] bg-[color:var(--color-gold-ink)] motion-reduce:animate-none",
        className,
      )}
    >
      <style>{`@keyframes stilio-spark{to{transform:rotate(360deg)}}`}</style>
    </span>
  );
}

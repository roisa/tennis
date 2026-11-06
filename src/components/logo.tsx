/** Original COURTSCAPE mark: a low sun rising over a court in perspective. */
export function Mark({ className = "h-7 w-7", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const line = tone === "light" ? "#F1EFE7" : "#152D28";
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M8.5 15a7.5 7.5 0 0 1 15 0z" fill="#C7E45B" />
      <path d="M3 15.5h26M10 15.5 5 29M22 15.5 27 29M16 15.5V29M7.4 22.5h17.2" stroke={line} strokeWidth="1.6" fill="none" strokeLinecap="square" />
    </svg>
  );
}

export function Wordmark({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark tone={tone} />
      <span className={`font-sans text-[15px] font-bold tracking-[0.32em] ${tone === "light" ? "text-ivory" : "text-forest"}`}>
        COURT<span className="font-medium">SCAPE</span>
      </span>
    </span>
  );
}

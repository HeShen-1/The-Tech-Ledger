"use client";

export function LiveIndicator() {
  return (
    <div className="flex items-center gap-2" aria-label="Live status">
      <span className="inline-block h-2.5 w-2.5 flex-shrink-0 animate-pulse-soft bg-[#22C55E]" aria-hidden="true" />
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#111111]">LIVE</span>
    </div>
  );
}

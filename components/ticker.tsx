"use client";

import type { Signal } from "@/lib/types";

const sourceMeta: Record<Signal["source"], { label: string; noun: string }> = {
  github: { label: "GitHub", noun: "REPOSITORIES" },
  hackernews: { label: "Hacker News", noun: "DISCUSSIONS" },
  arxiv: { label: "arXiv", noun: "PAPERS" },
  blog: { label: "Tech Blogs", noun: "ARTICLES" },
};

const star = (
  <span className="text-[#CC0000]" aria-hidden="true">★</span>
);

const divider = (
  <span className="mx-12 text-neutral-600">│</span>
);

export function Ticker({ signals }: { signals: Signal[] }) {
  const counts = new Map<Signal["source"], number>();
  for (const s of signals) {
    counts.set(s.source, (counts.get(s.source) ?? 0) + 1);
  }

  const keys = Object.keys(sourceMeta) as Signal["source"][];

  const segments = keys.map((key, i) => {
    const count = counts.get(key) ?? 0;
    return (
      <span key={key} className="inline-flex items-center gap-3 whitespace-nowrap">
        {i > 0 && divider}
        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#F9F9F7]">
          {sourceMeta[key].label}
        </span>
        {star}
        <span className="font-mono text-xs font-bold tracking-[0.15em] text-[#F9F9F7]">
          {count}
        </span>
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#737373]">
          {sourceMeta[key].noun}
        </span>
      </span>
    );
  });

  // Build one copy with start/end spacers for seamless seam
  const copy = (
    <span className="inline-flex items-center px-12">
      {segments}
    </span>
  );

  return (
    <div
      className="relative w-full overflow-hidden bg-[#111111]"
      style={{ height: 44 }}
      aria-label="Live trending ticker"
    >
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-scroll 30s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
      <div className="ticker-track h-full items-center">
        {copy}
        {copy}
      </div>
    </div>
  );
}

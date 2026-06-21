"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { SourceStatus, Signal } from "@/lib/types";
import { Activity } from "lucide-react";

function StatusDot({ count }: { count: number }) {
  const bg = count <= 3 ? "#EF4444" : count <= 6 ? "#F59E0B" : "#22C55E";
  const label = count <= 3 ? "Low" : count <= 6 ? "Medium" : "High";
  return <span className="inline-block h-2 w-2 flex-shrink-0" style={{ backgroundColor: bg }} aria-label={label} />;
}

const sourceMap: Record<string, Signal["source"]> = {
  "GitHub Trending": "github",
  "Hacker News": "hackernews",
  "arXiv Papers": "arxiv",
  "Tech Blogs": "blog",
};

export function SourceBreakdown({ sources, signals }: { sources: SourceStatus[]; signals: Signal[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  // Compute deduped counts from signals
  const counts = sources.map((s) => {
    const key = sourceMap[s.name];
    return signals.filter((sig) => sig.source === key).length;
  });
  const maxCount = Math.max(...counts, 1);

  return (
    <div ref={ref}>
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-[#737373]" strokeWidth={1.5} />
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">Source Desk</h3>
      </div>

      <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
        {sources.map((source, i) => {
          const count = counts[i];
          return (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`border-[#111111] bg-[#F9F9F7] p-4 transition-all duration-200 hover:bg-[#F5F5F5]
                ${i % 2 === 0 ? "sm:border-r" : ""}
                ${i !== 3 ? "lg:border-r" : ""}
                border-b sm:border-b border-t border-l
                ${i === 0 ? "sm:border-l" : ""}
              `}
            >
              <span className="font-serif text-sm font-bold text-[#111111]">{source.name}</span>
              <div className="mt-2 h-6 w-full origin-bottom bg-[#E5E5E0]">
                <div
                  className="h-full bg-[#111111] transition-transform duration-500"
                  style={{ transform: `scaleX(${inView ? count / maxCount : 0})`, transformOrigin: "left" }}
                />
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#737373]">
                  {count <= 3 ? "Low Activity" : count <= 6 ? "Moderate" : "Active"}
                </span>
                <span className="flex items-center gap-1.5">
                  <StatusDot count={count} />
                  <span className="font-serif text-lg font-black text-[#111111]">{count}</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
